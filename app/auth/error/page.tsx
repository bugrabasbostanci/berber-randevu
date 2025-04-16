"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl font-bold mb-4">Giriş Hatası</h1>
      <p className="text-red-500 mb-4">
        {error === "AccessDenied"
          ? "Bu hesap ile giriş yapma izniniz bulunmamaktadır."
          : "Giriş sırasında bir hata oluştu."}
      </p>
      <button
        onClick={() => window.location.href = "/auth/signin"}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Tekrar Dene
      </button>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen flex-col items-center justify-center">Yükleniyor...</div>}>
      <ErrorContent />
    </Suspense>
  );
} 