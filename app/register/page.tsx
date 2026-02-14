"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match", {
        description: "Please make sure your passwords match.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Registration failed");
      }

      const data = await response.json();

      toast.success("Account created!", {
        description: "Welcome to AgriTwin. Please set up your farm.",
      });

      // We should ideally sign them in automatically here, but for now redirect to login
      // Or if using NextAuth credentials, we might need them to login first.
      // Let's redirect to login for simplicity as auto-login requires more NextAuth setup.
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 1000);
    } catch (error: any) {
      toast.error("Registration failed", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1f16] relative overflow-hidden flex items-center justify-center p-4">
      {/* Ambient Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#c0ff01]/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#4ade80]/10 rounded-full blur-[130px] mix-blend-screen animate-pulse" style={{ animationDuration: '7s' }} />
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
          <p className="text-gray-400 mt-2 font-medium">Start your digital farming journey</p>
        </div>

        {/* Register Card */}
        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-2xl font-serif font-bold text-center text-white">
              Create Account
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Join thousands of farmers using AI-powered insights
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-[#c0ff01] focus:ring-[#c0ff01]/20 h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="farmer@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-[#c0ff01] focus:ring-[#c0ff01]/20 h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-[#c0ff01] focus:ring-[#c0ff01]/20 h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={8}
                  className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-[#c0ff01] focus:ring-[#c0ff01]/20 h-11"
                />
              </div>

              <div className="flex items-start gap-3 text-sm py-2">
                <input
                  type="checkbox"
                  required
                  className="mt-1 rounded border-gray-600 bg-black/40 text-[#c0ff01] focus:ring-[#c0ff01] focus:ring-offset-0"
                />
                <span className="text-gray-400">
                  I agree to the{" "}
                  <Link href="#" className="text-[#c0ff01] hover:text-[#b0ef00] font-medium transition-colors">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-[#c0ff01] hover:text-[#b0ef00] font-medium transition-colors">
                    Privacy Policy
                  </Link>
                </span>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#c0ff01] hover:bg-[#b0ef00] text-[#0a1f16] font-bold h-12 shadow-lg shadow-[#c0ff01]/20 transition-all hover:scale-[1.02] mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#0a1f16]/0 px-2 text-gray-500 backdrop-blur-sm">Already a member?</span>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm text-center">
                <p className="text-blue-200">
                  Want to try first? Use the{" "}
                  <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold underline decoration-dotted underline-offset-4">
                    demo account
                  </Link>
                </p>
              </div>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-400">Already have an account? </span>
              <Link href="/login" className="text-[#c0ff01] hover:text-[#b0ef00] font-bold transition-colors">
                Sign in
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
