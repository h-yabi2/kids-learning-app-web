import { NextRequest, NextResponse } from "next/server";
import { getGoogleCredentialsPath } from "@/lib/google-credentials";
import { writeFileSync, readFileSync } from "fs";

export async function GET(request: NextRequest) {
  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        GOOGLE_CREDENTIALS_BASE64_SET: !!process.env.GOOGLE_CREDENTIALS_BASE64,
        GOOGLE_CREDENTIALS_BASE64_LENGTH:
          process.env.GOOGLE_CREDENTIALS_BASE64?.length || 0,
        NODE_ENV: process.env.NODE_ENV,
      },
      credentials: {
        path: null as string | null,
        exists: false,
        content: null as any,
      },
    };

    // 認証情報ファイルの確認
    try {
      const credentialsPath = getGoogleCredentialsPath();
      debugInfo.credentials.path = credentialsPath;

      // ファイルの存在確認
      try {
        const fileContent = readFileSync(credentialsPath, "utf-8");
        debugInfo.credentials.exists = true;
        debugInfo.credentials.content = JSON.parse(fileContent);
      } catch (fileError) {
        debugInfo.credentials.exists = false;
        console.error("Failed to read credentials file:", fileError);
      }
    } catch (credError) {
      console.error("Failed to get credentials path:", credError);
    }

    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      {
        error: "Debug endpoint failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
