import { NextResponse } from "next/server";
import { z } from "zod";

// Geri bildirim şeması için validasyon
const feedbackSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  feedback: z.string().min(3, "Geri bildirim en az 3 karakter olmalıdır"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Gelen veriyi doğrula
    const validatedData = feedbackSchema.parse(body);
    
    // Gerçek uygulamada burada bir veritabanına kaydetme işlemi yapılır
    // Örnek: await prisma.feedback.create({ data: validatedData });
    
    // Loglama
    console.log("Geri bildirim alındı:", validatedData);
    
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