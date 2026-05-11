"use client";

import { useTransition } from "react";
import { completeFollowUpAction } from "@/actions/companies";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function CompleteFollowUpButton({ followUpId }: { followUpId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      loading={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await completeFollowUpAction(followUpId);
          if (result.error) {
            toast.error(result.error);
          } else {
            toast.success("Follow-up marked complete!");
          }
        })
      }
    >
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
      Done
    </Button>
  );
}
