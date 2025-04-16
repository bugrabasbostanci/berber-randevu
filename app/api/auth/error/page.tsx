"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

// Ana sayfa içeriğini ayrı bir bileşene ayıralım
function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  useEffect(() => {
    // Hata türlerine göre mesajları ayarlayalım
    switch(error) {
      case "AccessDenied":
        setErrorMessage("Bu hesap ile giriş yapma izniniz bulunmamaktadır.");
        break;
      case "CredentialsSignin":
        setErrorMessage("Kullanıcı adı veya şifre hatalı. Lütfen tekrar deneyiniz.");
        break;
      case "OAuthAccountNotLinked":
        setErrorMessage("Bu sosyal medya hesabı başka bir hesap ile ilişkilendirilmiş.");
        break;
      case "SessionRequired":
        setErrorMessage("Bu sayfayı görüntülemek için giriş yapmanız gerekmektedir.");
        break;
      case "Verification":
        setErrorMessage("Doğrulama bağlantısı geçersiz veya süresi dolmuş.");
        break;
      default:
        setErrorMessage("Giriş sırasında beklenmeyen bir hata oluştu.");
    }
  }, [error]);
  
  return (
    <div className="text-center w-full max-w-md">
      <h1 className="text-3xl font-bold mb-2">The Barber Shop Randevu Yönetim Sistemi</h1>
      <p className="text-gray-600 mb-8">Giriş Hatası</p>
      
      <div className="bg-red-50 border border-red-200 rounded-lg px-6 py-4 mb-6 text-left">
        <p className="text-red-700">{errorMessage}</p>
      </div>
      
      <Link 
        href="/api/auth/signin" 
        className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 rounded-lg px-6 py-3 hover:bg-gray-50 transition-colors mx-auto mb-4 w-full"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
        </svg>
        Tekrar Giriş Yapmayı Dene
      </Link>
      
      <Link 
        href="/" 
        className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 rounded-lg px-6 py-3 hover:bg-gray-50 transition-colors mx-auto w-full"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        Ana Sayfaya Git
      </Link>
    </div>
  );
}

// Yükleme durumu için basit bir bileşen
function LoadingState() {
  return (
    <div className="text-center w-full max-w-md">
      <h2 className="text-xl">Yükleniyor...</h2>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <Suspense fallback={<LoadingState />}>
        <ErrorContent />
      </Suspense>
    </div>
  );
} 