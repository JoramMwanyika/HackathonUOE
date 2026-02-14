"use client";

import { useScroll, useTransform, motion, useSpring, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Leaf, ArrowRight, Cloud, MessageSquare, Shield, Globe, Users, Menu, X, Mail, Phone, MapPin, Linkedin, Twitter, Instagram } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

// --- Utility Components ---

function FadeIn({ children, delay = 0, className, direction = "up" }: { children: React.ReactNode, delay?: number, className?: string, direction?: "up" | "down" | "left" | "right" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
      x: direction === "left" ? 40 : direction === "right" ? -40 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration: 0.7, delay: delay },
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// --- Sections ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="absolute top-0 inset-x-0 z-50 py-6 px-6 md:px-12 flex items-center justify-between">
      <div className="flex items-center gap-2 text-white">
        <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm border border-white/20">
          <Leaf className="w-5 h-5 text-[#22c55e] fill-current" />
        </div>
        <span className="font-serif text-xl font-bold tracking-tight">AgriTwin</span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-slate-300 text-sm font-medium">
        <Link href="#solutions" className="hover:text-white transition-colors">Solutions</Link>
        <Link href="#about" className="hover:text-white transition-colors">About</Link>
        <Link href="#vision" className="hover:text-white transition-colors">Vision</Link>
        <Link href="#team" className="hover:text-white transition-colors">Team</Link>
        <Link href="#contact" className="hover:text-white transition-colors">Contact</Link>
      </div>

      <div className="hidden md:flex items-center gap-4">
        <Link href="/login">
          <Button variant="ghost" className="text-white hover:text-[#22c55e] hover:bg-white/5 rounded-full px-6">
            Sign In
          </Button>
        </Link>
        <Link href="/register">
          <Button className="rounded-full bg-[#22c55e] text-white hover:bg-[#16a34a] font-bold px-6 shadow-lg border-0">
            Get Started
          </Button>
        </Link>
      </div>

      <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#0f172a] border-t border-white/10 p-6 flex flex-col gap-4 md:hidden shadow-2xl">
          <Link href="#solutions" className="text-slate-300">Solutions</Link>
          <Link href="#about" className="text-slate-300">About</Link>
          <Link href="/login" className="text-[#22c55e]">Sign In</Link>
          <Link href="/register" className="text-white font-bold">Get Started</Link>
        </div>
      )}
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 bg-[#0f172a] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0f172a]">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#1e293b] rounded-full blur-[120px] opacity-60 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#22c55e] rounded-full blur-[150px] opacity-10 translate-y-1/3 -translate-x-1/3"></div>
      </div>

      <div className="container mx-auto relative z-10 text-center max-w-4xl">
        <FadeIn>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight text-white mb-8 leading-[1.1]">
            Transforming Agriculture with <span className="text-[#22c55e]">Digital Twin Tech</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect deeply with your farm's ecosystem. Monitor crops, predict yields, and optimize resources with your AI assistant.
          </p>
          <Link href="/register">
            <Button className="h-14 px-10 rounded-full bg-[#22c55e] text-white text-lg font-bold hover:bg-[#16a34a] hover:scale-105 transition-all shadow-xl shadow-green-900/20">
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </FadeIn>
      </div>
    </section>
  );
};

const Solutions = () => {
  const solutions = [
    {
      icon: Globe,
      title: "Digital Twin",
      desc: "Create a virtual replica of your farm to simulate changes and optimize irrigation."
    },
    {
      icon: Shield,
      title: "AI Monitoring",
      desc: "Instant disease detection and health analysis using advanced computer vision."
    },
    {
      icon: Cloud,
      title: "Weather Analytics",
      desc: "Hyper-local forecasts and climate risk warnings to protect your harvest."
    }
  ];

  return (
    <section id="solutions" className="bg-[#1e293b] py-20 px-6">
      <div className="container mx-auto">
        <FadeIn>
          <h2 className="text-center font-serif text-3xl md:text-4xl text-white mb-16">Our Solutions</h2>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8">
          {solutions.map((s, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="bg-[#0f172a] border border-slate-700/50 p-8 rounded-2xl hover:border-[#22c55e]/50 transition-colors text-center group h-full shadow-lg">
                <div className="w-14 h-14 mx-auto bg-[#1e293b] rounded-full flex items-center justify-center mb-6 text-[#22c55e] group-hover:bg-[#22c55e] group-hover:text-white transition-all">
                  <s.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {s.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

const About = () => {
  return (
    <section id="about" className="bg-[#0f172a] py-24 px-6 overflow-hidden">
      <div className="container mx-auto">
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-8">About AgriTwin</h2>
            <div className="bg-[#1e293b]/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-sm">
              <h3 className="text-[#22c55e] font-bold mb-4 uppercase tracking-widest text-xs">Our Story</h3>
              <p className="text-slate-300 leading-relaxed">
                "AgriTwin started with a single purpose: How can we make precision agriculture accessible to every farmer? We believe that technology should not be a barrier but a bridge. By combining digital twin technology with accessible AI, we empower farmers to make data-driven decisions that increase yield and sustainability."
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Roadmap Visualization */}
        <FadeIn delay={0.2}>
          <div className="relative bg-[#1e293b] rounded-3xl p-8 md:p-12 border border-slate-700/50">
            <div className="text-center mb-12">
              <h3 className="font-serif text-3xl text-white bg-[#22c55e] inline-block px-4 py-1 rounded-lg font-bold uppercase tracking-tighter">Our Strategic Roadmap</h3>
            </div>

            <div className="relative flex flex-col md:flex-row justify-between items-start gap-8 md:gap-4 mt-8">
              {/* Line */}
              <div className="absolute top-[2.5rem] left-0 right-0 h-1 bg-slate-700 hidden md:block border-t border-dashed border-slate-600"></div>

              {[
                { title: "Q1 - Pilot", desc: "Testing voice models with 100 farmers in Central Kenya." },
                { title: "Q2 - IoT Expansion", desc: "Rollout of affordable sensor kits and twin visualization." },
                { title: "Q3 - Partnership", desc: "Integrating with Co-ops and local Gov agencies for scale." },
                { title: "Q4 - Regional", desc: "Scaling to East Africa and adding more local languages." }
              ].map((step, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center text-center max-w-[200px] mx-auto">
                  <div className="w-20 h-20 rounded-full bg-[#22c55e] text-white font-bold flex items-center justify-center text-xl mb-6 border-8 border-[#0f172a] shadow-xl z-20">
                    {i + 1}
                  </div>
                  <div className="bg-[#0f172a] p-6 rounded-xl border border-slate-700 h-full w-full hover:border-[#22c55e] transition-colors">
                    <h4 className="text-white font-bold text-sm uppercase mb-3 text-[#22c55e]">{step.title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

const MissionVisionValues = () => {
  return (
    <section id="vision" className="bg-[#1e293b] py-24 px-6 border-y border-slate-800">
      <div className="container mx-auto">
        <FadeIn>
          <h2 className="text-center font-serif text-3xl md:text-4xl text-white mb-16">Our Mission, Vision and Values</h2>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-12 divide-y md:divide-y-0 md:divide-x divide-slate-700 text-slate-300">
          <FadeIn delay={0.1} className="px-6">
            <h3 className="font-bold text-lg mb-4 text-[#22c55e]">Mission</h3>
            <p className="leading-relaxed">
              To democratize precision agriculture by providing accessible, AI-driven tools that double the productivity of smallholder farmers.
            </p>
          </FadeIn>
          <FadeIn delay={0.2} className="px-6 pt-12 md:pt-0">
            <h3 className="font-bold text-lg mb-4 text-[#22c55e]">Vision</h3>
            <p className="leading-relaxed">
              A world where every farmer, regardless of scale, has a digital companion ensuring food security and sustainable practices.
            </p>
          </FadeIn>
          <FadeIn delay={0.3} className="px-6 pt-12 md:pt-0">
            <h3 className="font-bold text-lg mb-4 text-[#22c55e]">Values</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" /> Sustainability First</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" /> Accessibility</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" /> Community Driven</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" /> Innovation</li>
            </ul>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

const Team = () => {
  const team = [
    { name: "Joram Mwanyika", role: "Team Lead", color: "bg-blue-600" },
    { name: "Lewis Machabe", role: "Frontend Developer", color: "bg-indigo-600" },
    { name: "Victor Kalanza", role: "Backend Developer", color: "bg-violet-600" },
  ];

  return (
    <section id="team" className="bg-[#0f172a] py-24 px-6">
      <div className="container mx-auto">
        <FadeIn>
          <h2 className="text-center font-serif text-3xl md:text-4xl text-white mb-16">Our Team</h2>
        </FadeIn>

        <div className="flex flex-wrap justify-center gap-12">
          {team.map((member, i) => (
            <FadeIn key={i} delay={i * 0.1} className="text-center group">
              <div className={cn("w-32 h-32 mx-auto rounded-full mb-6 border-4 border-slate-700 group-hover:border-[#22c55e] transition-colors flex items-center justify-center text-3xl font-bold text-white shadow-2xl", member.color)}>
                {member.name.charAt(0)}
              </div>
              <h3 className="text-white font-bold text-xl mb-1">{member.name}</h3>
              <p className="text-[#22c55e] text-sm uppercase tracking-wider font-medium">{member.role}</p>
              <div className="flex justify-center gap-4 mt-4 opacity-40 group-hover:opacity-100 transition-opacity">
                <Linkedin className="w-5 h-5 text-white hover:text-[#22c55e] cursor-pointer" />
                <Twitter className="w-5 h-5 text-white hover:text-[#22c55e] cursor-pointer" />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer id="contact" className="bg-[#1e293b] pt-24 pb-12 px-6 border-t border-slate-800">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20 text-center md:text-left">
          <div className="lg:col-span-4 text-center mb-12">
            <h2 className="font-serif text-4xl text-white mb-4">Join Us</h2>
            <p className="text-slate-400">Be part of the agricultural revolution.</p>
          </div>

          <div className="bg-[#0f172a] p-8 rounded-2xl border border-slate-700 hover:border-[#22c55e] transition-colors">
            <h3 className="text-white font-bold mb-4">Invest in Innovation</h3>
            <p className="text-slate-400 text-sm mb-6">Partner with us to scale sustainable farming solutions across Africa.</p>
            <Button variant="outline" className="bg-transparent text-white border-white/20 hover:bg-white hover:text-[#0f172a] w-full">Learn More</Button>
          </div>

          <div className="bg-[#0f172a] p-8 rounded-2xl border border-slate-700 hover:border-[#22c55e] transition-colors">
            <h3 className="text-white font-bold mb-4">Partner for Progress</h3>
            <p className="text-slate-400 text-sm mb-6">NGOs and Governments: Let's collaborate for food security.</p>
            <Button variant="outline" className="bg-transparent text-white border-white/20 hover:bg-white hover:text-[#0f172a] w-full">Partner With Us</Button>
          </div>

          <div className="bg-[#0f172a] p-8 rounded-2xl border border-slate-700 lg:col-span-2">
            <h3 className="text-white font-bold mb-4">Contact Us</h3>
            <div className="space-y-4 text-slate-300 text-sm">
              <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-[#22c55e]" /> jorammwanyika@gmail.com</div>
              <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-[#22c55e]" /> +254 794 728 645</div>
              <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-[#22c55e]" /> Nairobi, Kenya</div>
              <div className="flex items-center gap-4 mt-6">
                <Twitter className="w-5 h-5 hover:text-[#22c55e] cursor-pointer" />
                <Linkedin className="w-5 h-5 hover:text-[#22c55e] cursor-pointer" />
                <Instagram className="w-5 h-5 hover:text-[#22c55e] cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        {/* Champions/Partners Logos (Placeholder) */}
        <div className="mb-20 text-center">
          <h4 className="text-slate-500 uppercase tracking-widest text-xs font-bold mb-8">Champions of Our Mission</h4>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="h-10 w-24 bg-white/20 rounded"></div>
            <div className="h-10 w-24 bg-white/20 rounded"></div>
            <div className="h-10 w-24 bg-white/20 rounded"></div>
            <div className="h-10 w-24 bg-white/20 rounded"></div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-[#22c55e]" />
            <span>&copy; 2026 AgriTwin. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white">Privacy Policy</Link>
            <Link href="#" className="hover:text-white">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

// --- Main Page Component ---

export default function LandingPage() {
  return (
    <div className="font-sans antialiased text-slate-900 selection:bg-[#22c55e] selection:text-white bg-[#0f172a]">
      <Navbar />
      <Hero />
      <Solutions />
      <About />
      <MissionVisionValues />
      <Team />
      <Footer />
    </div>
  );
}
