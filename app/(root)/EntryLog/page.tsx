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
  Tooltip,
} from "@nextui-org/react";
import { FaFilter, FaSyncAlt } from "react-icons/fa";
import { Calendar } from "@heroui/react";
import { parseDate, today } from "@internationalized/date";
import axios from "axios";

// Import Navbar dynamically with no SSR
const Navbar = dynamic(() => import("@/components/Navbar"), {
  ssr: false,
  loading: () => (
    <div className="h-[64px] w-full bg-background/60 backdrop-blur-lg" />
  ),
});

const isValidDate = (dateString: string) => {
  const date = Date.parse(dateString);
  return !isNaN(date);
};

const EntryLogPage = () => {
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all"); // Options: "all", "student", "equipment"
  const [filterDate, setFilterDate] = useState("");
  const [isCalendarOpen, setCalendarOpen] = useState(false);

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

  function getLocalTimeZone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  return (
    <div className="bg-black-100">
      <Navbar aria-label="Main Navigation" />
      <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden mx-auto sm:px-10">
        <div className="w-full h-full">
          <h1> </h1>
          {/* Refresh button, search bar, and filter button */}
          <div className="flex items-center my-10 space-x-4" style={{ width: "90%" }}>
            <Button
              onPress={handleScan}
              disabled={scanning}
              className={`text-xl ${scanning ? "animate-spin" : ""}`}
              isIconOnly
              variant="light"
            >
              <FaSyncAlt />
            </Button>
            <Input
              isClearable
              variant="underlined"
              placeholder="Search by Equipment ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1 }}
            />
            <Tooltip content="Filter">
              <FaFilter
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                onClick={() => setFilterModalOpen(true)}
              />
            </Tooltip>
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
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ marginRight: "1rem" }}>Scanned Date:</label>
                  <div
                    style={{
                      padding: "0.5rem",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                    onClick={() => setCalendarOpen(true)}
                  >
                    {filterDate ? new Date(filterDate).toLocaleDateString("en-GB") : "dd-mm-yyyy"}
                  </div>
                  {isCalendarOpen && (
                    <Calendar
                      aria-label="Date Picker"
                      defaultValue={filterDate ? parseDate(filterDate) : today(getLocalTimeZone())}
                      onChange={(e) => {
                        setFilterDate(e.toString());
                        setCalendarOpen(false);
                      }}
                    />
                  )}
                </div>
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
    </div>
  );
};

export default EntryLogPage;
