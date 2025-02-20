"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import EntryLogTable from "@/components/ui/EntryLogTable";
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
} from "@nextui-org/react";
import axios from "axios";

// Import Navbar dynamically with no SSR
const Navbar = dynamic(() => import("@/components/Navbar"), {
  ssr: false,
  loading: () => (
    <div className="h-[64px] w-full bg-background/60 backdrop-blur-lg" />
  ),
});

const EntryLogPage = () => {
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all"); // Options: "all", "student", "equipment"
  const [filterDate, setFilterDate] = useState("");

  const handleScan = async () => {
    setScanning(true);
    setMessage("");
    try {
      const res = await axios.post("/api/entrylogs");
      setMessage(res.data.message);
      // Increase refresh count to trigger table reload.
      setRefreshCount((prev) => prev + 1);
    } catch (error) {
      console.error(error);
      setMessage("Error scanning Gmail.");
    } finally {
      setScanning(false);
    }
  };

  // Automatically initiate the scan when the page loads
  useEffect(() => {
    handleScan();
  }, []);

  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden mx-auto sm:px-10">
      <div className="w-full" style={{ padding: "2rem" }}>
        <Navbar aria-label="Main Navigation" />
        <h1> </h1>
        {/* Refresh button and search bar with filter button */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1rem",
            alignItems: "center",
          }}
        >
          <Button onPress={handleScan} disabled={scanning}>
            {scanning ? "Refreshing..." : "Refresh"}
          </Button>
          <Input
            isClearable
            variant="underlined"
            placeholder="Search by Equipment ID or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button onPress={() => setFilterModalOpen(true)}>Filter</Button>
        </div>

        {/* Filter Modal */}
        <Modal isOpen={filterModalOpen} onOpenChange={setFilterModalOpen}>
          <ModalContent>
            <ModalHeader>Filter Entry Logs</ModalHeader>
            <ModalBody>
              <Select
                label="Category"
                selectedKeys={new Set([filterCategory])}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setFilterCategory(selected);
                }}
              >
                <SelectItem key="all" value="all">
                  All
                </SelectItem>
                <SelectItem key="student" value="student">
                  Student
                </SelectItem>
                <SelectItem key="equipment" value="equipment">
                  Equipment
                </SelectItem>
              </Select>
              <Input
                type="date"
                label="Scanned Date"
                placeholder="Select date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                fullWidth
              />
            </ModalBody>
            <ModalFooter>
              <Button onPress={() => setFilterModalOpen(false)}>
                Apply Filters
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <EntryLogTable
          refreshCount={refreshCount}
          searchQuery={searchQuery}
          filterCategory={filterCategory}
          filterDate={filterDate}
        />
      </div>
    </main>
  );
};

export default EntryLogPage;
