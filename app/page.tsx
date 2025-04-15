"use client";

import { useSession } from "next-auth/react";
import { CalendarView } from "@/components/calendar/calendar-view";
import Header from "@/components/Header";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main>
        <div className="px-4 sm:px-6 max-w-7xl mx-auto py-4">
          <CalendarView />
        </div>
      </main>
    </div>
  );
}
