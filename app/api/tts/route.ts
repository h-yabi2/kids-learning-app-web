import { NextRequest, NextResponse } from "next/server";
import { TextToSpeechClient, protos } from "@google-cloud/text-to-speech";
import { getGoogleCredentialsPath } from "@/lib/google-credentials";

export async function POST(request: NextRequest) {
  try {
    // 環境変数の確認
    if (!process.env.GOOGLE_CREDENTIALS_BASE64) {
      console.error("Missing GOOGLE_CREDENTIALS_BASE64 environment variable");
      return NextResponse.json(
        {
          error: "Server configuration error",
          details: "GOOGLE_CREDENTIALS_BASE64 environment variable is not set",
        },
        { status: 500 }
      );
    }

    // Google Cloud Text-to-Speech クライアントを初期化
    let client: TextToSpeechClient;

    try {
      // base64エンコードされた認証情報から一時ファイルを作成
      const credentialsPath = getGoogleCredentialsPath();

      client = new TextToSpeechClient({
        keyFilename: credentialsPath,
      });

      console.log("✅ TTS client initialized successfully");
    } catch (initError) {
      console.error("Failed to initialize TTS client:", initError);
      return NextResponse.json(
        {
          error: "Failed to initialize TTS client",
          details:
            initError instanceof Error
              ? initError.message
              : "Unknown initialization error",
        },
        { status: 500 }
      );
    }

    const { text, voice = "ja-JP-Neural2-C" } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // 音声合成のリクエストを構築
    const synthesisInput: protos.google.cloud.texttospeech.v1.ISynthesisInput =
      {
        text: text,
      };

    const voiceConfig: protos.google.cloud.texttospeech.v1.IVoiceSelectionParams =
      {
        languageCode: "ja-JP",
        name: voice,
      };

    const audioConfig: protos.google.cloud.texttospeech.v1.IAudioConfig = {
      audioEncoding: protos.google.cloud.texttospeech.v1.AudioEncoding.MP3,
      effectsProfileId: ["headphone-class-device"],
      speakingRate: 1.0,
      pitch: 3.0,
      volumeGainDb: 0,
    };

    const request_body: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest =
      {
        input: synthesisInput,
        voice: voiceConfig,
        audioConfig: audioConfig,
      };

    // 音声合成を実行
    const [response] = await client.synthesizeSpeech(request_body);

    if (!response.audioContent) {
      return NextResponse.json(
        { error: "Failed to synthesize speech - no audio content returned" },
        { status: 500 }
      );
    }

    // Base64エンコードされた音声データを返す
    const audioBase64 = response.audioContent.toString("base64");

    return NextResponse.json({
      audio: audioBase64,
      format: "audio/mp3",
    });
  } catch (error) {
    console.error("TTS Error:", error);

    // より詳細なエラー情報を提供
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("Error details:", {
      message: errorMessage,
      stack: errorStack,
      name: error instanceof Error ? error.name : undefined,
    });

    return NextResponse.json(
      {
        error: "TTS API request failed",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
