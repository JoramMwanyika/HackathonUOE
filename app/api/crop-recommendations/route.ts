import { NextRequest, NextResponse } from "next/server"

type CropData = {
  name: string
  growthDays: number
  idealTemp: { min: number; max: number }
  waterNeeds: "low" | "medium" | "high"
  moonPhasePreference: string[]
  season: "short-rains" | "long-rains" | "year-round"
}

const CROPS_DATABASE: CropData[] = [
  {
    name: "Maize (Mahindi)",
    growthDays: 120,
    idealTemp: { min: 18, max: 30 },
    waterNeeds: "medium",
    moonPhasePreference: ["new", "waxing"],
    season: "long-rains",
  },
  {
    name: "Beans (Maharagwe)",
    growthDays: 70,
    idealTemp: { min: 15, max: 27 },
    waterNeeds: "medium",
    moonPhasePreference: ["waxing", "full"],
    season: "short-rains",
  },
  {
    name: "Tomatoes (Nyanya)",
    growthDays: 80,
    idealTemp: { min: 18, max: 26 },
    waterNeeds: "high",
    moonPhasePreference: ["full", "waxing"],
    season: "year-round",
  },
  {
    name: "Kale (Sukuma Wiki)",
    growthDays: 45,
    idealTemp: { min: 15, max: 25 },
    waterNeeds: "medium",
    moonPhasePreference: ["waxing", "full"],
    season: "year-round",
  },
  {
    name: "Cabbage (Kabichi)",
    growthDays: 90,
    idealTemp: { min: 15, max: 25 },
    waterNeeds: "high",
    moonPhasePreference: ["waxing", "full"],
    season: "year-round",
  },
  {
    name: "Potatoes (Viazi)",
    growthDays: 100,
    idealTemp: { min: 15, max: 22 },
    waterNeeds: "medium",
    moonPhasePreference: ["new", "waning"],
    season: "short-rains",
  },
]

export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude, currentMoonPhase } = await request.json()

    // Get current weather (you can integrate with OpenWeatherMap API here)
    const currentTemp = 24 // Fallback temperature
    const currentMonth = new Date().getMonth()

    // Determine season based on month (Kenya has two rainy seasons)
    let currentSeason: "short-rains" | "long-rains" | "dry"
    if (currentMonth >= 2 && currentMonth <= 5) {
      currentSeason = "long-rains" // March to June
    } else if (currentMonth >= 9 && currentMonth <= 11) {
      currentSeason = "short-rains" // October to December
    } else {
      currentSeason = "dry"
    }

    // Generate recommendations using AI logic
    const recommendations = await Promise.all(
      CROPS_DATABASE.map(async (crop) => {
        let suitabilityScore = 0
        let reasons: string[] = []

        // Temperature suitability (40 points)
        if (currentTemp >= crop.idealTemp.min && currentTemp <= crop.idealTemp.max) {
          suitabilityScore += 40
          reasons.push(`Ideal temperature range (${crop.idealTemp.min}°C - ${crop.idealTemp.max}°C)`)
        } else if (
          currentTemp >= crop.idealTemp.min - 5 &&
          currentTemp <= crop.idealTemp.max + 5
        ) {
          suitabilityScore += 20
          reasons.push("Temperature acceptable")
        }

        // Season suitability (30 points)
        if (crop.season === "year-round" || crop.season === currentSeason) {
          suitabilityScore += 30
          if (currentSeason !== "dry") {
            reasons.push(`${currentSeason === "long-rains" ? "Long" : "Short"} rains season - optimal planting time`)
          }
        }

        // Moon phase suitability (20 points)
        if (crop.moonPhasePreference.includes(currentMoonPhase)) {
          suitabilityScore += 20
          const moonPhaseNames: Record<string, string> = {
            new: "New Moon - excellent for root crops",
            waxing: "Waxing Moon - great for leafy vegetables",
            full: "Full Moon - perfect for fruit-bearing plants",
            waning: "Waning Moon - good for maintenance",
          }
          reasons.push(moonPhaseNames[currentMoonPhase] || "Favorable moon phase")
        }

        // Rainfall expectation (10 points)
        if (currentSeason !== "dry") {
          suitabilityScore += 10
          reasons.push("Good rainfall expected")
        }

        const today = new Date()
        const plantingWindowStart = new Date(today)
        const plantingWindowEnd = new Date(today)
        plantingWindowEnd.setDate(plantingWindowEnd.getDate() + 14) // 2-week window

        const harvestDate = new Date(plantingWindowStart)
        harvestDate.setDate(harvestDate.getDate() + crop.growthDays)

        return {
          crop: crop.name,
          plantingWindow: {
            start: plantingWindowStart,
            end: plantingWindowEnd,
          },
          reason: reasons.join(". ") + ".",
          moonPhase: getMoonPhaseName(currentMoonPhase),
          expectedHarvest: harvestDate,
          weatherSuitability: suitabilityScore,
        }
      })
    )

    // Sort by suitability score and return top recommendations
    const sortedRecommendations = recommendations
      .filter((r) => r.weatherSuitability >= 50) // Only show suitable crops
      .sort((a, b) => b.weatherSuitability - a.weatherSuitability)
      .slice(0, 5)

    return NextResponse.json({
      recommendations: sortedRecommendations,
      location: { latitude, longitude },
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error generating recommendations:", error)
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    )
  }
}

function getMoonPhaseName(phase: string): string {
  const names: Record<string, string> = {
    new: "New Moon 🌑 - Best for root crops",
    waxing: "Waxing Moon 🌒 - Good for leafy vegetables",
    full: "Full Moon 🌕 - Ideal for fruit-bearing crops",
    waning: "Waning Moon 🌘 - Best for weeding and pruning",
  }
  return names[phase] || "Unknown phase"
}
