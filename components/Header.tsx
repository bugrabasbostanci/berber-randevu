"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-background border-b">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-4">
        <div className="flex justify-between items-center h-16 ">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold tracking-tight">The Barber Shop</h1>
          </div>
          <div>
            {session ? (
              <Button
                variant="destructive"
                onClick={() => signOut()}
              >
                Çıkış Yap
              </Button>
            ) : (
              <Link href="/auth/signin">
                <Button variant="default">
                  Giriş Yap
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 