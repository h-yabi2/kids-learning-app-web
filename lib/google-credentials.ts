import { writeFileSync } from "fs";
import path from "path";

/**
 * Google Cloud認証情報をbase64エンコードから復元して一時ファイルとして保存
 * Vercel環境では/tmpディレクトリに書き込み
 */
export const decodeGoogleCredentials = () => {
  const base64 = process.env.GOOGLE_CREDENTIALS_BASE64;

  if (!base64) {
    throw new Error(
      "GOOGLE_CREDENTIALS_BASE64 environment variable is not set"
    );
  }

  try {
    // base64デコード
    const json = Buffer.from(base64, "base64").toString("utf-8");

    // 一時ファイルパスを生成
    const jsonPath = path.resolve("/tmp", "google-credentials.json");

    // ファイルに書き込み
    writeFileSync(jsonPath, json);

    console.log("✅ Google credentials decoded and saved to:", jsonPath);

    return jsonPath;
  } catch (error) {
    console.error("❌ Failed to decode Google credentials:", error);
    throw new Error(
      `Failed to decode Google credentials: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Google Cloud認証情報のパスを取得
 * 初回呼び出し時にデコード処理を実行
 */
let credentialsPath: string | null = null;

export const getGoogleCredentialsPath = (): string => {
  if (!credentialsPath) {
    credentialsPath = decodeGoogleCredentials();
  }
  return credentialsPath;
};
