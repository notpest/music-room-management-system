"use client";

import React from 'react'
import SlotRequestsTable from '@/components/ui/SlotsRequestTable'
import dynamic from "next/dynamic";

// Import Navbar dynamically with no SSR
const Navbar = dynamic(() => import("@/components/Navbar"), {
  ssr: false,
  loading: () => (
    <div className="h-[64px] w-full bg-background/60 backdrop-blur-lg" />
  ),
});

const SlotRequestsPage = () => {
  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden mx-auto sm:px-10">
      <div className="w-full" style={{ padding: "2rem" }}>
        <Navbar aria-label="Main Navigation" />
        <SlotRequestsTable />
      </div>
    </main>
  );
};

export default SlotRequestsPage
