"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Calendar as CalendarIcon, Plus, Bell, Moon, Phone, MessageSquare, Volume2, MapPin, Thermometer, Droplets } from "lucide-react"
import { toast } from "sonner"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

type CropActivity = {
  id: string
  cropType: string
  activityType: "planting" | "watering" | "fertilizing" | "weeding" | "harvesting" | "spraying"
  date: Date
  moonPhase?: string
  weatherCondition?: string
  notes?: string
  reminderEnabled: boolean
  reminderType: "voice" | "sms" | "both"
  status: "pending" | "completed" | "missed"
}

type CropRecommendation = {
  crop: string
  plantingWindow: { start: Date; end: Date }
  reason: string
  moonPhase: string
  expectedHarvest: Date
  weatherSuitability: number
}

const CROP_TYPES = [
  "Maize (Mahindi)",
  "Beans (Maharagwe)",
  "Tomatoes (Nyanya)",
  "Kale (Sukuma Wiki)",
  "Cabbage (Kabichi)",
  "Potatoes (Viazi)",
  "Carrots (Karoti)",
  "Onions (Vitunguu)",
  "Bananas (Ndizi)",
  "Coffee (Kahawa)",
]

const ACTIVITY_TYPES = [
  { value: "planting", label: "Planting", icon: "🌱" },
  { value: "watering", label: "Watering", icon: "💧" },
  { value: "fertilizing", label: "Fertilizing", icon: "🌿" },
  { value: "weeding", label: "Weeding", icon: "🌾" },
  { value: "harvesting", label: "Harvesting", icon: "🌽" },
  { value: "spraying", label: "Spraying", icon: "💨" },
]

const MOON_PHASES = [
  { value: "new", label: "New Moon 🌑", plantingAdvice: "Best for planting root crops" },
  { value: "waxing", label: "Waxing Moon 🌒", plantingAdvice: "Good for planting leafy vegetables" },
  { value: "full", label: "Full Moon 🌕", plantingAdvice: "Ideal for planting fruit-bearing crops" },
  { value: "waning", label: "Waning Moon 🌘", plantingAdvice: "Best time for weeding and pruning" },
]

export default function CropCalendarPage() {
  const [activities, setActivities] = useState<CropActivity[]>([])
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [currentMoonPhase, setCurrentMoonPhase] = useState<string>("waxing")

  // New activity form state
  const [newActivity, setNewActivity] = useState({
    cropType: "",
    activityType: "",
    date: new Date(),
    notes: "",
    reminderEnabled: true,
    reminderType: "voice" as "voice" | "sms" | "both",
  })

  useEffect(() => {
    loadActivities()
    getCurrentLocation()
    calculateMoonPhase()
  }, [])

  useEffect(() => {
    if (location) {
      loadRecommendations()
    }
  }, [location])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        () => {
          // Default to Nairobi if location fails
          setLocation({ lat: -1.286389, lon: 36.817223 })
        }
      )
    } else {
      setLocation({ lat: -1.286389, lon: 36.817223 })
    }
  }

  const calculateMoonPhase = () => {
    // Simple moon phase calculation
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const day = today.getDate()

    // Simplified algorithm - in production, use a proper astronomy library
    const phase = ((year - 2000) * 12.3685 + month + day * 0.03) % 29.53
    
    if (phase < 7.38) setCurrentMoonPhase("new")
    else if (phase < 14.77) setCurrentMoonPhase("waxing")
    else if (phase < 22.15) setCurrentMoonPhase("full")
    else setCurrentMoonPhase("waning")
  }

  const loadActivities = () => {
    // Load from localStorage
    const saved = localStorage.getItem("cropActivities")
    if (saved) {
      const parsed = JSON.parse(saved)
      setActivities(parsed.map((a: any) => ({ ...a, date: new Date(a.date) })))
    } else {
      // Demo data
      const demoActivities: CropActivity[] = [
        {
          id: "1",
          cropType: "Maize (Mahindi)",
          activityType: "planting",
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          moonPhase: "new",
          weatherCondition: "Sunny, 24°C",
          notes: "Plant after the rains begin",
          reminderEnabled: true,
          reminderType: "both",
          status: "pending",
        },
        {
          id: "2",
          cropType: "Tomatoes (Nyanya)",
          activityType: "watering",
          date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          moonPhase: "waxing",
          notes: "Early morning watering",
          reminderEnabled: true,
          reminderType: "voice",
          status: "pending",
        },
        {
          id: "3",
          cropType: "Kale (Sukuma Wiki)",
          activityType: "harvesting",
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          moonPhase: "full",
          notes: "Ready for harvest",
          reminderEnabled: true,
          reminderType: "sms",
          status: "pending",
        },
      ]
      setActivities(demoActivities)
    }
  }

  const loadRecommendations = async () => {
    if (!location) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/crop-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: location.lat,
          longitude: location.lon,
          currentMoonPhase,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const recs = (data.recommendations || []).map((rec: any) => ({
          ...rec,
          plantingWindow: {
            start: new Date(rec.plantingWindow.start),
            end: new Date(rec.plantingWindow.end),
          },
          expectedHarvest: new Date(rec.expectedHarvest),
        }))
        setRecommendations(recs)
      }
    } catch (error) {
      console.error("Error loading recommendations:", error)
      // Demo recommendations
      setRecommendations([
        {
          crop: "Maize (Mahindi)",
          plantingWindow: { start: new Date(), end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
          reason: "Optimal rainfall expected. Long rains season approaching.",
          moonPhase: "New Moon - Best for root development",
          expectedHarvest: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
          weatherSuitability: 95,
        },
        {
          crop: "Beans (Maharagwe)",
          plantingWindow: { start: new Date(), end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
          reason: "Good soil moisture. Temperature range ideal.",
          moonPhase: "Waxing Moon - Good for leafy growth",
          expectedHarvest: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000),
          weatherSuitability: 88,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const addActivity = async () => {
    if (!newActivity.cropType || !newActivity.activityType) {
      toast.error("Please fill in all required fields")
      return
    }

    const activity: CropActivity = {
      id: Date.now().toString(),
      cropType: newActivity.cropType,
      activityType: newActivity.activityType as any,
      date: newActivity.date,
      notes: newActivity.notes,
      reminderEnabled: newActivity.reminderEnabled,
      reminderType: newActivity.reminderType,
      moonPhase: currentMoonPhase,
      status: "pending",
    }

    const updatedActivities = [...activities, activity]
    setActivities(updatedActivities)
    localStorage.setItem("cropActivities", JSON.stringify(updatedActivities))

    // Schedule reminder
    if (activity.reminderEnabled) {
      await scheduleReminder(activity)
    }

    toast.success("Activity added to calendar!", {
      description: `Reminder will be sent via ${activity.reminderType}`,
    })

    setIsAddDialogOpen(false)
    resetForm()
  }

  const scheduleReminder = async (activity: CropActivity) => {
    try {
      await fetch("/api/schedule-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityId: activity.id,
          cropType: activity.cropType,
          activityType: activity.activityType,
          date: activity.date,
          reminderType: activity.reminderType,
        }),
      })
    } catch (error) {
      console.error("Error scheduling reminder:", error)
    }
  }

  const toggleActivityStatus = (id: string) => {
    const updated = activities.map((a) =>
      a.id === id 
        ? { ...a, status: (a.status === "completed" ? "pending" : "completed") as "pending" | "completed" } 
        : a
    )
    setActivities(updated)
    localStorage.setItem("cropActivities", JSON.stringify(updated))
    toast.success("Activity status updated")
  }

  const resetForm = () => {
    setNewActivity({
      cropType: "",
      activityType: "",
      date: new Date(),
      notes: "",
      reminderEnabled: true,
      reminderType: "voice",
    })
  }

  const getUpcomingActivities = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return activities
      .filter((a) => a.status === "pending" && a.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5)
  }

  const getTodayActivities = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return activities.filter(
      (a) => a.date >= today && a.date < tomorrow && a.status === "pending"
    )
  }

  const getActivityIcon = (type: string) => {
    const activity = ACTIVITY_TYPES.find((a) => a.value === type)
    return activity?.icon || "📅"
  }

  const getMoonPhaseInfo = () => {
    return MOON_PHASES.find((m) => m.value === currentMoonPhase) || MOON_PHASES[0]
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <Header title="Crop Calendar" />

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {/* Moon Phase & Weather Card */}
        <Card className="border-2 border-green-200 shadow-lg">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-full">
                  <Moon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Current Moon Phase</p>
                  <p className="font-bold text-gray-900">{getMoonPhaseInfo().label}</p>
                  <p className="text-xs text-gray-500">{getMoonPhaseInfo().plantingAdvice}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-full">
                  <Thermometer className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Location</p>
                  <p className="font-bold text-gray-900">Nairobi</p>
                  <p className="text-xs text-gray-500">24°C, Partly Cloudy</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Activities */}
        {getTodayActivities().length > 0 && (
          <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-yellow-600" />
                Today's Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getTodayActivities().map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-yellow-200"
                >
                  <span className="text-2xl">{getActivityIcon(activity.activityType)}</span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{activity.cropType}</p>
                    <p className="text-sm text-gray-600 capitalize">{activity.activityType}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500 text-green-700 hover:bg-green-50"
                    onClick={() => toggleActivityStatus(activity.id)}
                  >
                    Mark Done
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Upcoming Activities</h3>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Activity
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Crop Activity</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Crop Type</Label>
                      <Select
                        value={newActivity.cropType}
                        onValueChange={(value) => setNewActivity({ ...newActivity, cropType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select crop" />
                        </SelectTrigger>
                        <SelectContent>
                          {CROP_TYPES.map((crop) => (
                            <SelectItem key={crop} value={crop}>
                              {crop}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Activity Type</Label>
                      <Select
                        value={newActivity.activityType}
                        onValueChange={(value) => setNewActivity({ ...newActivity, activityType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity" />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTIVITY_TYPES.map((activity) => (
                            <SelectItem key={activity.value} value={activity.value}>
                              {activity.icon} {activity.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={newActivity.date.toISOString().split("T")[0]}
                        onChange={(e) =>
                          setNewActivity({ ...newActivity, date: new Date(e.target.value) })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Notes (Optional)</Label>
                      <Input
                        placeholder="Add notes..."
                        value={newActivity.notes}
                        onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                      />
                    </div>

                    <div className="space-y-3 pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <Label>Enable Reminders</Label>
                        <Switch
                          checked={newActivity.reminderEnabled}
                          onCheckedChange={(checked) =>
                            setNewActivity({ ...newActivity, reminderEnabled: checked })
                          }
                        />
                      </div>

                      {newActivity.reminderEnabled && (
                        <div className="space-y-2">
                          <Label>Reminder Type</Label>
                          <Select
                            value={newActivity.reminderType}
                            onValueChange={(value: any) =>
                              setNewActivity({ ...newActivity, reminderType: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="voice">
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4" />
                                  Voice Call
                                </div>
                              </SelectItem>
                              <SelectItem value="sms">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4" />
                                  SMS
                                </div>
                              </SelectItem>
                              <SelectItem value="both">
                                <div className="flex items-center gap-2">
                                  <Volume2 className="h-4 w-4" />
                                  Voice + SMS
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-green-600 to-green-700"
                      onClick={addActivity}
                    >
                      Add Activity
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {getUpcomingActivities().length === 0 ? (
                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="p-8 text-center">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">No upcoming activities</p>
                    <Button
                      variant="outline"
                      className="border-green-500 text-green-700"
                      onClick={() => setIsAddDialogOpen(true)}
                    >
                      Add Your First Activity
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                getUpcomingActivities().map((activity) => (
                  <Card key={activity.id} className="border-2 border-green-200 hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{getActivityIcon(activity.activityType)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900">{activity.cropType}</h4>
                            <Badge variant="outline" className="text-xs capitalize">
                              {activity.activityType}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {activity.date.toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          {activity.notes && (
                            <p className="text-xs text-gray-500 mb-2">{activity.notes}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            {activity.moonPhase && <span>🌙 {activity.moonPhase}</span>}
                            {activity.reminderEnabled && (
                              <span className="flex items-center gap-1">
                                <Bell className="h-3 w-3" />
                                {activity.reminderType === "voice" && "Voice"}
                                {activity.reminderType === "sms" && "SMS"}
                                {activity.reminderType === "both" && "Voice + SMS"}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={activity.status === "completed" ? "secondary" : "outline"}
                          onClick={() => toggleActivityStatus(activity.id)}
                        >
                          {activity.status === "completed" ? "✓ Done" : "Mark Done"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4 mt-4">
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  AI-Powered Recommendations
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Based on your location, weather, and moon phase
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-600 mt-3">Loading recommendations...</p>
                  </div>
                ) : recommendations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No recommendations available</p>
                    <Button
                      variant="outline"
                      className="mt-3"
                      onClick={loadRecommendations}
                    >
                      Refresh Recommendations
                    </Button>
                  </div>
                ) : (
                  recommendations.map((rec, index) => (
                    <Card key={index} className="border-2 border-green-300 bg-white">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-lg text-gray-900">{rec.crop}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="bg-green-600">
                                {rec.weatherSuitability}% Suitable
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <CalendarIcon className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Planting Window:</span>
                            <span className="text-gray-600">
                              {new Date(rec.plantingWindow.start).toLocaleDateString()} -{" "}
                              {new Date(rec.plantingWindow.end).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Moon className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">Moon Phase:</span>
                            <span className="text-gray-600">{rec.moonPhase}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Droplets className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Expected Harvest:</span>
                            <span className="text-gray-600">
                              {new Date(rec.expectedHarvest).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded mb-3">
                          <p className="text-sm text-gray-700">{rec.reason}</p>
                        </div>

                        <Button
                          className="w-full bg-gradient-to-r from-green-600 to-green-700"
                          onClick={() => {
                            setNewActivity({
                              ...newActivity,
                              cropType: rec.crop,
                              activityType: "planting",
                              date: rec.plantingWindow.start,
                            })
                            setIsAddDialogOpen(true)
                          }}
                        >
                          Add to Calendar
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="mt-4">
            <Card className="border-2 border-green-200">
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border mx-auto"
                />
                <div className="mt-4">
                  <h4 className="font-bold text-gray-900 mb-3">
                    Activities on {selectedDate?.toLocaleDateString()}
                  </h4>
                  {activities
                    .filter((a) => {
                      if (!selectedDate) return false
                      const activityDate = new Date(a.date)
                      return (
                        activityDate.toDateString() === selectedDate.toDateString()
                      )
                    })
                    .map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200 mb-2"
                      >
                        <span className="text-2xl">{getActivityIcon(activity.activityType)}</span>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{activity.cropType}</p>
                          <p className="text-sm text-gray-600 capitalize">
                            {activity.activityType}
                          </p>
                        </div>
                      </div>
                    ))}
                  {activities.filter((a) => {
                    if (!selectedDate) return false
                    return new Date(a.date).toDateString() === selectedDate.toDateString()
                  }).length === 0 && (
                    <p className="text-gray-500 text-center py-4">No activities on this date</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  )
}
