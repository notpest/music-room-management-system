"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import SlotsRequestsTable from "../../../components/ui/SlotsRequestTable";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Import Navbar dynamically with no SSR
const Navbar = dynamic(() => import("@/components/Navbar"), {
  ssr: false,
  loading: () => (
    <div className="h-[64px] w-full bg-background/60 backdrop-blur-lg" />
  ),
});

const SlotRequestsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "loading") return;

    // 2) If not signed in or not admin, kick them back to home
    if (!session || session.user.role !== "admin") {
      router.replace("/");
    }
  }, [session, status, router]);
  
  if (status === "loading" || !session || session.user.role !== "admin") {
    return null; //—or a <Spinner /> if you have one
  }
  
  return (
    <motion.div 
      className="bg-black-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar aria-label="Main Navigation" />
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden mx-auto sm:px-10">
      <div className="w-full mb-4">
        <SlotsRequestsTable  />
      </div>
    </main>
    </motion.div>
  );
};

export default SlotRequestsPage;
