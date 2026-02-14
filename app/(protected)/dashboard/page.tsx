"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CloudRain,
  Droplets,
  AlertTriangle,
  ArrowRight,
  Sprout,
  Wind,
  Sun,
  Thermometer,
  Clock,
  MapPin,
  Loader2,
  MessageSquare,
  Calendar as CalendarIcon,
  Users,
  Mic,
  Activity,
  TrendingUp,
  CheckCircle,
  Leaf,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  clouds: {
    all: number;
  };
  name: string;
  coord: {
    lat: number;
    lon: number;
  };
}

export default function Dashboard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationName, setLocationName] = useState("Nairobi"); // Default
  const [teamTasks, setTeamTasks] = useState<any[]>([]);
  const [calendarActivities, setCalendarActivities] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [farmBlocks, setFarmBlocks] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState({ activeBlocks: 0, pendingTasks: 0, health: "--", area: 0 });
  const [userName, setUserName] = useState("Farmer");

  // Get user's location and fetch weather
  useEffect(() => {
    const getLocationAndWeather = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              setLocation({ lat: latitude, lon: longitude });
              await fetchWeather(latitude, longitude);
            },
            async (error) => {
              console.log("Location permission denied, using default location");
              await fetchWeather();
            }
          );
        } else {
          await fetchWeather();
        }
      } catch (error) {
        console.error("Error getting location:", error);
        await fetchWeather();
      }
    };

    getLocationAndWeather();

    // Initial fetch
    fetchDashboardData();

    // Poll every 5 minutes (300000 ms)
    const intervalId = setInterval(fetchDashboardData, 300000);

    return () => clearInterval(intervalId);
  }, []);

  const loadTeamData = () => {
    const tasksData = localStorage.getItem("farmTeamTasks");
    // ... existing code ...
  };

  // Clean up loadTeamData indentation if needed, but the main change is the fetch logic below

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const data = await res.json();
        setFarmBlocks(data.blocks);
        setDashboardStats(data.stats);
        if (data.userName) setUserName(data.userName);
        // data.calendar can be set here too if added later
      }
    } catch (e) {
      console.error("Failed to load dashboard", e);
    }
  };

  const fetchWeather = async (lat?: number, lon?: number) => {
    setIsLoadingWeather(true);
    try {
      let url = '/api/weather';
      if (lat && lon) {
        url += `?lat=${lat}&lon=${lon}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setWeather(data);
      setLocationName(data.name);
    } catch (error) {
      console.error("Error fetching weather:", error);
      toast.error("Failed to load weather data");
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const handleLocationChange = async (city: string) => {
    setLocationName(city);
    setIsLoadingWeather(true);
    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      const data = await response.json();
      setWeather(data);
      setLocation({ lat: data.coord.lat, lon: data.coord.lon });
      toast.success(`Weather updated for ${city}`);
    } catch (error) {
      console.error("Error fetching weather:", error);
      toast.error("Failed to update weather");
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const getWeatherIcon = (iconCode: string) => {
    const hour = new Date().getHours();
    const isDaytime = hour >= 6 && hour < 18;

    if (iconCode.includes('01')) return isDaytime ? <Sun className="h-14 w-14 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-pulse" /> : <Sun className="h-14 w-14 text-gray-300 opacity-60" />;
    if (iconCode.includes('02') || iconCode.includes('03')) return <CloudRain className="h-14 w-14 text-gray-400" />;
    if (iconCode.includes('04')) return <CloudRain className="h-14 w-14 text-gray-500" />;
    if (iconCode.includes('09') || iconCode.includes('10')) return <CloudRain className="h-14 w-14 text-blue-400 animate-bounce delay-1000" />;
    return <CloudRain className="h-14 w-14 text-blue-400" />;
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'warning': return 'bg-amber-500/10 text-amber-600 border-amber-200';
      case 'critical': return 'bg-rose-500/10 text-rose-600 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#f0efe9] pb-24 font-sans text-[#0a1f16]">
      <Header />

      <main className="container px-4 py-8 max-w-7xl mx-auto space-y-10">

        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('en-KE', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-[#0a1f16]">
              Jambo, <span className="text-[#2d5a47]">{userName}</span>
            </h1>
            <p className="text-gray-600 mt-2 max-w-xl">
              Your <span className="font-bold text-[#2d5a47]">AgriTwin</span> is synced. Monitor your farm's vital signs below.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Link href="/advisor">
              <Button className="h-12 px-6 rounded-full bg-[#1a3c2f] hover:bg-black text-white hover:scale-105 transition-all shadow-lg flex items-center gap-2">
                <div className="p-1 rounded-full bg-[#c0ff01] text-black">
                  <Mic className="w-3.5 h-3.5" />
                </div>
                Ask AI Assistant
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Dashboard Grid */}
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-12"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Left Column (Weather & Stats) - Span 8 */}
          <div className="lg:col-span-8 space-y-6">

            {/* Weather Card */}
            <motion.div variants={itemVariants}>
              <Card className="rounded-3xl border-none shadow-xl bg-gradient-to-br from-[#1a3c2f] to-[#0f231b] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <CardContent className="p-8 relative z-10">
                  {isLoadingWeather ? (
                    <div className="h-40 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-[#c0ff01]" />
                    </div>
                  ) : weather ? (
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                      <div className="space-y-4 text-center md:text-left">
                        <div className="flex items-center gap-2 text-emerald-100/60 justify-center md:justify-start">
                          <MapPin className="w-4 h-4" />
                          <Dialog>
                            <DialogTrigger className="hover:text-white transition-colors underline decoration-dotted underline-offset-4">
                              {locationName}
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Change Location</DialogTitle>
                                <DialogDescription>Select a city to view weather.</DialogDescription>
                              </DialogHeader>
                              <Select onValueChange={handleLocationChange} defaultValue={locationName}>
                                <SelectTrigger><SelectValue placeholder="City" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Nairobi">Nairobi</SelectItem>
                                  <SelectItem value="Mombasa">Mombasa</SelectItem>
                                  <SelectItem value="Kisumu">Kisumu</SelectItem>
                                </SelectContent>
                              </Select>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <div className="space-y-1">
                          <h2 className="text-7xl font-serif font-thin tracking-tighter">
                            {Math.round(weather.main.temp)}°
                          </h2>
                          <p className="text-xl text-emerald-100 capitalize font-light">
                            {weather.weather[0].description}
                          </p>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-emerald-100/70 pt-2">
                          <div className="flex items-center gap-1.5">
                            <Droplets className="w-4 h-4 text-[#c0ff01]" />
                            <span>{weather.main.humidity}% Humidity</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Wind className="w-4 h-4 text-[#c0ff01]" />
                            <span>{Math.round(weather.wind.speed)} m/s Wind</span>
                          </div>
                        </div>
                      </div>
                      <div className="transform scale-125">
                        {getWeatherIcon(weather.weather[0].icon)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 opacity-50">Weather Unavailable</div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Active Blocks", value: dashboardStats.activeBlocks.toString(), icon: Sprout, color: "text-emerald-600", bg: "bg-emerald-100" },
                { label: "Tasks Pending", value: dashboardStats.pendingTasks.toString(), icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
                { label: "Alerts", value: "1", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-100" }, // Alerts logic to be added
                { label: "Health", value: dashboardStats.health, icon: Activity, color: "text-rose-600", bg: "bg-rose-100" }
              ].map((stat, i) => (
                <motion.div variants={itemVariants} key={i}>
                  <Card className="border-none shadow-sm hover:shadow-md transition-all h-full bg-white/60 backdrop-blur-sm">
                    <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
                      <div className={`p-3 rounded-full ${stat.bg} ${stat.color} mb-1`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-[#0a1f16]">{stat.value}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">{stat.label}</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Alerts Section */}
            <motion.div variants={itemVariants}>
              <Card className="border-l-4 border-amber-400 bg-amber-50/50 shadow-sm">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-600 mt-1">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#5B3B00] text-lg">Irrigation Advisory</h3>
                    <p className="text-[#8A5B00] mt-1 text-sm leading-relaxed">
                      Soil moisture levels in <strong>Block B (Beans)</strong> have dropped below 40%. Recommend scheduling irrigation for tomorrow morning.
                    </p>
                    <Button size="sm" variant="link" className="px-0 text-amber-700 mt-2 h-auto font-semibold">
                      View Recommendation <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </div>

          {/* Right Column (Farm Status & Activity) - Span 4 */}
          <div className="lg:col-span-4 space-y-6">

            {/* Farm Blocks */}
            <motion.div variants={itemVariants}>
              <Card className="border-none shadow-lg bg-white/80 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="font-serif text-xl">Farm Status</CardTitle>
                  <Link href="/farm"><Button variant="ghost" size="sm" className="h-8">View All</Button></Link>
                </CardHeader>
                <CardContent className="space-y-4">
                  {farmBlocks.map((block: any) => (
                    <div key={block.id} className="group p-3 rounded-xl hover:bg-white border border-transparent hover:border-gray-100 transition-all hover:shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#c0ff01] group-hover:text-black transition-colors">
                            <Leaf className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{block.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={`text-[10px] py-0 h-5 ${getHealthStatusColor(block.healthStatus)}`}>
                                {block.healthStatus}
                              </Badge>
                              {(block.moisture !== undefined) && (
                                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                  <Droplets className="w-3 h-3" /> {block.moisture}%
                                </span>
                              )}
                              {(block.temp !== undefined) && (
                                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                  <Thermometer className="w-3 h-3" /> {block.temp}°
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm font-bold">{block.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#0a1f16] to-[#2d5a47] rounded-full"
                          style={{ width: `${block.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Upcoming Activity */}
            <motion.div variants={itemVariants}>
              <Card className="border-none shadow-lg bg-white/80 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="font-serif text-xl">Upcoming</CardTitle>
                  <Link href="/calendar"><Button variant="ghost" size="sm" className="h-8"><CalendarIcon className="w-4 h-4" /></Button></Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0 relative">
                    <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-100"></div>
                    {calendarActivities.length > 0 ? calendarActivities.map((activity: any, i: number) => (
                      <div key={i} className="relative pl-8 py-3 first:pt-0 last:pb-0">
                        <div className="absolute left-[5px] top-4 w-4 h-4 rounded-full border-4 border-white bg-purple-500 shadow-sm z-10"></div>
                        <div className="text-sm font-semibold">{activity.activityType}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{activity.cropType} • {new Date(activity.date).toLocaleDateString()}</div>
                      </div>
                    )) : (
                      <div className="text-center py-6 text-gray-400 text-sm">No scheduled activities</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </div>

        </motion.div>
      </main>
      <BottomNav />
    </div>
  );
}
