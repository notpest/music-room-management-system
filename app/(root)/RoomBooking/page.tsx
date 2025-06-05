"use client";

import React from "react";
import RBTable from "../../../components/ui/RBTable";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// Import Navbar dynamically with no SSR
const Navbar = dynamic(() => import("@/components/Navbar"), {
  ssr: false,
  loading: () => (
    <div className="h-[64px] w-full bg-background/60 backdrop-blur-lg" />
  ),
});

const RoomBookingPage = () => {
  return (
    <motion.div 
      className="bg-black-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
    <Navbar aria-label="Main Navigation" />
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden mx-auto sm:px-10 max-h-screen">
      <div className="w-full">
        <RBTable />
      </div>
    </main>
    </motion.div>
  );
};

export default RoomBookingPage;
