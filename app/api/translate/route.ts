import { type NextRequest, NextResponse } from "next/server"

const TRANSLATOR_ENDPOINT = process.env.AZURE_TRANSLATOR_ENDPOINT || "https://api.cognitive.microsofttranslator.com"
const TRANSLATOR_KEY = process.env.AZURE_TRANSLATOR_KEY!
const REGION = process.env.AZURE_TRANSLATOR_REGION || "eastus"

export async function POST(req: NextRequest) {
  try {
    const { text, from, to } = await req.json()

    const response = await fetch(`${TRANSLATOR_ENDPOINT}/translate?api-version=3.0&from=${from}&to=${to}`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": TRANSLATOR_KEY,
        "Ocp-Apim-Subscription-Region": REGION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{ text }]),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("Translator Error:", error)
      return NextResponse.json({ error: "Translation failed" }, { status: 500 })
    }

    const data = await response.json()
    const translatedText = data[0]?.translations?.[0]?.text || text

    return NextResponse.json({ translatedText })
  } catch (error) {
    console.error("Translation API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
