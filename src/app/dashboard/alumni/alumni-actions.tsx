"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAlumniSchema, type CreateAlumniInput } from "@/lib/validations";
import { createAlumniAction } from "@/actions/alumni";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type { SessionPayload } from "@/lib/auth";

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

const BATCH_OPTIONS = Array.from({ length: 15 }, (_, i) => {
  const year = 2030 - i;
  return { value: String(year), label: String(year) };
});

export function AlumniActions({ session }: { session: SessionPayload | null }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateAlumniInput>({
    resolver: zodResolver(createAlumniSchema) as never,
  });

  const onSubmit = (data: CreateAlumniInput) => {
    startTransition(async () => {
      const result = await createAlumniAction({
        ...data,
        batch: Number(data.batch),
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Alumni added!");
        reset();
        setOpen(false);
      }
    });
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add Alumni
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add Alumni" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Full Name" required placeholder="Rahul Sharma" error={errors.name?.message} {...register("name")} />
            </div>
            <Select label="Batch Year" required options={BATCH_OPTIONS} placeholder="Select year" {...register("batch")} />
            <Select label="Branch" required options={BRANCH_OPTIONS} placeholder="Select branch" {...register("branch")} />
            <Input label="Current Company" placeholder="Google, Microsoft, etc." {...register("currentCompany")} />
            <Input label="Designation" placeholder="Software Engineer" {...register("designation")} />
            <Input label="Email" type="email" placeholder="rahul@gmail.com" {...register("email")} />
            <Input label="Phone" placeholder="+91 98765 43210" {...register("phone")} />
            <Input label="LinkedIn" placeholder="https://linkedin.com/in/rahul" {...register("linkedin")} />
            <Input label="City" placeholder="Bangalore" {...register("city")} />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
              <input type="checkbox" {...register("willingToHelp")} className="rounded" />
              Willing to help with placements
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
              <input type="checkbox" {...register("referralCapability")} className="rounded" />
              Can provide referrals
            </label>
          </div>
          <Textarea label="Notes" placeholder="Any additional notes..." {...register("notes")} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isPending}>Add Alumni</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
