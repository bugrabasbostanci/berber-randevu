import { NextResponse } from "next/server";
import { z } from "zod";
import { PrismaClient } from '@prisma/client';
import { auth } from "@/auth";

// Prisma istemcisini oluştur
const prisma = new PrismaClient();

// Geri bildirim şeması için validasyon
const feedbackSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  feedback: z.string().min(3, "Geri bildirim en az 3 karakter olmalıdır"),
});

// Geri bildirimleri getirme - sadece giriş yapmış kullanıcılar için
export async function GET() {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await auth();
    
    // Kullanıcı giriş yapmamışsa 401 hatası döndür
    if (!session) {
      return NextResponse.json(
        { message: "Bu işlem için giriş yapmanız gerekiyor" },
        { status: 401 }
      );
    }
    
    // Geri bildirimleri getir
    const feedbacks = await prisma.contact.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error("Geri bildirim listeleme hatası:", error);
    
    return NextResponse.json(
      { message: "Geri bildirimler getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Geri bildirim gönderme
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Veriyi doğrula ve kullan
    const validatedData = feedbackSchema.parse(body);
    
    // Geri bildirimi veritabanına kaydet
    await prisma.contact.create({
      data: {
        name: validatedData.name || '',
        email: validatedData.email || '',
        feedback: validatedData.feedback
      }
    });
    
    return NextResponse.json(
      { message: "Geri bildiriminiz için teşekkürler!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Geri bildirim hatası:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Geçersiz veri formatı", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Geri bildirim gönderilirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 