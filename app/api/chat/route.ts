import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

const AZURE_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT!
const AZURE_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || "2025-01-01-preview"
const AZURE_KEY = process.env.AZURE_OPENAI_KEY!

const SYSTEM_PROMPT = `You are AgriTwin, a friendly and knowledgeable AI farming assistant for smallholder farmers in Kenya. 
You provide advice on:
- Crop management (planting, fertilizing, harvesting)
- Pest and disease control
- Weather-based recommendations
- Soil health and irrigation
- Market prices and best practices
- Team task assignment and farm collaboration

Keep responses concise, practical, and easy to understand. Use simple language suitable for farmers with varying literacy levels.
When relevant, consider local conditions in Kenya (climate, common crops like maize, beans, tomatoes, etc.).
Always be encouraging and supportive.

You can understand and respond in Swahili (Kiswahili), Kikuyu (Gikuyu), and Luo (Dholuo) if the user speaks them.

Please use natural punctuation to make the text easy to read and suitable for Text-to-Speech (TTS).

If the user shares information about a plant disease or pest from an image analysis, provide detailed advice on:
1. Confirmation of the disease/pest identification
2. Immediate actions to take
3. Treatment options (both organic and chemical)
4. Prevention measures for the future

If the user asks to assign tasks to team members (e.g., "Tell John to water the tomatoes"), acknowledge the request and let them know the task has been assigned. Be conversational and natural about task assignments.`

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { messages, imageAnalysis, language } = await req.json()
    const userId = session.user.id

    // 1. Get or Create a generic Chat Session for this user (for now, single session per user or new one)
    // Let's find the most recent active session or create one
    let chatSession = await db.chatSession.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    })

    if (!chatSession) {
      chatSession = await db.chatSession.create({
        data: {
          userId,
          title: "Farm Advisor Chat"
        }
      })
    }

    // 2. Save User Message
    const lastUserMessage = messages[messages.length - 1]
    if (lastUserMessage.role === 'user') {
      await db.chatMessage.create({
        data: {
          sessionId: chatSession.id,
          role: 'user',
          content: lastUserMessage.text || lastUserMessage.content, // Handle both formats if needed
          language: language,
          imageAnalysis: imageAnalysis ? JSON.parse(JSON.stringify(imageAnalysis)) : undefined
        }
      })
    }

    // Determine target language name
    const languageNames: Record<string, string> = {
      sw: "Swahili (Kiswahili)",
      ki: "Kikuyu (Gikuyu)",
      luo: "Luo (Dholuo)",
      fr: "French",
      af: "Afrikaans",
      am: "Amharic",
      ar: "Arabic",
      ha: "Hausa",
      ig: "Igbo",
      rw: "Kinyarwanda",
      ln: "Lingala",
      lg: "Luganda",
      rn: "Kirundi",
      st: "Sesotho",
      nso: "Northern Sotho",
      tn: "Setswana",
      so: "Somali",
      ti: "Tigrinya",
      xh: "Xhosa",
      yo: "Yoruba",
      zu: "Zulu",
    }

    const targetLanguage = languageNames[language] || "English"
    const languageInstruction = language !== "en" ? `Reply in ${targetLanguage}.` : ""

    // Build messages array
    const apiMessages = [
      { role: "system", content: SYSTEM_PROMPT + (languageInstruction ? `\n\n${languageInstruction}` : "") },
      ...messages.map((m: { role: string; text: string }) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.text,
      })),
    ]

    // If there's image analysis, add it to the last user message
    if (imageAnalysis) {
      const lastUserIdx = apiMessages.length - 1
      apiMessages[lastUserIdx].content =
        `[Image Analysis Results: ${imageAnalysis}]\n\nUser question: ${apiMessages[lastUserIdx].content}`
    }

    const endpointUrl = new URL(AZURE_ENDPOINT)
    endpointUrl.searchParams.set("api-version", AZURE_API_VERSION)
    const url = endpointUrl.toString()

    console.log("[v0] Calling Azure API at:", url)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": AZURE_KEY,
      },
      body: JSON.stringify({
        messages: apiMessages,
        max_tokens: 800,
        temperature: 0.7,
      }),
    })

    const responseText = await response.text()
    // console.log("[v0] Azure API Response Status:", response.status)

    if (!response.ok) {
      console.error("[v0] Azure GPT Error:", response.status, responseText)
      return NextResponse.json(
        {
          error: "Failed to get AI response",
          message: "I apologize, I'm having trouble connecting right now. Please try again in a moment.",
        },
        { status: 500 },
      )
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      console.error("[v0] JSON Parse Error:", responseText)
      return NextResponse.json(
        {
          error: "Invalid response format",
          message: "I received an unexpected response. Please try again.",
        },
        { status: 500 },
      )
    }

    const aiMessageContent = data.choices?.[0]?.message?.content || "I apologize, I could not process your request."

    // 3. Save AI Response
    await db.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: 'assistant',
        content: aiMessageContent,
        language: language,
      }
    })

    return NextResponse.json({ message: aiMessageContent })
  } catch (error) {
    console.error("[v0] Chat API Error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const chatSession = await db.chatSession.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!chatSession) {
      return NextResponse.json([])
    }

    return NextResponse.json(chatSession.messages)
  } catch (error) {
    console.error("Failed to fetch chat history:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
