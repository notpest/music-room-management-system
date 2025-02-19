"use client";

import React, { useState } from "react";
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

  return (
    <div style={{ padding: "2rem" }}>
      <h1> </h1>
      {/* Search bar with filter button on the right */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", alignItems: "center" }}>
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
      <Button onPress={handleScan} disabled={scanning}>
        {scanning ? "Scanning..." : "Scan Gmail for Entry Logs"}
      </Button>
      
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
              <SelectItem key="all" value="all">All</SelectItem>
              <SelectItem key="student" value="student">Student</SelectItem>
              <SelectItem key="equipment" value="equipment">Equipment</SelectItem>
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
            <Button onPress={() => setFilterModalOpen(false)}>Apply Filters</Button>
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
  );
};

export default EntryLogPage;
