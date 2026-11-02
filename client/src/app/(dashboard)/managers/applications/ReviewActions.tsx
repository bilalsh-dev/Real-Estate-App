"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApplicationStatus } from "@/lib/constants";
import { apiErrorMessage } from "@/lib/utils";
import { useReviewApplicationMutation, type ReviewApplicationArgs } from "@/state/api";
import type { ApplicationListItem } from "@/types";
import { toast } from "sonner";

type Decision = ReviewApplicationArgs["status"];

const DECISION_COPY: Record<Decision, { action: string; title: string; done: string }> = {
  [ApplicationStatus.Approved]: {
    action: "Approve",
    title: "Approve this application?",
    done: "Application approved",
  },
  [ApplicationStatus.Denied]: {
    action: "Deny",
    title: "Deny this application?",
    done: "Application denied",
  },
};

export function ReviewActions({ application }: { application: ApplicationListItem }) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [reviewApplication, { isLoading }] = useReviewApplicationMutation();
  const copy = decision && DECISION_COPY[decision];

  const confirm = async () => {
    if (!decision) return;
    try {
      await reviewApplication({ id: application.id, status: decision }).unwrap();
      toast.success(DECISION_COPY[decision].done);
      setDecision(null);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not update the application"));
    }
  };

  return (
    <>
      <Button
        className="bg-green-600 text-white hover:bg-green-500"
        onClick={() => setDecision(ApplicationStatus.Approved)}
      >
        Approve
      </Button>
      <Button
        className="bg-red-600 text-white hover:bg-red-500"
        onClick={() => setDecision(ApplicationStatus.Denied)}
      >
        Deny
      </Button>
      <Dialog open={decision !== null} onOpenChange={(open) => !open && setDecision(null)}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>{copy?.title}</DialogTitle>
            <DialogDescription>
              {decision === ApplicationStatus.Approved
                ? `${application.tenant.name} gets a one-year lease for ${application.property.name}.`
                : `${application.tenant.name}'s application for ${application.property.name} will be closed.`}{" "}
              This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button disabled={isLoading} onClick={() => void confirm()}>
              {copy?.action}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
