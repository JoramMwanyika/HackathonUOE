import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { activityId, cropType, activityType, date, reminderType } = await request.json()

    const activityDate = new Date(date)
    const now = new Date()
    const timeDiff = activityDate.getTime() - now.getTime()
    const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

    // Calculate reminder times
    const reminderTimes = []
    
    // 1 day before reminder
    if (daysUntil > 1) {
      const oneDayBefore = new Date(activityDate)
      oneDayBefore.setDate(oneDayBefore.getDate() - 1)
      oneDayBefore.setHours(18, 0, 0, 0) // 6 PM day before
      reminderTimes.push({
        time: oneDayBefore,
        message: getReminderMessage(cropType, activityType, "tomorrow"),
      })
    }

    // Morning of the day
    const morningOf = new Date(activityDate)
    morningOf.setHours(7, 0, 0, 0) // 7 AM same day
    reminderTimes.push({
      time: morningOf,
      message: getReminderMessage(cropType, activityType, "today"),
    })

    // Store reminders in database (for now, we'll use localStorage on client)
    // In production, you would:
    // 1. Store in database
    // 2. Set up cron job or scheduled function
    // 3. Integrate with Twilio for SMS/voice calls
    // 4. Use Azure Communication Services for voice

    console.log("Reminder scheduled:", {
      activityId,
      cropType,
      activityType,
      date: activityDate,
      reminderType,
      reminderTimes,
    })

    // Simulate scheduling (in production, you'd use a job queue)
    return NextResponse.json({
      success: true,
      activityId,
      reminderType,
      scheduledReminders: reminderTimes.length,
      message: `${reminderTimes.length} reminder(s) scheduled for ${cropType} ${activityType}`,
    })
  } catch (error) {
    console.error("Error scheduling reminder:", error)
    return NextResponse.json({ error: "Failed to schedule reminder" }, { status: 500 })
  }
}

function getReminderMessage(cropType: string, activityType: string, when: string): string {
  const messages: Record<string, Record<string, string>> = {
    planting: {
      today: `Habari! Leo ni siku ya kupanda ${cropType}. Hakikisha udongo una unyevu wa kutosha.`,
      tomorrow: `Kumbusho: Kesho ni siku ya kupanda ${cropType}. Andaa mbegu na zana.`,
    },
    watering: {
      today: `Usisahau kumwagilia ${cropType} leo asubuhi mapema.`,
      tomorrow: `Kesho mwagilia ${cropType}. Angalia hali ya hewa kwanza.`,
    },
    fertilizing: {
      today: `Leo ni siku ya kuweka mbolea kwa ${cropType}. Tumia kiasi sahihi.`,
      tomorrow: `Kesho weka mbolea kwa ${cropType}. Hakikisha udongo una unyevu.`,
    },
    weeding: {
      today: `Leo fanya upaliliaji wa ${cropType}. Ondoa magugu mapema asubuhi.`,
      tomorrow: `Kesho palilia ${cropType}. Angalia saa za jua.`,
    },
    harvesting: {
      today: `${cropType} iko tayari kwa mavuno leo! Vuna mapema asubuhi.`,
      tomorrow: `Kesho ni siku ya mavuno ya ${cropType}. Andaa vifaa.`,
    },
    spraying: {
      today: `Leo nyunyizia dawa ${cropType}. Fanya mapema asubuhi au jioni.`,
      tomorrow: `Kesho nyunyizia ${cropType}. Angalia mvua katika saa 24 za usoni.`,
    },
  }

  return (
    messages[activityType]?.[when] ||
    `Reminder: ${activityType} for ${cropType} ${when}`
  )
}

// Endpoint to send voice call reminder
export async function GET(request: NextRequest) {
  // This would integrate with Azure Communication Services or Twilio
  // to make actual voice calls
  
  const searchParams = request.nextUrl.searchParams
  const phoneNumber = searchParams.get("phone")
  const message = searchParams.get("message")

  if (!phoneNumber || !message) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  }

  // Simulate voice call (in production, use Azure Speech + Communication Services)
  console.log("Voice call would be made to:", phoneNumber)
  console.log("Message:", message)

  return NextResponse.json({
    success: true,
    method: "voice",
    phoneNumber,
    message: "Voice reminder sent successfully",
  })
}
