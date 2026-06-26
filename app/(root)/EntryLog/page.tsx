"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import EntryLogTable from "@/components/ui/EntryLogTable";
import { FaFilter } from "react-icons/fa";
import CIcon from '@coreui/icons-react';
import { cilReload } from '@coreui/icons';
import axios from "axios";
import { motion } from "framer-motion";
import Modal from "@/components/ui/Modal";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";

// Import Navbar dynamically with no SSR
const Navbar = dynamic(() => import("@/components/Navbar"), {
  ssr: false,
  loading: () => (
    <div className="h-64px w-full bg-background/60 backdrop-blur-lg" />
  ),
});

const EntryLogPage = () => {
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);

  const handleScan = async () => {
    setScanning(true);
    setMessage("");
    try {
      const res = await axios.post("/api/entrylogs");
      setMessage(res.data.message);
      setRefreshCount((prev) => prev + 1);
    } catch (error) {
      console.error(error);
      setMessage("Error scanning Gmail.");
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    handleScan();
  }, []);

  return (
    <motion.div 
      className="bg-black-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar/>
      <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden mx-auto px-4 sm:px-10">
        <div className="w-full h-full p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center my-6 sm:my-10 gap-2 w-full">
            <div className="flex items-center gap-2">
              <button
                onClick={handleScan}
                disabled={scanning}
                className={`p-2 rounded-full transition-transform shrink-0 ${scanning ? "animate-spin" : ""}`}
              >
                <CIcon icon={cilReload} style={{ width: "24px", height: "24px" }} />
              </button>
              <button onClick={() => setFilterModalOpen(true)} className="p-2 shrink-0">
                <FaFilter className="text-lg text-gray-400" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Search by Equipment ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white font-mono placeholder-gray-500"
            />
          </div>

          <Modal isOpen={isFilterModalOpen} onClose={() => setFilterModalOpen(false)} title="Filter Entry Logs">
            <div className="space-y-4">
              <select 
                value={filterCategory} 
                onChange={e => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md"
              >
                <option value="all">All</option>
                <option value="student">Student</option>
                <option value="equipment">Equipment</option>
              </select>
              <DayPicker
                mode="single"
                selected={filterDate}
                onSelect={setFilterDate}
              />
            </div>
            <div className="flex justify-end pt-4">
                <button onClick={() => setFilterModalOpen(false)} className="px-4 py-2 bg-purple-600 rounded-md">Apply</button>
            </div>
          </Modal>

          <EntryLogTable
            refreshCount={refreshCount}
            searchQuery={searchQuery}
            filterCategory={filterCategory}
            filterDate={filterDate ? format(filterDate, "yyyy-MM-dd") : ""}
          />
        </div>
      </main>
    </motion.div>
  );
};

export default EntryLogPage;
