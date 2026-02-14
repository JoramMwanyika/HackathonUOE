"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Users, Plus, UserPlus, CheckCircle, Clock, MessageSquare, Phone, Volume2, Trash2, User, Sparkles, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"

type FarmMember = {
  id: string
  name: string
  phoneNumber: string
  role: "owner" | "worker" | "family"
  joinedDate: Date
  isActive: boolean
}

type SharedTask = {
  id: string
  title: string
  description: string
  assignedTo: string
  assignedBy: string
  cropType: string
  taskType: "planting" | "watering" | "fertilizing" | "weeding" | "harvesting" | "spraying" | "general"
  dueDate: Date
  status: "pending" | "in-progress" | "completed"
  completedBy?: string
  completedAt?: Date
  voiceAssigned: boolean
}

const CROP_TYPES = [
  "Maize (Mahindi)", "Beans (Maharagwe)", "Tomatoes (Nyanya)",
  "Kale (Sukuma Wiki)", "Cabbage (Kabichi)", "Potatoes (Viazi)",
  "Carrots (Karoti)", "Onions (Vitunguu)", "General Farm Work"
]

const TASK_TYPES = [
  { value: "planting", label: "Planting", icon: "🌱" },
  { value: "watering", label: "Watering", icon: "💧" },
  { value: "fertilizing", label: "Fertilizing", icon: "🌿" },
  { value: "weeding", label: "Weeding", icon: "🌾" },
  { value: "harvesting", label: "Harvesting", icon: "🌽" },
  { value: "spraying", label: "Spraying", icon: "💨" },
  { value: "general", label: "General Task", icon: "📋" },
]

export default function TeamCollaborationPage() {
  const [members, setMembers] = useState<FarmMember[]>([])
  const [tasks, setTasks] = useState<SharedTask[]>([])
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [currentUserId] = useState("user-1")

  const [newMember, setNewMember] = useState({
    name: "",
    phoneNumber: "",
    role: "worker" as "owner" | "worker" | "family",
  })

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    cropType: "",
    taskType: "",
    dueDate: new Date(),
  })

  /* New state for farm blocks */
  const [farmBlocks, setFarmBlocks] = useState<{ id: string, name: string, crop: string }[]>([])

  useEffect(() => {
    loadMembers()
    loadTasks()
    loadFarmBlocks()
  }, [])

  const loadFarmBlocks = async () => {
    try {
      const res = await fetch('/api/farm')
      if (res.ok) {
        const farm = await res.json()
        if (farm.blocks) {
          setFarmBlocks(farm.blocks.map((b: any) => ({
            id: b.id,
            name: b.name,
            crop: b.cropType
          })))
        }
      }
    } catch (e) {
      console.error("Failed to load farm blocks", e)
    }
  }

  /* ... existing loadMembers and loadTasks ... */
  // Preserving loadMembers and loadTasks as they were, just inserting loadFarmBlocks before them in the file flow if needed, 
  // but to keep the edit clean, I am only replacing the top part and the addTask function part. 
  // Wait, I need to replace the state initialization and useEffect first.

  // Actually, let's do this in chunks. First chunk: State and Effect.


  const loadMembers = () => {
    const saved = localStorage.getItem("farmTeamMembers")
    if (saved) {
      const parsed = JSON.parse(saved)
      setMembers(parsed.map((m: any) => ({ ...m, joinedDate: new Date(m.joinedDate) })))
    } else {
      const demoMembers: FarmMember[] = [
        { id: "user-1", name: "Farm Owner", phoneNumber: "+254712345678", role: "owner", joinedDate: new Date(), isActive: true },
        { id: "member-1", name: "John Kamau", phoneNumber: "+254723456789", role: "worker", joinedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), isActive: true },
        { id: "member-2", name: "Mary Wanjiku", phoneNumber: "+254734567890", role: "family", joinedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), isActive: true },
      ]
      setMembers(demoMembers)
    }
  }

  const loadTasks = () => {
    const saved = localStorage.getItem("farmTeamTasks")
    if (saved) {
      const parsed = JSON.parse(saved)
      setTasks(parsed.map((t: any) => ({ ...t, dueDate: new Date(t.dueDate), completedAt: t.completedAt ? new Date(t.completedAt) : undefined })))
    } else {
      const demoTasks: SharedTask[] = [
        {
          id: "task-1",
          title: "Plant Maize in North Field",
          description: "Plant 5 acres of maize following the lines we marked yesterday",
          assignedTo: "member-1",
          assignedBy: "user-1",
          cropType: "Maize (Mahindi)",
          taskType: "planting",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          status: "pending",
          voiceAssigned: true,
        },
        {
          id: "task-2",
          title: "Water Tomato Greenhouse",
          description: "Morning watering for all tomato plants",
          assignedTo: "member-2",
          assignedBy: "user-1",
          cropType: "Tomatoes (Nyanya)",
          taskType: "watering",
          dueDate: new Date(),
          status: "in-progress",
          voiceAssigned: false,
        },
      ]
      setTasks(demoTasks)
    }
  }

  const addMember = () => {
    if (!newMember.name || !newMember.phoneNumber) {
      toast.error("Please fill in all fields")
      return
    }
    const member: FarmMember = {
      id: `member-${Date.now()}`,
      name: newMember.name,
      phoneNumber: newMember.phoneNumber,
      role: newMember.role,
      joinedDate: new Date(),
      isActive: true,
    }
    const updated = [...members, member]
    setMembers(updated)
    localStorage.setItem("farmTeamMembers", JSON.stringify(updated))
    toast.success(`${member.name} added to your farm team!`)
    setIsAddMemberOpen(false)
    setNewMember({ name: "", phoneNumber: "", role: "worker" })
  }

  const addTask = async () => {
    if (!newTask.title || !newTask.assignedTo || !newTask.taskType) {
      toast.error("Please fill in all required fields")
      return
    }
    const task: SharedTask = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      assignedTo: newTask.assignedTo,
      assignedBy: currentUserId,
      cropType: newTask.cropType || "General Farm Work",
      taskType: newTask.taskType as any,
      dueDate: newTask.dueDate,
      status: "pending",
      voiceAssigned: false,
    }
    const updatedTasks = [...tasks, task]
    setTasks(updatedTasks)
    localStorage.setItem("farmTeamTasks", JSON.stringify(updatedTasks))
    toast.success("Task assigned!")
    setIsAddTaskOpen(false)
    setNewTask({ title: "", description: "", assignedTo: "", cropType: "", taskType: "", dueDate: new Date() })
  }

  const updateTaskStatus = (taskId: string, newStatus: "pending" | "in-progress" | "completed") => {
    const updated = tasks.map((t) => t.id === taskId ? { ...t, status: newStatus, completedBy: newStatus === "completed" ? currentUserId : t.completedBy, completedAt: newStatus === "completed" ? new Date() : t.completedAt } : t)
    setTasks(updated)
    localStorage.setItem("farmTeamTasks", JSON.stringify(updated))
    toast.success(`Task ${newStatus}!`)
  }

  const deleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId)
    setTasks(updated)
    localStorage.setItem("farmTeamTasks", JSON.stringify(updated))
    toast.success("Task deleted")
  }

  const getMemberName = (memberId: string) => members.find((m) => m.id === memberId)?.name || "Unknown"
  const getTasksByStatus = (status: string) => tasks.filter((t) => t.status === status).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
  const getTaskIcon = (taskType: string) => TASK_TYPES.find((t) => t.value === taskType)?.icon || "📋"

  return (
    <div className="min-h-screen bg-[#f0efe9] pb-24">
      <Header title="Farm Team" />

      <main className="container px-4 py-6 space-y-6 max-w-4xl mx-auto">
        {/* Stats Section with Glassmorphism */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Team", value: members.length, color: "text-gray-900" },
            { label: "Active Tasks", value: getTasksByStatus("in-progress").length, color: "text-[#c0ff01]" },
            { label: "Completed", value: getTasksByStatus("completed").length, color: "text-green-600" },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm bg-white/60 backdrop-blur-md">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <span className={`text-2xl font-serif font-bold ${stat.color}`}>{stat.value}</span>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">{stat.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-200/50 p-1 rounded-2xl">
            <TabsTrigger value="tasks" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#0a1f16] data-[state=active]:shadow-sm font-medium">Task Board</TabsTrigger>
            <TabsTrigger value="team" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#0a1f16] data-[state=active]:shadow-sm font-medium">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            {/* AI Voice Prompt */}
            <div className="rounded-2xl bg-gradient-to-r from-[#0a1f16] to-[#14532d] p-5 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c0ff01]/10 rounded-full blur-2xl -mr-10 -mt-10" />
              <div className="relative z-10 flex gap-4 items-start">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 backdrop-blur-md">
                  <Volume2 className="h-5 w-5 text-[#c0ff01]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight mb-1">Use Voice Commands</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Just tell AgriTwin: <span className="text-[#c0ff01] italic">"Assign John to water tomatoes tomorrow"</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <h2 className="text-xl font-serif font-bold text-gray-900">Task List</h2>
              <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-full bg-[#14532d] hover:bg-[#0a1f16] text-white">
                    <Plus className="h-4 w-4 mr-1" /> New Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-serif">Assign New Task</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Task Title</Label>
                      <Input placeholder="e.g., Water the tomato field" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
                    </div>
                    {/* Detailed form fields omitted for brevity but logic remains same */}
                    <div className="space-y-2">
                      <Label>Assign To</Label>
                      <Select value={newTask.assignedTo} onValueChange={(value) => setNewTask({ ...newTask, assignedTo: value })}>
                        <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                        <SelectContent>
                          {members.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Field / Area</Label>
                      {farmBlocks.length > 0 ? (
                        <Select
                          value={newTask.cropType}
                          onValueChange={(value) => {
                            const block = farmBlocks.find(b => b.name === value)
                            setNewTask({ ...newTask, cropType: value, description: block ? `${newTask.taskType} in ${block.name} (${block.crop})` : newTask.description })
                          }}
                        >
                          <SelectTrigger><SelectValue placeholder="Select Field/Block" /></SelectTrigger>
                          <SelectContent>
                            {farmBlocks.map(b => (
                              <SelectItem key={b.id} value={b.name}>
                                {b.name} ({b.crop || 'Unknown'})
                              </SelectItem>
                            ))}
                            <SelectItem value="General Farm">General Farm</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input placeholder="e.g. Maize Field" value={newTask.cropType} onChange={(e) => setNewTask({ ...newTask, cropType: e.target.value })} />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Task Type</Label>
                      <Select value={newTask.taskType} onValueChange={(value) => setNewTask({ ...newTask, taskType: value })}>
                        <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                        <SelectContent>
                          {TASK_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Input type="date" value={newTask.dueDate.toISOString().split("T")[0]} onChange={(e) => setNewTask({ ...newTask, dueDate: new Date(e.target.value) })} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={addTask} className="bg-[#14532d] text-white">Assign Task</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {["in-progress", "pending", "completed"].map((status) => {
                const statusTasks = getTasksByStatus(status);
                const title = status === "in-progress" ? "In Progress" : status === "pending" ? "To Do" : "Completed";

                if (statusTasks.length === 0 && status !== 'completed') return null;

                return (
                  <div key={status} className="space-y-2">
                    {statusTasks.length > 0 && <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mt-4">{title}</h3>}
                    <AnimatePresence>
                      {statusTasks.map((task) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`rounded-2xl p-4 border transition-all ${status === 'completed'
                            ? 'bg-gray-50 border-gray-100 opacity-60'
                            : 'bg-white border-gray-100 shadow-sm hover:shadow-md'
                            }`}
                        >
                          <div className="flex gap-4 items-start">
                            <div className="text-2xl bg-gray-50 rounded-xl p-2 h-12 w-12 flex items-center justify-center shrink-0">
                              {getTaskIcon(task.taskType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-bold text-gray-900 truncate ${status === 'completed' ? 'line-through' : ''}`}>{task.title}</h4>
                              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                                <span className="flex items-center gap-1">👤 {getMemberName(task.assignedTo)}</span>
                                <span className="flex items-center gap-1">📅 {task.dueDate.toLocaleDateString()}</span>
                              </div>
                              <div className="flex gap-2 mt-3">
                                {status === 'pending' && (
                                  <Button size="sm" variant="outline" className="h-7 text-xs border-green-200 text-green-700 hover:bg-green-50" onClick={() => updateTaskStatus(task.id, "in-progress")}>
                                    Start
                                  </Button>
                                )}
                                {status === 'in-progress' && (
                                  <Button size="sm" className="h-7 text-xs bg-[#14532d] hover:bg-[#0a1f16] text-white" onClick={() => updateTaskStatus(task.id, "completed")}>
                                    Complete
                                  </Button>
                                )}
                                <Button size="icon" variant="ghost" className="h-7 w-7 ml-auto text-gray-300 hover:text-red-500" onClick={() => deleteTask(task.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif font-bold text-gray-900">Your Team</h2>
              <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-full bg-[#14532d] hover:bg-[#0a1f16] text-white">
                    <UserPlus className="h-4 w-4 mr-1" /> Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add New Member</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input placeholder="Full Name" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input placeholder="+254..." value={newMember.phoneNumber} onChange={(e) => setNewMember({ ...newMember, phoneNumber: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select value={newMember.role} onValueChange={(v: any) => setNewMember({ ...newMember, role: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="worker">Worker</SelectItem>
                          <SelectItem value="family">Family</SelectItem>
                          <SelectItem value="owner">Co-Owner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={addMember} className="bg-[#14532d] text-white">Add</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {members.map((member) => (
                <Card key={member.id} className="border-none shadow-sm overflow-hidden">
                  <div className="flex items-center gap-4 p-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold
                         ${member.role === 'owner' ? 'bg-[#0a1f16] text-[#c0ff01]' : 'bg-gray-100 text-gray-500'}
                      `}>
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{member.name}</h4>
                      <p className="text-xs text-gray-500">{member.role.charAt(0).toUpperCase() + member.role.slice(1)} • {member.phoneNumber}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${member.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <BottomNav />
      </main>
    </div>
  )
}
