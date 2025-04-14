"use client";

import { Appointment } from "@/types";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { maskName } from "../utils/date-utils";

interface AppointmentCardProps {
  appointment: Appointment;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  const appointmentDate = new Date(appointment.date);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="tracking-tight">Berber Randevusu</CardTitle>
        <Badge variant="outline">#{appointment.id}</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <CardDescription>Müşteri</CardDescription>
            <p className="font-medium tracking-tight">
              {maskName(appointment.fullname, isLoggedIn)}
            </p>
          </div>

          {isLoggedIn && (
            <>
              <div>
                <CardDescription>Tarih</CardDescription>
                <p className="font-medium tracking-tight">
                  {format(appointmentDate, "d MMMM yyyy", { locale: tr })}
                </p>
              </div>
              <div>
                <CardDescription>Saat</CardDescription>
                <p className="font-medium tracking-tight">
                  {format(appointmentDate, "HH:mm")}
                </p>
              </div>
              <div>
                <CardDescription>Telefon</CardDescription>
                <p className="font-medium tracking-tight">{appointment.phone}</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 