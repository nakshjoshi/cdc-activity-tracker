"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  createActivityAction,
  createContactAction,
  updateContactAction,
  deleteContactAction,
  updateCompanyStatusAction,
  updateCompanyAction,
  assignCoordinatorAction,
  getCoordinatorsAction,
} from "@/actions/companies";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";
import {
  Plus, RefreshCw, UserPlus, Pencil, Trash2, Star, Mail, Phone, Link2, UserCheck,
} from "lucide-react";
import type { SessionPayload } from "@/lib/auth";
import type { Company, CompanyStatus, Contact } from "@prisma/client";

// ─── Shared option lists ───────────────────────────────────

const ACTIVITY_TYPE_OPTIONS = [
  { value: "EMAIL", label: "Email" },
  { value: "CALL", label: "Call" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "MEETING", label: "Meeting" },
  { value: "PPT", label: "PPT" },
  { value: "FOLLOWUP", label: "Follow-up" },
  { value: "OA_DISCUSSION", label: "OA Discussion" },
  { value: "INTERVIEW_COORDINATION", label: "Interview Coordination" },
  { value: "INTERNAL_DISCUSSION", label: "Internal Discussion" },
  { value: "NOTE", label: "Note" },
];

const STATUS_OPTIONS: { value: CompanyStatus; label: string }[] = [
  { value: "LEAD_FOUND", label: "Lead Found" },
  { value: "COLD_OUTREACH_PENDING", label: "Cold Outreach Pending" },
  { value: "COLD_EMAIL_SENT", label: "Cold Email Sent" },
  { value: "FOLLOWUP_PENDING", label: "Follow-up Pending" },
  { value: "FOLLOWUP_DONE", label: "Follow-up Done" },
  { value: "INTERESTED", label: "Interested" },
  { value: "PPT_SCHEDULED", label: "PPT Scheduled" },
  { value: "OA_SCHEDULED", label: "OA Scheduled" },
  { value: "INTERVIEW_SCHEDULED", label: "Interview Scheduled" },
  { value: "HIRING_IN_PROGRESS", label: "Hiring In Progress" },
  { value: "OFFER_RELEASED", label: "Offer Released" },
  { value: "REJECTED", label: "Rejected" },
  { value: "NO_RESPONSE", label: "No Response" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "CLOSED", label: "Closed" },
];

const COMPANY_TYPE_OPTIONS = [
  { value: "PRODUCT", label: "Product" },
  { value: "SERVICE", label: "Service" },
  { value: "STARTUP", label: "Startup" },
  { value: "MNC", label: "MNC" },
  { value: "PSU", label: "PSU" },
  { value: "NGO", label: "NGO" },
  { value: "CONSULTANCY", label: "Consultancy" },
  { value: "FINTECH", label: "Fintech" },
  { value: "EDTECH", label: "Edtech" },
  { value: "HEALTHTECH", label: "Healthtech" },
  { value: "OTHER", label: "Other" },
];

const DESIGNATION_OPTIONS = [
  { value: "HR Manager", label: "HR Manager" },
  { value: "HR Executive", label: "HR Executive" },
  { value: "Talent Acquisition Lead", label: "Talent Acquisition Lead" },
  { value: "Campus Hiring Lead", label: "Campus Hiring Lead" },
  { value: "Founder", label: "Founder" },
  { value: "Co-Founder", label: "Co-Founder" },
  { value: "CTO", label: "CTO" },
  { value: "Engineering Manager", label: "Engineering Manager" },
  { value: "Recruiter", label: "Recruiter" },
  { value: "Other", label: "Other" },
];

// ─── Main header actions ───────────────────────────────────

interface CompanyDetailActionsProps {
  company: Pick<Company, "id" | "companyName" | "currentStatus" | "domain" | "website" | "linkedin" | "companyType" | "industry" | "city" | "state" | "country" | "notes" | "assignedCoordinatorId">;
  session: SessionPayload | null;
}

export function CompanyDetailActions({ company, session }: CompanyDetailActionsProps) {
  const [activityOpen, setActivityOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
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
      <Button variant="outline" size="sm" onClick={() => setContactOpen(true)}>
        <UserPlus className="h-3.5 w-3.5" />
        Add Contact
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

      <EditCompanyModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        company={company}
      />
      <LogActivityModal
        open={activityOpen}
        onClose={() => setActivityOpen(false)}
        companyId={company.id}
      />
      <AddContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        companyId={company.id}
      />
      <UpdateStatusModal
        open={statusOpen}
        onClose={() => setStatusOpen(false)}
        companyId={company.id}
        currentStatus={company.currentStatus}
      />
      {canAssign && (
        <AssignCoordinatorModal
          open={assignOpen}
          onClose={() => setAssignOpen(false)}
          companyId={company.id}
          currentAssigneeId={company.assignedCoordinatorId}
        />
      )}
    </div>
  );
}

// ─── Edit Company Modal ────────────────────────────────────

const editCompanySchema = z.object({
  companyName: z.string().min(1, "Required"),
  domain: z.string().optional(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  companyType: z.string().optional(),
  industry: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});
type EditCompanyData = z.infer<typeof editCompanySchema>;

function EditCompanyModal({
  open, onClose, company,
}: {
  open: boolean;
  onClose: () => void;
  company: CompanyDetailActionsProps["company"];
}) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<EditCompanyData>({
    resolver: zodResolver(editCompanySchema) as never,
    defaultValues: {
      companyName: company.companyName,
      domain: company.domain ?? "",
      website: company.website ?? "",
      linkedin: company.linkedin ?? "",
      companyType: company.companyType ?? "",
      industry: company.industry ?? "",
      city: company.city ?? "",
      state: company.state ?? "",
      country: company.country ?? "India",
      notes: company.notes ?? "",
    },
  });

  const onSubmit = (data: EditCompanyData) => {
    startTransition(async () => {
      const result = await updateCompanyAction(company.id, data);
      if (result.error) toast.error(result.error);
      else { toast.success("Company updated!"); onClose(); }
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Company" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Company Name" required error={errors.companyName?.message} {...register("companyName")} />
          </div>
          <Input label="Domain" placeholder="acme.com" {...register("domain")} />
          <Select label="Company Type" options={COMPANY_TYPE_OPTIONS} placeholder="Select type" {...register("companyType")} />
          <Input label="Website" placeholder="https://acme.com" {...register("website")} />
          <Input label="LinkedIn" placeholder="https://linkedin.com/company/acme" {...register("linkedin")} />
          <Input label="Industry" placeholder="Software, Finance..." {...register("industry")} />
          <Input label="City" {...register("city")} />
          <Input label="State" {...register("state")} />
          <Input label="Country" {...register("country")} />
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
  companyId: z.string(),
  type: z.string().min(1, "Required"),
  summary: z.string().min(1, "Required"),
  notes: z.string().optional(),
  nextAction: z.string().optional(),
  nextFollowUpDate: z.string().optional(),
});
type ActivityData = z.infer<typeof activitySchema>;

function LogActivityModal({ open, onClose, companyId }: { open: boolean; onClose: () => void; companyId: string }) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ActivityData>({
    resolver: zodResolver(activitySchema) as never,
    defaultValues: { companyId },
  });

  const onSubmit = (data: ActivityData) => {
    startTransition(async () => {
      const result = await createActivityAction(data);
      if (result.error) toast.error(result.error);
      else { toast.success("Activity logged!"); reset(); onClose(); }
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Log Activity" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register("companyId")} />
        <Select label="Activity Type" required options={ACTIVITY_TYPE_OPTIONS} placeholder="Select type" error={errors.type?.message} {...register("type")} />
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

// ─── Add / Edit Contact Modal ──────────────────────────────

const contactSchema = z.object({
  companyId: z.string().optional(),
  name: z.string().min(1, "Required"),
  designation: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  linkedin: z.string().optional(),
  notes: z.string().optional(),
  isPrimary: z.boolean().default(false),
});
type ContactData = z.infer<typeof contactSchema>;

function AddContactModal({ open, onClose, companyId }: { open: boolean; onClose: () => void; companyId: string }) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactData>({
    resolver: zodResolver(contactSchema) as never,
    defaultValues: { companyId, isPrimary: false },
  });

  const onSubmit = (data: ContactData) => {
    startTransition(async () => {
      const result = await createContactAction({ ...data, companyId });
      if (result.error) toast.error(result.error);
      else { toast.success("Contact added!"); reset(); onClose(); }
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Contact" size="md">
      <ContactForm
        register={register}
        handleSubmit={handleSubmit}
        errors={errors}
        isPending={isPending}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

// ─── Editable Contact Card ─────────────────────────────────

export function EditableContactCard({
  contact,
  companyId,
}: {
  contact: Contact;
  companyId: string;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteContactAction(contact.id, companyId);
      if (result.error) toast.error(result.error);
      else { toast.success("Contact deleted"); setDeleteOpen(false); }
    });
  };

  const { register, handleSubmit, formState: { errors } } = useForm<ContactData>({
    resolver: zodResolver(contactSchema) as never,
    defaultValues: {
      name: contact.name,
      designation: contact.designation ?? "",
      email: contact.email ?? "",
      phone: contact.phone ?? "",
      linkedin: contact.linkedin ?? "",
      notes: contact.notes ?? "",
      isPrimary: contact.isPrimary,
    },
  });

  const onSubmit = (data: ContactData) => {
    startTransition(async () => {
      const result = await updateContactAction(contact.id, companyId, data);
      if (result.error) toast.error(result.error);
      else { toast.success("Contact updated!"); setEditOpen(false); }
    });
  };

  return (
    <>
      <div className="group rounded-lg border border-zinc-800 p-3 hover:border-indigo-200 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-sm font-medium text-zinc-100">{contact.name}</p>
              {contact.isPrimary && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
              {contact.designation && (
                <span className="text-xs text-zinc-500">{contact.designation}</span>
              )}
            </div>
            <div className="mt-1.5 space-y-1">
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-blue-400 group/link">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{contact.email}</span>
                </a>
              )}
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-blue-400">
                  <Phone className="h-3 w-3" />
                  {contact.phone}
                </a>
              )}
              {contact.linkedin && (
                <a href={contact.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-blue-400 hover:underline">
                  <Link2 className="h-3 w-3" />
                  LinkedIn Profile
                </a>
              )}
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditOpen(true)}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-red-600" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Contact" size="md">
        <ContactForm
          register={register}
          handleSubmit={handleSubmit}
          errors={errors}
          isPending={isPending}
          onClose={() => setEditOpen(false)}
          onSubmit={onSubmit}
          submitLabel="Save Changes"
        />
      </Modal>

      {/* Delete confirm */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Contact?" size="sm">
        <p className="text-sm text-zinc-400 mb-4">
          Are you sure you want to delete <strong>{contact.name}</strong>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="destructive" loading={isPending} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </>
  );
}

// ─── Shared contact form fields ────────────────────────────

function ContactForm({ register, handleSubmit, errors, isPending, onClose, onSubmit, submitLabel = "Add Contact" }: {
  register: ReturnType<typeof useForm<ContactData>>["register"];
  handleSubmit: ReturnType<typeof useForm<ContactData>>["handleSubmit"];
  errors: ReturnType<typeof useForm<ContactData>>["formState"]["errors"];
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: ContactData) => void;
  submitLabel?: string;
}) {
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Input label="Name" required placeholder="Priya Sharma" error={errors.name?.message} {...register("name")} />
        </div>
        <Select label="Designation" options={DESIGNATION_OPTIONS} placeholder="Select designation" {...register("designation")} />
        <Input label="Email ID" type="email" placeholder="priya@company.com" {...register("email")} />
        <Input label="Mobile Number" placeholder="+91 98765 43210" {...register("phone")} />
        <Input label="LinkedIn" placeholder="https://linkedin.com/in/priya" {...register("linkedin")} />
      </div>
      <Textarea label="Notes" placeholder="Any notes about this contact..." {...register("notes")} />
      <div className="flex items-center gap-2">
        <input type="checkbox" id="isPrimary" {...register("isPrimary")} className="rounded" />
        <label htmlFor="isPrimary" className="text-sm text-zinc-300">Set as primary contact</label>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={isPending}>{submitLabel}</Button>
      </div>
    </form>
  );
}

// ─── Update Status Modal ───────────────────────────────────

const statusSchema = z.object({
  companyId: z.string(),
  newStatus: z.string(),
  notes: z.string().optional(),
});
type StatusData = z.infer<typeof statusSchema>;

function UpdateStatusModal({ open, onClose, companyId, currentStatus }: {
  open: boolean; onClose: () => void; companyId: string; currentStatus: CompanyStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<StatusData>({
    resolver: zodResolver(statusSchema) as never,
    defaultValues: { companyId, newStatus: currentStatus },
  });

  const onSubmit = (data: StatusData) => {
    startTransition(async () => {
      const result = await updateCompanyStatusAction(data);
      if (result.error) toast.error(result.error);
      else { toast.success("Status updated!"); onClose(); }
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Update Status" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register("companyId")} />
        <Select label="New Status" required options={STATUS_OPTIONS} error={errors.newStatus?.message} {...register("newStatus")} />
        <Textarea label="Notes (optional)" placeholder="Why is the status changing?" {...register("notes")} />
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
  open, onClose, companyId, currentAssigneeId,
}: {
  open: boolean;
  onClose: () => void;
  companyId: string;
  currentAssigneeId: string | null;
}) {
  const [coordinators, setCoordinators] = useState<CoordinatorOption[]>([]);
  const [selectedId, setSelectedId] = useState<string>(currentAssigneeId ?? "");
  const [isPending, startTransition] = useTransition();

  // Load users and reset selection every time the modal opens
  useEffect(() => {
    if (!open) return;
    setSelectedId(currentAssigneeId ?? "");
    getCoordinatorsAction().then((res) => {
      if (res.users) setCoordinators(res.users);
    });
  }, [open, currentAssigneeId]);

  const handleSave = () => {
    startTransition(async () => {
      const result = await assignCoordinatorAction(
        companyId,
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
          Choose a coordinator to assign this company to. Only ADMIN and CDC Head can do this.
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

