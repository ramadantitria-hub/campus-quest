import { NextRequest, NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';
import { parseKtmText } from '@/lib/ktm-parser';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image } = body;

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Data gambar KTM tidak ditemukan.' },
        { status: 400 }
      );
    }

    let imageBuffer: Buffer;
    if (image.startsWith('data:image')) {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      return NextResponse.json(
        { success: false, message: 'Format data gambar harus base64 data URL.' },
        { status: 400 }
      );
    }

    // Run OCR analysis with a fast timeout (3.5s) to guarantee total flow within 5 seconds
    const ocrPromise = Tesseract.recognize(imageBuffer, 'eng');
    const timeoutPromise = new Promise<{ data: { text: string } }>((_, reject) =>
      setTimeout(() => reject(new Error('OCR Timeout')), 3500)
    );

    let rawText = '';
    try {
      const res = await Promise.race([ocrPromise, timeoutPromise]);
      rawText = res?.data?.text || '';
    } catch {
      rawText = '';
    }

    // Parse extracted text into structured student fields
    const parsed = parseKtmText(rawText);

    return NextResponse.json({
      success: true,
      rawText,
      data: parsed
    });
  } catch (error: unknown) {
    console.error('Error in /api/ocr:', error);
    const errMessage = error instanceof Error ? error.message : 'Gagal membaca teks kartu KTM';
    return NextResponse.json(
      { success: false, message: errMessage },
      { status: 500 }
    );
  }
}
