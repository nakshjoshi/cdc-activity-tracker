"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordAction } from "@/actions/profile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Lock, CheckCircle2 } from "lucide-react";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) as never });

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const result = await changePasswordAction(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Password changed successfully!");
        reset();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Info banner */}
      <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 dark:border-blue-900/30 dark:bg-blue-900/10">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Your admin has set a temporary password. Please change it to something only you know.
        </p>
      </div>

      <Input
        label="Current Password"
        type="password"
        required
        placeholder="Your current / temporary password"
        error={errors.currentPassword?.message}
        {...register("currentPassword")}
      />
      <Input
        label="New Password"
        type="password"
        required
        placeholder="At least 8 characters"
        error={errors.newPassword?.message}
        {...register("newPassword")}
      />
      <Input
        label="Confirm New Password"
        type="password"
        required
        placeholder="Repeat new password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <div className="flex justify-end">
        <Button type="submit" loading={isPending}>
          <Lock className="h-4 w-4" />
          {isPending ? "Updating..." : "Update Password"}
        </Button>
      </div>
    </form>
  );
}
