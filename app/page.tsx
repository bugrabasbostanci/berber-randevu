"use client";

import { useSession } from "next-auth/react";
import { CalendarView } from "@/components/calendar/calendar-view";
import Header from "@/components/Header";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto p-4">
        <div className="max-w-7xl mx-auto">
          <CalendarView />
        </div>
      </main>
    </div>
  );
}
