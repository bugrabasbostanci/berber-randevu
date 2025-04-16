"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type Contact = {
  id: string;
  name?: string | null;
  email?: string | null;
  feedback: string;
  createdAt: string;
  updatedAt: string;
};

export default function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/feedback");
        
        if (!response.ok) {
          throw new Error("Geri bildirimler getirilemedi");
        }
        
        const data = await response.json();
        setFeedbacks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
        console.error("Geri bildirim listesi hatası:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-red-500 mb-2">Hata: {error}</p>
        <p className="text-gray-500">Lütfen daha sonra tekrar deneyin</p>
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-gray-500">Henüz geri bildirim bulunmuyor</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2 max-h-[70vh] overflow-y-auto pr-2">
      {feedbacks.map((feedback) => (
        <div 
          key={feedback.id} 
          className="border rounded-md p-4 space-y-2 shadow-sm bg-white"
        >
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div>
              <h3 className="font-medium">
                {feedback.name || "Anonim Kullanıcı"}
              </h3>
              {feedback.email && (
                <p className="text-sm text-gray-500">{feedback.email}</p>
              )}
            </div>
            <div className="text-xs text-gray-400">
              {format(new Date(feedback.createdAt), "d MMMM yyyy, HH:mm", { locale: tr })}
            </div>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{feedback.feedback}</p>
        </div>
      ))}
    </div>
  );
} 