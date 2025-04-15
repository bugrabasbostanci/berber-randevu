"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();
  
  const handleGoBack = () => {
    router.back();
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2">The Barber Shop Randevu Yönetim Sistemi</h1>
        <p className="text-gray-600 mb-8">Sadece yetkililer giriş yapabilir</p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 rounded-lg px-6 py-3 hover:bg-gray-50 transition-colors mx-auto mb-4 w-full"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
            />
          </svg>
          Google ile Giriş Yap
        </button>
        
        <button 
          onClick={handleGoBack}
          onKeyDown={(e) => e.key === "Enter" && handleGoBack()}
          className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 rounded-lg px-6 py-3 hover:bg-gray-50 transition-colors mx-auto w-full"
          aria-label="Geri dön"
          tabIndex={0}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Geri Dön
        </button>
      </div>
    </div>
  );
} 