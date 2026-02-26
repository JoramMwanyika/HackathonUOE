import { type NextRequest, NextResponse } from "next/server"

// Azure Computer Vision for image analysis
const VISION_ENDPOINT = process.env.AZURE_VISION_ENDPOINT!
const VISION_KEY = process.env.AZURE_VISION_KEY!

// Azure GPT-4 for disease analysis
const GPT_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT!
const GPT_KEY = process.env.AZURE_OPENAI_KEY!
const GPT_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || "2025-01-01-preview"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const imageFile = formData.get("image") as File
    const language = (formData.get("language") as string) || "en"

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Convert file to buffer
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Step 1: Analyze image with Azure Computer Vision
    const visionResponse = await fetch(
      `${VISION_ENDPOINT}/computervision/imageanalysis:analyze?api-version=2024-02-01&features=caption,tags,objects,denseCaptions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "Ocp-Apim-Subscription-Key": VISION_KEY,
        },
        body: buffer,
      },
    )

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text()
      console.error("Vision API Error:", visionResponse.status, errorText)
      return NextResponse.json({ error: "Failed to analyze image", details: errorText }, { status: 500 })
    }

    const visionData = await visionResponse.json()

    // Extract relevant information
    const caption = visionData.captionResult?.text || "Unknown image"
    const tags = visionData.tagsResult?.values?.map((t: { name: string }) => t.name).join(", ") || ""
    const denseCaptions = visionData.denseCaptionsResult?.values?.map((c: { text: string }) => c.text).join("; ") || ""

    // Step 2: Use GPT-4 to analyze for plant diseases
    const analysisPrompt = `You are an expert agricultural plant pathologist. Analyze this image description and identify any plant diseases, pests, or health issues.

Image Caption: ${caption}
Tags: ${tags}
Detailed Descriptions: ${denseCaptions}

Based on this information:
1. Identify if this appears to be a plant/crop image
2. If it's a plant, identify any visible diseases, pests, nutrient deficiencies, or health issues
3. Provide the likely disease/condition name
4. Rate the severity (Mild, Moderate, Severe, or Healthy)
5. List key symptoms visible
6. Provide an actionable recommendation on what to do next (TREATMENT).

VERY IMPORTANT: Translate your ENTIRE final JSON output (including the treatment and symptoms) into the language code: "${language}" if it is not "en". 

Respond in this exact JSON format:
{
  "isPlant": true/false,
  "plantType": "identified plant or crop type",
  "condition": "disease or condition name, or 'Healthy' if no issues",
  "severity": "Mild/Moderate/Severe/Healthy",
  "symptoms": ["symptom 1", "symptom 2"],
  "confidence": "High/Medium/Low",
  "summary": "Brief 1-2 sentence summary for farmer",
  "treatment": "Actionable recommendation or treatment plan that the farmer should do right now."
}`

    const gptUrl = new URL(GPT_ENDPOINT)
    gptUrl.searchParams.set("api-version", GPT_API_VERSION)

    const gptResponse = await fetch(gptUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": GPT_KEY,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are an expert agricultural plant pathologist. Always respond with valid JSON.",
          },
          { role: "user", content: analysisPrompt },
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    })

    if (!gptResponse.ok) {
      const errorText = await gptResponse.text()
      console.error("GPT Analysis Error:", gptResponse.status, errorText)
      // Return basic vision results if GPT fails
      return NextResponse.json({
        analysis: {
          isPlant: tags.toLowerCase().includes("plant") || tags.toLowerCase().includes("leaf"),
          plantType: "Unknown",
          condition: "Analysis unavailable",
          severity: "Unknown",
          symptoms: [],
          confidence: "Low",
          summary: caption,
          treatment: "Unable to generate treatment plan."
        },
        rawVision: { caption, tags, denseCaptions },
      })
    }

    const gptData = await gptResponse.json()
    const gptContent = gptData.choices?.[0]?.message?.content || "{}"

    let analysis
    try {
      // Try to parse JSON from GPT response
      const jsonMatch = gptContent.match(/\{[\s\S]*\}/)
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: gptContent }
    } catch {
      analysis = { summary: gptContent, condition: "Analysis completed", severity: "Unknown" }
    }

    return NextResponse.json({
      analysis,
      rawVision: { caption, tags, denseCaptions },
    })
  } catch (error) {
    console.error("Image Analysis Error:", error)
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 })
  }
}
