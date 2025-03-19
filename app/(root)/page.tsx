"use client";
import dynamic from 'next/dynamic';
import Hero from "@/components/Hero";
import Mission from "@/components/Mission";
import Branches from "@/components/Branches";
import Events from "@/components/ui/events";
import { motion } from "framer-motion";

// Import Navbar dynamically with no SSR
const Navbar = dynamic(() => import("@/components/Navbar"), {
  ssr: false,
  loading: () => (
    <div className="h-[64px] w-full bg-background/60 backdrop-blur-lg" />
  ),
});

export default function Home() {
  return (
    <motion.div 
      className="bg-black-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar />
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden mx-auto sm:px-10">
      <div className="w-full">
        <Hero />
        <Mission />
        <Branches />
        <Events />
      </div>
    </main>
    </motion.div>
  );
}
