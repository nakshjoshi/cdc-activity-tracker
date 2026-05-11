"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileAction } from "@/actions/profile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export function UpdateProfileForm({
  defaultName,
  defaultPhone,
}: {
  defaultName: string;
  defaultPhone: string;
}) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as never,
    defaultValues: { name: defaultName, phone: defaultPhone },
  });

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const result = await updateProfileAction(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Profile updated!");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <Input
            label="Full Name"
            required
            error={errors.name?.message}
            {...register("name")}
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Input
            label="Phone"
            type="tel"
            placeholder="+91 98765 43210"
            {...register("phone")}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" loading={isPending} disabled={!isDirty}>
          <Save className="h-4 w-4" />
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
