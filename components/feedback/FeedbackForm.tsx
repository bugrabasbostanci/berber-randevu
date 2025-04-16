"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type FeedbackFormProps = {
  onClose: () => void;
};

export default function FeedbackForm({ onClose }: FeedbackFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name || undefined,
          email: email || undefined,
          feedback,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Bir hata oluştu");
      }
      
      toast.success("Geri bildiriminiz için teşekkürler!");
      setName("");
      setEmail("");
      setFeedback("");
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Geri bildiriminiz gönderilirken bir hata oluştu.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Adınız (İsteğe bağlı)</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Adınızı girin"
          className="w-full"
          aria-label="Adınız"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">E-posta (İsteğe bağlı)</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta adresinizi girin"
          className="w-full"
          aria-label="E-posta adresiniz"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="feedback">Geri Bildirim <span className="text-red-500">*</span></Label>
        <Textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Fikirlerinizi, önerilerinizi veya geri bildirimlerinizi buraya yazın..."
          className="w-full min-h-[120px]"
          aria-label="Geri bildirim içeriği"
          required
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          İptal
        </Button>
        <Button 
          type="submit" 
          disabled={!feedback.trim() || isSubmitting}
          className="bg-black hover:bg-gray-800"
        >
          {isSubmitting ? "Gönderiliyor..." : "Gönder"}
        </Button>
      </div>
    </form>
  );
} 