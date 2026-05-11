"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, type CreateUserInput } from "@/lib/validations";
import { createUserAction, toggleUserActiveAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";
import { Plus, UserX, UserCheck } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "STUDENT_COORDINATOR", label: "Student Placement Coordinator" },
  { value: "FACULTY_COORDINATOR", label: "Faculty Coordinator" },
  { value: "CDC_HEAD", label: "CDC Head" },
  { value: "CDC_CHAIRMAN", label: "CDC Chairman" },
  { value: "ADMIN", label: "Admin" },
];

interface UserActionsProps {
  userId?: string;
  isActive?: boolean;
  mode?: "header" | "row";
}

export function UserActions({ userId, isActive, mode = "header" }: UserActionsProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema) as never,
  });

  const onSubmit = (data: CreateUserInput) => {
    startTransition(async () => {
      const result = await createUserAction(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("User created successfully!");
        reset();
        setOpen(false);
      }
    });
  };

  const toggleActive = () => {
    if (!userId) return;
    startTransition(async () => {
      const result = await toggleUserActiveAction(userId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(isActive ? "User deactivated" : "User activated");
      }
    });
  };

  if (mode === "row" && userId) {
    return (
      <Button variant="ghost" size="sm" onClick={toggleActive} loading={isPending}>
        {isActive ? (
          <><UserX className="h-3.5 w-3.5 text-red-500" /> Deactivate</>
        ) : (
          <><UserCheck className="h-3.5 w-3.5 text-emerald-500" /> Activate</>
        )}
      </Button>
    );
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add User
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Create User" description="Add a new user to the system" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full Name" required placeholder="Rahul Sharma" error={errors.name?.message} {...register("name")} />
          <Input label="Email" required type="email" placeholder="rahul@college.edu" error={errors.email?.message} {...register("email")} />
          <Input label="Password" required type="password" placeholder="Minimum 8 characters" error={errors.password?.message} {...register("password")} />
          <Select label="Role" required options={ROLE_OPTIONS} placeholder="Select role" error={errors.role?.message} {...register("role")} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" placeholder="+91 98765 43210" {...register("phone")} />
            <Input label="Department" placeholder="CSE, ECE..." {...register("department")} />
          </div>
          <Input label="Year" type="number" placeholder="1–4" {...register("year", { valueAsNumber: true })} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isPending}>Create User</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
