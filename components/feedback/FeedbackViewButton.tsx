"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FeedbackList from "./FeedbackList";
import { ClipboardList } from "lucide-react";

export default function FeedbackViewButton() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className="flex items-center gap-1.5 rounded-md border-gray-300 hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer"
        aria-label="Geri bildirimleri görüntüle"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleOpen()}
      >
        <ClipboardList className="h-4 w-4 text-primary" />
        <span>Geri Bildirimler</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] md:max-w-[700px] rounded-md">
          <DialogHeader>
            <DialogTitle className="text-center">Geri Bildirimler</DialogTitle>
          </DialogHeader>
          <FeedbackList />
        </DialogContent>
      </Dialog>
    </>
  );
} 