import Link from "next/link";

export default function VerifyRequest() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Doğrulama E-postası Gönderildi
          </h1>
          <p className="text-sm text-muted-foreground">
            E-posta adresinize gönderilen bağlantıya tıklayarak giriş yapabilirsiniz.
          </p>
        </div>
        <Link
          href="/auth/signin"
          className="mx-auto flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          Giriş Sayfasına Dön
        </Link>
      </div>
    </div>
  );
} 