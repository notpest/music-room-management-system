"use client";

import React, { useEffect, useState, ChangeEvent } from 'react';
import axios from 'axios';
import DashboardTable from "../../../components/ui/DashboardTable";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const NavbarComponent = dynamic(() => import("../../../components/Navbar"), {
  ssr: false,
  loading: () => <div className="h-[64px] w-full bg-background/60 backdrop-blur-lg" />,
});

interface SlotConfig {
  id: number;
  start_time: string;
  end_time: string;
  enabled: boolean;
}

export default function AdminDashboard() {
  const [configs, setConfigs] = useState<SlotConfig[]>([]);
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newEnabled, setNewEnabled] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // Adjust based on table height

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await axios.get("/api/slotconfig");
      setConfigs(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addConfig = async (start: string, end: string) => {
    if (!start || !end) {
      console.error("Start time and end time are required.");
      return;
    }
  
    try {
      await axios.post("/api/slotconfig", {
        start_time: start,
        end_time: end,
        enabled: newEnabled,
      });
      fetchConfigs();
    } catch (error) {
      console.error("Error creating slot configuration:", error);
    }
  };  

  const toggleEnabled = async (id: number, current: boolean) => {
    try {
      await axios.put("/api/slotconfig", {
        id,
        enabled: !current,
      });
      fetchConfigs();
    } catch (error) {
      console.error(error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <motion.div 
      className="h-screen bg-black-100 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <NavbarComponent />
      <div className="container mx-auto p-4 flex-grow flex items-center justify-center">
        <DashboardTable 
          configs={configs} 
          fetchConfigs={fetchConfigs} 
          toggleEnabled={toggleEnabled} 
          addConfig={addConfig} 
          currentPage={currentPage} 
          itemsPerPage={itemsPerPage} 
          handlePageChange={handlePageChange} 
        />
      </div>
    </motion.div>
  );
}
