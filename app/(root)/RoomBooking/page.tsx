"use client";

import React from "react";
import RBTable from "../../../components/ui/RBTable";
import dynamic from "next/dynamic";

// Import Navbar dynamically with no SSR
const Navbar = dynamic(() => import("@/components/Navbar"), {
  ssr: false,
  loading: () => (
    <div className="h-[64px] w-full bg-background/60 backdrop-blur-lg" />
  ),
});

const RoomBookingPage = () => {
  return (
    <div className="bg-black-100">
    <Navbar aria-label="Main Navigation" />
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden mx-auto sm:px-10">
      <div className="w-full">
        <RBTable />
      </div>
    </main>
    </div>
  );
};

export default RoomBookingPage;
