"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createCompanyAction } from "@/actions/companies";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";
import { Plus, Building2, User } from "lucide-react";
import type { SessionPayload } from "@/lib/auth";

// ─── Form schema ───────────────────────────────────────────

const formSchema = z.object({
  // Company info
  companyName: z.string().min(1, "Company name is required"),
  domain: z.string().optional(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  companyType: z.string().optional(),
  industry: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default("India"),
  notes: z.string().optional(),
  // Point of contact
  pocName: z.string().optional(),
  pocDesignation: z.string().optional(),
  pocEmail: z.string().optional(),
  pocPhone: z.string().optional(),
  pocLinkedin: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

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

export function CompaniesActions({
  session,
}: {
  session: SessionPayload | null;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Open modal when ?add=1 is in the URL (used by empty-state link)
  useEffect(() => {
    if (searchParams.get("add") === "1") {
      setOpen(true);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema) as never,
    defaultValues: { country: "India" },
  });

  const handleClose = () => {
    setOpen(false);
    reset();
    // Remove ?add=1 from URL without re-navigating
    const params = new URLSearchParams(searchParams.toString());
    params.delete("add");
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "/dashboard/companies", { scroll: false });
  };

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const payload = {
        companyName: data.companyName,
        domain: data.domain,
        website: data.website,
        linkedin: data.linkedin,
        companyType: data.companyType as never,
        industry: data.industry,
        city: data.city,
        state: data.state,
        country: data.country || "India",
        notes: data.notes,
        poc:
          data.pocName
            ? {
                name: data.pocName,
                designation: data.pocDesignation,
                email: data.pocEmail,
                phone: data.pocPhone,
                linkedin: data.pocLinkedin,
              }
            : undefined,
      };

      const result = await createCompanyAction(payload);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Company added!");
        handleClose();
        router.push(`/dashboard/companies/${result.companyId}`);
      }
    });
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add Company
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        title="Add Company"
        description="Fill in the company details and primary point of contact"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* ── Company Name (required) ─────────────── */}
          <Input
            label="Company Name"
            required
            placeholder="Google, Infosys, Razorpay…"
            error={errors.companyName?.message}
            {...register("companyName")}
          />

          {/* ── Point of Contact ──────────────────────── */}
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
            <User className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-semibold text-zinc-300">
              Point of Contact
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Contact Name"
              placeholder="Priya Sharma"
              {...register("pocName")}
            />
            <Select
              label="Designation"
              options={DESIGNATION_OPTIONS}
              placeholder="Select designation"
              {...register("pocDesignation")}
            />
            <Input
              label="Email"
              type="email"
              placeholder="priya@company.com"
              {...register("pocEmail")}
            />
            <Input
              label="Phone"
              placeholder="+91 98765 43210"
              {...register("pocPhone")}
            />
            <div className="sm:col-span-2">
              <Input
                label="LinkedIn Profile"
                placeholder="https://linkedin.com/in/priya"
                {...register("pocLinkedin")}
              />
            </div>
          </div>

          {/* ── Company Details (all optional) ─────────── */}
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
            <Building2 className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-semibold text-zinc-300">
              Company Details
              <span className="ml-1.5 font-normal text-zinc-500">(optional)</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Company Type"
              options={COMPANY_TYPE_OPTIONS}
              placeholder="Select type"
              {...register("companyType")}
            />
            <Input
              label="Industry"
              placeholder="Software, Finance, Consulting…"
              {...register("industry")}
            />
            <Input
              label="Website"
              placeholder="https://acme.com"
              {...register("website")}
            />
            <Input
              label="LinkedIn Page"
              placeholder="https://linkedin.com/company/acme"
              {...register("linkedin")}
            />
            <Input label="City" placeholder="Mumbai" {...register("city")} />
            <Input label="State" placeholder="Maharashtra" {...register("state")} />
          </div>

          <Textarea
            label="Notes"
            placeholder="How was this company found? Any context…"
            {...register("notes")}
          />

          <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4">
            <Button variant="outline" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              Add Company
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
