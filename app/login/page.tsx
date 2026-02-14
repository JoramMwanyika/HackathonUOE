"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid credentials", {
          description: "Please check your email and password.",
        });
      } else {
        toast.success("Welcome back!", {
          description: "Redirecting to your dashboard...",
        });
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1f16] relative overflow-hidden flex items-center justify-center p-4">
      {/* Ambient Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#c0ff01]/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#4ade80]/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-[#14532d]/20 rounded-full blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="bg-gradient-to-br from-[#c0ff01] to-[#4ade80] p-3 rounded-2xl shadow-lg shadow-[#c0ff01]/20 group-hover:scale-105 transition-transform duration-300">
              <Leaf className="h-8 w-8 text-[#0a1f16]" />
            </div>
            <span className="text-3xl font-serif font-bold text-white tracking-wide">AgriTwin</span>
          </Link>
          <p className="text-gray-400 mt-2 font-medium">Cultivate Intelligence. Grow Smarter.</p>
        </div>

        {/* Login Card */}
        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-2xl font-serif font-bold text-center text-white">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Enter your credentials to access your twin
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="farmer@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-[#c0ff01] focus:ring-[#c0ff01]/20 h-12"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <Link href="#" className="text-xs text-[#c0ff01] hover:text-[#b0ef00] font-medium transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-[#c0ff01] focus:ring-[#c0ff01]/20 h-12"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#c0ff01] hover:bg-[#b0ef00] text-[#0a1f16] font-bold h-12 shadow-lg shadow-[#c0ff01]/20 transition-all hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#0a1f16]/0 px-2 text-gray-500 backdrop-blur-sm">Demo Access</span>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm backdrop-blur-sm"
              >
                <p className="text-gray-300 mb-2 flex justify-between">
                  <span className="font-medium text-gray-500">Email:</span>
                  <span className="font-mono text-white select-all">demo@agrivoice.com</span>
                </p>
                <p className="text-gray-300 flex justify-between">
                  <span className="font-medium text-gray-500">Password:</span>
                  <span className="font-mono text-white select-all">password123</span>
                </p>
              </motion.div>
            </form>

            <div className="mt-8 text-center text-sm">
              <span className="text-gray-400">Don't have an account? </span>
              <Link href="/register" className="text-[#c0ff01] hover:text-[#b0ef00] font-bold transition-colors">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-[#c0ff01] transition-colors flex items-center justify-center gap-2">
            Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
