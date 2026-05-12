"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateTaskStatusAction, createFollowUpTaskAction } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Check, Play, X, Loader2, Plus, ArrowRight } from "lucide-react";

// ─── Task Status Action Buttons ───────────────────────────

interface TaskStatusButtonProps {
  taskId: string;
  currentStatus: string;
}

export function TaskStatusButton({ taskId, currentStatus }: TaskStatusButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED") => {
    startTransition(async () => {
      const result = await updateTaskStatusAction({ taskId, status });
      if (result.error) toast.error(result.error);
      else toast.success(
        status === "COMPLETED" ? "Task completed!" :
        status === "IN_PROGRESS" ? "Task started" :
        "Task cancelled"
      );
    });
  };

  if (isPending) {
    return <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />;
  }

  if (currentStatus === "COMPLETED" || currentStatus === "CANCELLED") {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      {currentStatus === "PENDING" && (
        <button
          onClick={() => handleStatusChange("IN_PROGRESS")}
          title="Start working"
          className="rounded-md p-1.5 text-blue-400 hover:bg-blue-400/10 transition-colors"
        >
          <Play className="h-3.5 w-3.5" />
        </button>
      )}
      <button
        onClick={() => handleStatusChange("COMPLETED")}
        title="Mark complete"
        className="rounded-md p-1.5 text-green-400 hover:bg-green-400/10 transition-colors"
      >
        <Check className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => handleStatusChange("CANCELLED")}
        title="Cancel task"
        className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-500/10 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Full Status Update + Follow-up (for task detail row) ──

interface TaskActionsRowProps {
  taskId: string;
  currentStatus: string;
  users: { id: string; name: string }[];
  currentUserId: string;
}

export function TaskActionsRow({ taskId, currentStatus, users, currentUserId }: TaskActionsRowProps) {
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED") => {
    startTransition(async () => {
      const result = await updateTaskStatusAction({ taskId, status });
      if (result.error) toast.error(result.error);
      else toast.success(
        status === "COMPLETED" ? "Task completed!" :
        status === "IN_PROGRESS" ? "Task started" :
        "Task cancelled"
      );
    });
  };

  const isActive = currentStatus === "PENDING" || currentStatus === "IN_PROGRESS";

  return (
    <div className="flex items-center gap-1.5">
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
      ) : (
        <>
          {/* Status buttons */}
          {currentStatus === "PENDING" && (
            <button
              onClick={() => handleStatusChange("IN_PROGRESS")}
              title="Start working"
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 transition-colors"
            >
              <Play className="h-3 w-3" />
              Start
            </button>
          )}
          {isActive && (
            <button
              onClick={() => handleStatusChange("COMPLETED")}
              title="Mark complete"
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-green-400 bg-green-400/10 hover:bg-green-400/20 transition-colors"
            >
              <Check className="h-3 w-3" />
              Done
            </button>
          )}
          {isActive && (
            <button
              onClick={() => handleStatusChange("CANCELLED")}
              title="Cancel"
              className="rounded-md p-1 text-zinc-500 hover:bg-zinc-500/10 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Follow-up button — always available */}
          <button
            onClick={() => setFollowUpOpen(true)}
            title="Create follow-up task"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-orange-400 bg-orange-400/10 hover:bg-orange-400/20 transition-colors"
          >
            <ArrowRight className="h-3 w-3" />
            Follow-up
          </button>
        </>
      )}

      <FollowUpTaskModal
        open={followUpOpen}
        onClose={() => setFollowUpOpen(false)}
        parentTaskId={taskId}
        users={users}
        currentUserId={currentUserId}
      />
    </div>
  );
}

// ─── Follow-up Task Modal ─────────────────────────────────

const followUpSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  assignedToId: z.string().min(1, "Select assignee"),
  priority: z.string().default("MEDIUM"),
  dueDate: z.string().optional(),
});
type FollowUpData = z.infer<typeof followUpSchema>;

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

function FollowUpTaskModal({
  open,
  onClose,
  parentTaskId,
  users,
  currentUserId,
}: {
  open: boolean;
  onClose: () => void;
  parentTaskId: string;
  users: { id: string; name: string }[];
  currentUserId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FollowUpData>({
    resolver: zodResolver(followUpSchema) as never,
    defaultValues: { priority: "MEDIUM", assignedToId: currentUserId },
  });

  const onSubmit = (data: FollowUpData) => {
    startTransition(async () => {
      const result = await createFollowUpTaskAction({
        parentTaskId,
        title: data.title,
        description: data.description,
        assignedToId: data.assignedToId,
        priority: data.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
        dueDate: data.dueDate,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Follow-up task created!");
        reset();
        onClose();
      }
    });
  };

  const userOptions = users.map((u) => ({ value: u.id, label: u.name }));

  return (
    <Modal open={open} onClose={onClose} title="Create Follow-up Task" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Task Title"
          required
          placeholder="Follow up on TPO form, Schedule call, etc."
          error={errors.title?.message}
          {...register("title")}
        />
        <Textarea
          label="Description"
          placeholder="What needs to be done…"
          {...register("description")}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Assign To"
            required
            options={userOptions}
            error={errors.assignedToId?.message}
            {...register("assignedToId")}
          />
          <Select
            label="Priority"
            options={PRIORITY_OPTIONS}
            {...register("priority")}
          />
          <div className="sm:col-span-2">
            <Input label="Due Date" type="date" {...register("dueDate")} />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isPending}>Create Follow-up</Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Badges ───────────────────────────────────────────────

export function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { color: string; bg: string }> = {
    LOW: { color: "text-zinc-400", bg: "bg-zinc-800" },
    MEDIUM: { color: "text-blue-400", bg: "bg-blue-950/30" },
    HIGH: { color: "text-orange-400", bg: "bg-orange-950/30" },
    URGENT: { color: "text-red-400", bg: "bg-red-950/30" },
  };
  const c = config[priority] ?? config.MEDIUM;
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", c.color, c.bg)}>
      {priority}
    </span>
  );
}

export function TaskStatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; bg: string }> = {
    PENDING: { color: "text-yellow-400", bg: "bg-yellow-950/30" },
    IN_PROGRESS: { color: "text-blue-400", bg: "bg-blue-950/30" },
    COMPLETED: { color: "text-green-400", bg: "bg-green-950/30" },
    CANCELLED: { color: "text-zinc-500", bg: "bg-zinc-800" },
  };
  const c = config[status] ?? config.PENDING;
  const label = status.replace(/_/g, " ");
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", c.color, c.bg)}>
      {label}
    </span>
  );
}
