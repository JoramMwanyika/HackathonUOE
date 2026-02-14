import { NextResponse } from "next/server"

const SPEECH_KEY = process.env.AZURE_SPEECH_KEY!
const SPEECH_REGION = process.env.AZURE_SPEECH_REGION || "eastus"

export async function GET() {
  try {
    const response = await fetch(`https://${SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": SPEECH_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to get speech token" }, { status: 500 })
    }

    const token = await response.text()
    return NextResponse.json({ token, region: SPEECH_REGION })
  } catch (error) {
    console.error("Speech Token Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
