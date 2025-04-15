"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FeedbackForm from "./FeedbackForm";
import { MessageSquare } from "lucide-react";

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className="flex items-center gap-1.5 rounded-md border-gray-300 hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer"
        aria-label="Geri bildirim gönder"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleOpen()}
      >
        <MessageSquare className="h-4 w-4 text-primary" />
        <span>Geri Bildirim</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-md">
          <DialogHeader>
            <DialogTitle className="text-center">Geri Bildirim</DialogTitle>
          </DialogHeader>
          <FeedbackForm onClose={handleClose} />
        </DialogContent>
      </Dialog>
    </>
  );
} 