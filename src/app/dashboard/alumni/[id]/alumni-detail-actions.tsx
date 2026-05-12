"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  updateAlumniAction,
  updateAlumniStatusAction,
  assignAlumniCoordinatorAction,
  createAlumniActivityAction,
} from "@/actions/alumni";
import { getCoordinatorsAction } from "@/actions/companies";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";
import {
  Plus, RefreshCw, Pencil, UserCheck,
} from "lucide-react";
import type { SessionPayload } from "@/lib/auth";
import type { Alumni, AlumniStatus } from "@prisma/client";

// ─── Shared option lists ───────────────────────────────────

const ACTIVITY_TYPE_OPTIONS = [
  { value: "EMAIL", label: "Email" },
  { value: "CALL", label: "Call" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "MEETING", label: "Meeting" },
  { value: "NOTE", label: "Note" },
];

const STATUS_OPTIONS: { value: AlumniStatus; label: string }[] = [
  { value: "NOT_CONTACTED", label: "Not Contacted" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "RESPONDED", label: "Responded" },
  { value: "INTERESTED", label: "Interested" },
  { value: "REFERRED", label: "Referred" },
  { value: "NOT_INTERESTED", label: "Not Interested" },
  { value: "INACTIVE", label: "Inactive" },
];

const BRANCH_OPTIONS = [
  { value: "CSE", label: "Computer Science" },
  { value: "IT", label: "Information Technology" },
  { value: "ECE", label: "Electronics & Communication" },
  { value: "EE", label: "Electrical Engineering" },
  { value: "ME", label: "Mechanical Engineering" },
  { value: "CE", label: "Civil Engineering" },
  { value: "CH", label: "Chemical Engineering" },
  { value: "OTHER", label: "Other" },
];

const currentYear = new Date().getFullYear();
const BATCH_OPTIONS = Array.from({ length: currentYear + 4 - 2008 + 1 }, (_, i) => {
  const year = currentYear + 4 - i;
  return { value: String(year), label: String(year) };
});

// ─── Main header actions ───────────────────────────────────

interface AlumniDetailActionsProps {
  alumni: Pick<Alumni, "id" | "name" | "batch" | "branch" | "currentCompany" | "designation" | "linkedin" | "email" | "phone" | "city" | "willingToHelp" | "referralCapability" | "currentStatus" | "notes" | "assignedCoordinatorId">;
  session: SessionPayload | null;
}

export function AlumniDetailActions({ alumni, session }: AlumniDetailActionsProps) {
  const [activityOpen, setActivityOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const canAssign = session?.role === "ADMIN" || session?.role === "CDC_HEAD";

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </Button>
      <Button variant="outline" size="sm" onClick={() => setStatusOpen(true)}>
        <RefreshCw className="h-3.5 w-3.5" />
        Update Status
      </Button>
      {canAssign && (
        <Button variant="outline" size="sm" onClick={() => setAssignOpen(true)}>
          <UserCheck className="h-3.5 w-3.5" />
          Assign
        </Button>
      )}
      <Button size="sm" onClick={() => setActivityOpen(true)}>
        <Plus className="h-3.5 w-3.5" />
        Log Activity
      </Button>

      <EditAlumniModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        alumni={alumni}
      />
      <LogActivityModal
        open={activityOpen}
        onClose={() => setActivityOpen(false)}
        alumniId={alumni.id}
      />
      <UpdateStatusModal
        open={statusOpen}
        onClose={() => setStatusOpen(false)}
        alumniId={alumni.id}
        currentStatus={alumni.currentStatus}
      />
      {canAssign && (
        <AssignCoordinatorModal
          open={assignOpen}
          onClose={() => setAssignOpen(false)}
          alumniId={alumni.id}
          currentAssigneeId={alumni.assignedCoordinatorId}
        />
      )}
    </div>
  );
}

// ─── Edit Alumni Modal ────────────────────────────────────

const editAlumniSchema = z.object({
  name: z.string().min(1, "Name is required"),
  batch: z.string().min(1, "Batch is required"),
  branch: z.string().min(1, "Branch is required"),
  currentCompany: z.string().optional(),
  designation: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
  city: z.string().optional(),
  willingToHelp: z.boolean().default(false),
  referralCapability: z.boolean().default(false),
  notes: z.string().optional(),
});
type EditAlumniData = z.infer<typeof editAlumniSchema>;

function EditAlumniModal({
  open, onClose, alumni,
}: {
  open: boolean;
  onClose: () => void;
  alumni: AlumniDetailActionsProps["alumni"];
}) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<EditAlumniData>({
    resolver: zodResolver(editAlumniSchema) as never,
    defaultValues: {
      name: alumni.name,
      batch: String(alumni.batch),
      branch: alumni.branch,
      currentCompany: alumni.currentCompany ?? "",
      designation: alumni.designation ?? "",
      email: alumni.email ?? "",
      phone: alumni.phone ?? "",
      linkedin: alumni.linkedin ?? "",
      city: alumni.city ?? "",
      willingToHelp: alumni.willingToHelp,
      referralCapability: alumni.referralCapability,
      notes: alumni.notes ?? "",
    },
  });

  const onSubmit = (data: EditAlumniData) => {
    startTransition(async () => {
      const payload = { ...data, batch: parseInt(data.batch) };
      const result = await updateAlumniAction(alumni.id, payload);
      if (result.error) toast.error(result.error);
      else { toast.success("Alumni updated!"); onClose(); }
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Alumni Profile" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Full Name" required error={errors.name?.message} {...register("name")} />
          </div>
          <Select label="Year of Admission" required options={BATCH_OPTIONS} error={errors.batch?.message} {...register("batch")} />
          <Select label="Branch" required options={BRANCH_OPTIONS} error={errors.branch?.message} {...register("branch")} />
          <Input label="Current Company" {...register("currentCompany")} />
          <Input label="Designation" {...register("designation")} />
          <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <Input label="Phone" {...register("phone")} />
          <Input label="LinkedIn" error={errors.linkedin?.message} {...register("linkedin")} />
          <Input label="City" {...register("city")} />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" {...register("willingToHelp")} className="rounded" />
            Willing to help with placements
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" {...register("referralCapability")} className="rounded" />
            Can provide referrals
          </label>
        </div>
        <Textarea label="Notes" {...register("notes")} />
        <div className="flex justify-end gap-2 border-t border-zinc-800 pt-3">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isPending}>Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Log Activity Modal ────────────────────────────────────

const activitySchema = z.object({
  alumniId: z.string(),
  type: z.string().min(1, "Required"),
  summary: z.string().min(1, "Required"),
  notes: z.string().optional(),
  nextAction: z.string().optional(),
  nextFollowUpDate: z.string().optional(),
});
type ActivityData = z.infer<typeof activitySchema>;

function LogActivityModal({ open, onClose, alumniId }: { open: boolean; onClose: () => void; alumniId: string }) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ActivityData>({
    resolver: zodResolver(activitySchema) as never,
    defaultValues: { alumniId },
  });

  const onSubmit = (data: ActivityData) => {
    startTransition(async () => {
      const result = await createAlumniActivityAction(data);
      if (result.error) toast.error(result.error);
      else { toast.success("Activity logged!"); reset(); onClose(); }
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Log Activity" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register("alumniId")} />
        <Select label="Activity Type" required options={ACTIVITY_TYPE_OPTIONS} error={errors.type?.message} {...register("type")} />
        <Input label="Summary" required placeholder="Brief description" error={errors.summary?.message} {...register("summary")} />
        <Textarea label="Notes" placeholder="Detailed notes..." {...register("notes")} />
        <Input label="Next Action" placeholder="What needs to happen next?" {...register("nextAction")} />
        <Input label="Next Follow-up Date" type="date" {...register("nextFollowUpDate")} />
        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isPending}>Log Activity</Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Update Status Modal ───────────────────────────────────

const statusSchema = z.object({
  newStatus: z.string(),
});
type StatusData = z.infer<typeof statusSchema>;

function UpdateStatusModal({ open, onClose, alumniId, currentStatus }: {
  open: boolean; onClose: () => void; alumniId: string; currentStatus: AlumniStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<StatusData>({
    resolver: zodResolver(statusSchema) as never,
    defaultValues: { newStatus: currentStatus },
  });

  const onSubmit = (data: StatusData) => {
    startTransition(async () => {
      const result = await updateAlumniStatusAction(alumniId, data.newStatus as AlumniStatus);
      if (result.error) toast.error(result.error);
      else { toast.success("Status updated!"); onClose(); }
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Update Status" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select label="New Status" required options={STATUS_OPTIONS} error={errors.newStatus?.message} {...register("newStatus")} />
        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isPending}>Update Status</Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Assign Coordinator Modal ──────────────────────────────

type CoordinatorOption = { id: string; name: string; role: string };

function AssignCoordinatorModal({
  open, onClose, alumniId, currentAssigneeId,
}: {
  open: boolean;
  onClose: () => void;
  alumniId: string;
  currentAssigneeId: string | null;
}) {
  const [coordinators, setCoordinators] = useState<CoordinatorOption[]>([]);
  const [selectedId, setSelectedId] = useState<string>(currentAssigneeId ?? "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setSelectedId(currentAssigneeId ?? "");
    getCoordinatorsAction().then((res) => {
      if (res.users) setCoordinators(res.users);
    });
  }, [open, currentAssigneeId]);

  const handleSave = () => {
    startTransition(async () => {
      const result = await assignAlumniCoordinatorAction(
        alumniId,
        selectedId === "" ? null : selectedId
      );
      if (result.error) toast.error(result.error);
      else {
        toast.success(selectedId ? "Coordinator assigned!" : "Coordinator removed");
        onClose();
      }
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Assign Coordinator" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-zinc-500">
          Choose a coordinator to assign this alumni to. Only ADMIN and CDC Head can do this.
        </p>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
            Coordinator
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">— Unassigned —</option>
            {coordinators.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role.replace(/_/g, " ")})
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2 border-t border-zinc-800 pt-3">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button loading={isPending} onClick={handleSave}>
            <UserCheck className="h-3.5 w-3.5" />
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
