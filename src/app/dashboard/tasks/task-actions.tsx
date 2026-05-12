"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createTaskAction } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  assignedToId: z.string().min(1, "Select an assignee"),
  companyId: z.string().optional(),
  priority: z.string().default("MEDIUM"),
  dueDate: z.string().optional(),
});
type TaskFormData = z.infer<typeof taskSchema>;

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

interface TaskCreateButtonProps {
  users: { id: string; name: string }[];
  companies: { id: string; companyName: string }[];
  /** Pre-select a company (used on company detail page) */
  defaultCompanyId?: string;
}

export function TaskCreateButton({ users, companies, defaultCompanyId }: TaskCreateButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema) as never,
    defaultValues: { priority: "MEDIUM", companyId: defaultCompanyId ?? "" },
  });

  const onSubmit = (data: TaskFormData) => {
    startTransition(async () => {
      const result = await createTaskAction({
        ...data,
        priority: data.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
        companyId: data.companyId || undefined,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Task assigned!");
        reset();
        setOpen(false);
      }
    });
  };

  const userOptions = users.map((u) => ({ value: u.id, label: u.name }));
  const companyOptions = companies.map((c) => ({ value: c.id, label: c.companyName }));

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        <Plus className="h-4 w-4" />
        Assign Task
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Assign Task" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Task Title"
            required
            placeholder="Fill TPO outreach form, Call HR, etc."
            error={errors.title?.message}
            {...register("title")}
          />
          <Textarea
            label="Description"
            placeholder="Details about what needs to be done…"
            {...register("description")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Assign To"
              required
              options={userOptions}
              placeholder="Select member"
              error={errors.assignedToId?.message}
              {...register("assignedToId")}
            />
            <Select
              label="Company"
              options={companyOptions}
              placeholder="Select company (optional)"
              {...register("companyId")}
            />
            <Select
              label="Priority"
              options={PRIORITY_OPTIONS}
              {...register("priority")}
            />
            <Input
              label="Due Date"
              type="date"
              {...register("dueDate")}
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isPending}>Assign Task</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
