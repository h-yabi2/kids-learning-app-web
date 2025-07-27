import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const testInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        GOOGLE_CREDENTIALS_BASE64_SET: !!process.env.GOOGLE_CREDENTIALS_BASE64,
        GOOGLE_CREDENTIALS_BASE64_LENGTH:
          process.env.GOOGLE_CREDENTIALS_BASE64?.length || 0,
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
      },
      message: "TTS test endpoint is working",
    };

    return NextResponse.json(testInfo);
  } catch (error) {
    console.error("Test endpoint error:", error);
    return NextResponse.json(
      {
        error: "Test endpoint failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
