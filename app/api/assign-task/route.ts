import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { voiceCommand } = body

    // Parse voice command to extract task details
    // Examples:
    // "Assign John to water the tomatoes tomorrow"
    // "Tell Mary to plant maize on Friday"
    // "Have Peter fertilize the cabbage field this weekend"

    const taskData = parseVoiceCommand(voiceCommand)

    if (!taskData.assignedTo || !taskData.taskType) {
      return NextResponse.json(
        {
          success: false,
          message: "Could not understand the task assignment. Please specify who should do what.",
          suggestion: "Try saying: 'Assign John to water the tomatoes tomorrow'",
        },
        { status: 400 }
      )
    }

    // Load team members
    const membersData = typeof localStorage !== "undefined" ? localStorage.getItem("farmTeamMembers") : null
    const members = membersData ? JSON.parse(membersData) : []

    // Find member by name (fuzzy match)
    const member = members.find(
      (m: any) =>
        m.name.toLowerCase().includes(taskData.assignedTo.toLowerCase()) ||
        taskData.assignedTo.toLowerCase().includes(m.name.toLowerCase().split(" ")[0].toLowerCase())
    )

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          message: `Could not find team member "${taskData.assignedTo}". Please add them to your team first.`,
          availableMembers: members.map((m: any) => m.name),
        },
        { status: 404 }
      )
    }

    // Create task
    const task = {
      id: `task-${Date.now()}`,
      title: taskData.title,
      description: taskData.description || `Voice assigned: ${voiceCommand}`,
      assignedTo: member.id,
      assignedBy: "user-1", // In real app, get from session
      cropType: taskData.cropType || "General Farm Work",
      taskType: taskData.taskType,
      dueDate: taskData.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000), // Default: tomorrow
      status: "pending" as const,
      voiceAssigned: true,
    }

    // Return task to be saved by client
    return NextResponse.json({
      success: true,
      task,
      message: `Task assigned to ${member.name}: ${task.title}`,
      memberName: member.name,
      memberPhone: member.phoneNumber,
    })
  } catch (error) {
    console.error("Task assignment error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error processing voice command",
      },
      { status: 500 }
    )
  }
}

function parseVoiceCommand(command: string): {
  assignedTo: string
  taskType: string
  title: string
  description?: string
  cropType?: string
  dueDate?: Date
} {
  const lowerCommand = command.toLowerCase()

  // Extract person name (after "assign", "tell", "have", or before "to")
  let assignedTo = ""
  const assignPatterns = [
    /assign\s+(\w+)/i,
    /tell\s+(\w+)/i,
    /have\s+(\w+)/i,
    /ask\s+(\w+)/i,
  ]

  for (const pattern of assignPatterns) {
    const match = command.match(pattern)
    if (match) {
      assignedTo = match[1]
      break
    }
  }

  // Extract task type
  let taskType = "general"
  let title = command

  if (lowerCommand.includes("water")) {
    taskType = "watering"
    title = extractTaskTitle(command, ["water", "watering"])
  } else if (lowerCommand.includes("plant")) {
    taskType = "planting"
    title = extractTaskTitle(command, ["plant", "planting"])
  } else if (lowerCommand.includes("fertilize") || lowerCommand.includes("fertilizer")) {
    taskType = "fertilizing"
    title = extractTaskTitle(command, ["fertilize", "fertilizing", "fertilizer"])
  } else if (lowerCommand.includes("weed")) {
    taskType = "weeding"
    title = extractTaskTitle(command, ["weed", "weeding"])
  } else if (lowerCommand.includes("harvest")) {
    taskType = "harvesting"
    title = extractTaskTitle(command, ["harvest", "harvesting"])
  } else if (lowerCommand.includes("spray")) {
    taskType = "spraying"
    title = extractTaskTitle(command, ["spray", "spraying"])
  }

  // Extract crop type
  let cropType = undefined
  const crops = [
    { name: "Maize (Mahindi)", keywords: ["maize", "mahindi", "corn"] },
    { name: "Beans (Maharagwe)", keywords: ["beans", "maharagwe"] },
    { name: "Tomatoes (Nyanya)", keywords: ["tomato", "tomatoes", "nyanya"] },
    { name: "Kale (Sukuma Wiki)", keywords: ["kale", "sukuma", "sukuma wiki"] },
    { name: "Cabbage (Kabichi)", keywords: ["cabbage", "kabichi"] },
    { name: "Potatoes (Viazi)", keywords: ["potato", "potatoes", "viazi"] },
  ]

  for (const crop of crops) {
    if (crop.keywords.some((keyword) => lowerCommand.includes(keyword))) {
      cropType = crop.name
      break
    }
  }

  // Extract due date
  let dueDate = undefined
  if (lowerCommand.includes("tomorrow")) {
    dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
  } else if (lowerCommand.includes("today")) {
    dueDate = new Date()
  } else if (lowerCommand.includes("monday")) {
    dueDate = getNextDayOfWeek(1)
  } else if (lowerCommand.includes("tuesday")) {
    dueDate = getNextDayOfWeek(2)
  } else if (lowerCommand.includes("wednesday")) {
    dueDate = getNextDayOfWeek(3)
  } else if (lowerCommand.includes("thursday")) {
    dueDate = getNextDayOfWeek(4)
  } else if (lowerCommand.includes("friday")) {
    dueDate = getNextDayOfWeek(5)
  } else if (lowerCommand.includes("saturday")) {
    dueDate = getNextDayOfWeek(6)
  } else if (lowerCommand.includes("sunday")) {
    dueDate = getNextDayOfWeek(0)
  } else if (lowerCommand.includes("next week")) {
    dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }

  return {
    assignedTo,
    taskType,
    title,
    cropType,
    dueDate,
  }
}

function extractTaskTitle(command: string, keywords: string[]): string {
  // Remove assignment phrases to clean up title
  let title = command
    .replace(/assign\s+\w+\s+to/i, "")
    .replace(/tell\s+\w+\s+to/i, "")
    .replace(/have\s+\w+/i, "")
    .replace(/ask\s+\w+\s+to/i, "")
    .trim()

  // Capitalize first letter
  return title.charAt(0).toUpperCase() + title.slice(1)
}

function getNextDayOfWeek(targetDay: number): Date {
  const today = new Date()
  const currentDay = today.getDay()
  let daysUntilTarget = targetDay - currentDay

  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7
  }

  const targetDate = new Date(today)
  targetDate.setDate(today.getDate() + daysUntilTarget)
  return targetDate
}
