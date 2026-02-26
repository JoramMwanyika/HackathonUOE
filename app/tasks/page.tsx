"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { CloudRain, CheckCircle, Circle, Plus, AlertTriangle, UploadCloud, MapPin, Search } from "lucide-react";
import { useChat } from "@/components/chat-provider";
import Image from "next/image";

export default function TasksPage() {
    const { toggleChat } = useChat();
    const [tasks, setTasks] = useState([
        { id: 1, title: "Fertilize Tomatoes", block: "Block B", time: "Pending", completed: false },
        { id: 2, title: "Water Maize", block: "Block A", time: "Pending", completed: false },
        { id: 3, title: "Check Bean Fungal Spots", block: "Block C", time: "Pending", completed: false },
    ]);

    const toggleTask = (id: number) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24">
            <Header />

            <main className="container mx-auto px-4 max-w-7xl py-6 space-y-6">

                {/* Top Overview Section (reused from Dashboard) */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-800">Your Tasks & Scans</h2>
                        <div className="bg-white rounded-full border border-slate-200 px-4 py-1.5 flex items-center gap-3 text-sm text-slate-700 font-medium shadow-sm">
                            <CloudRain className="h-4 w-4 text-blue-400" />
                            Nairobi | 24°C | Rain 40%
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Health Status */}
                        <div className="bg-white rounded-xl border border-green-200/50 p-4 flex items-center gap-4 shadow-sm">
                            <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                                <CheckCircle className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <span className="text-slate-600 font-medium">Farm Health: </span>
                                <span className="text-green-600 font-bold text-xl">78% </span>
                                <span className="text-green-600 font-medium">Good</span>
                            </div>
                        </div>

                        {/* Alerts */}
                        <div className="bg-red-50/50 rounded-xl border border-red-100 p-4 flex items-center gap-4 shadow-sm">
                            <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                                <AlertTriangle className="h-5 w-5 text-white" />
                            </div>
                            <div className="font-medium text-red-900">
                                <span className="text-red-600 font-bold">Alert:</span> Block B - Low Moisture
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Left Column: Tasks */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-[20px] p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                <h3 className="font-bold text-slate-800 text-lg">Daily / Upcoming Tasks</h3>
                            </div>

                            <ul className="space-y-3 mb-6">
                                {tasks.map(task => (
                                    <li key={task.id} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 cursor-pointer" onClick={() => toggleTask(task.id)}>
                                        <div className="mt-0.5 shrink-0">
                                            {task.completed ? (
                                                <CheckCircle className="h-6 w-6 text-green-500" />
                                            ) : (
                                                <Circle className="h-6 w-6 text-slate-300" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`font-bold text-base ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{task.title}</h4>
                                            <div className="flex items-center gap-3 mt-1 text-sm font-medium text-slate-500">
                                                <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-600"><MapPin className="h-3 w-3" /> {task.block}</span>
                                                <span>{task.time}</span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex gap-3">
                                <button className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
                                    <Plus className="h-4 w-4" />
                                    New Task
                                </button>
                            </div>
                        </div>

                        {/* Commodity Prices (Mock Chart Area) */}
                        <div className="bg-white rounded-[20px] p-6 border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 text-lg mb-4">Commodity Prices - 6 Months</h3>
                            <div className="h-48 w-full bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center relative overflow-hidden">
                                {/* Placeholder for actual chart */}
                                <svg className="absolute inset-0 h-full w-full text-green-100" preserveAspectRatio="none" viewBox="0 0 100 100" fill="none">
                                    <path d="M0,100 C20,90 40,40 60,60 C80,80 100,20 100,20 L100,100 L0,100 Z" fill="currentColor" fillOpacity="0.5" />
                                    <path d="M0,100 C20,90 40,40 60,60 C80,80 100,20 100,20" stroke="#22c55e" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                                </svg>
                                <span className="text-slate-400 font-medium z-10 bg-white/50 backdrop-blur-sm px-3 py-1 rounded">Chart Area</span>
                            </div>
                            <div className="flex justify-between items-center mt-4 text-sm font-bold text-slate-600">
                                <div className="flex items-center gap-2"><span className="h-3 w-3 bg-green-500 rounded-full" /> Maize KES 3,900</div>
                                <div className="flex items-center gap-2"><span className="h-3 w-3 bg-blue-500 rounded-full" /> Beans KES 7,200</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Scans */}
                    <div className="space-y-6">

                        {/* Scan Upload */}
                        <div className="bg-white rounded-[20px] p-6 border border-slate-200 shadow-sm text-center">
                            <h3 className="font-bold text-slate-800 text-lg mb-4 text-left">Upload Crop Photo</h3>
                            <div className="border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer group">
                                <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <UploadCloud className="h-8 w-8" />
                                </div>
                                <p className="font-bold text-slate-700 text-lg mb-1">Drag and drop or Browse</p>
                                <p className="text-slate-500 text-sm font-medium">To scan for diseases or pests</p>
                            </div>
                        </div>

                        {/* Recent Scans */}
                        <div className="bg-white rounded-[20px] p-6 border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-800 text-lg">Recent Scans</h3>
                                <Search className="h-5 w-5 text-slate-400" />
                            </div>

                            <div className="space-y-4">
                                {/* Scan Item 1 */}
                                <div className="flex gap-4 p-3 border border-slate-100 rounded-xl hover:shadow-md transition-shadow bg-slate-50">
                                    <div className="h-20 w-24 bg-slate-200 rounded-lg overflow-hidden relative shrink-0">
                                        <Image src="/community-farm.jpeg" alt="Scan" layout="fill" objectFit="cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h4 className="font-bold text-slate-800">Beans</h4>
                                        <p className="text-red-500 font-bold text-sm mb-1">Fungal Risk (72%)</p>
                                        <p className="text-slate-500 text-xs font-medium">Today • Block C</p>
                                    </div>
                                </div>
                                {/* Scan Item 2 */}
                                <div className="flex gap-4 p-3 border border-slate-100 rounded-xl hover:shadow-md transition-shadow bg-slate-50">
                                    <div className="h-20 w-24 bg-slate-200 rounded-lg overflow-hidden relative shrink-0">
                                        <Image src="/community-farm.jpeg" alt="Scan" layout="fill" objectFit="cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h4 className="font-bold text-slate-800">Tomatoes</h4>
                                        <p className="text-green-500 font-bold text-sm mb-1">Healthy</p>
                                        <p className="text-slate-500 text-xs font-medium">Yesterday • Block A</p>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full mt-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors text-sm">
                                View All Scan History
                            </button>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
