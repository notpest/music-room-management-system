"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { FaGuitar, FaKeyboard, FaMicrophone, FaUser } from "react-icons/fa";
import axios from "axios";

export type EntryLogType = {
  id: number;
  equipment_id?: string;
  scanned_at: string;
  Equipment?: {
    equipment_name: string;
    category: string;
  };
  student_name?: string;
};

const columns = [
  { key: "sl_no", name: "Sl. No" },
  { key: "name", name: "Name" },
  { key: "category", name: "Category" },
  { key: "scanned_at", name: "Scanned At" },
];

const equipmentIcons: { [key: string]: JSX.Element } = {
  guitar: <FaGuitar />,
  keyboard: <FaKeyboard />,
  mic: <FaMicrophone />,
  student: <FaUser />,
};

interface EntryLogTableProps {
  refreshCount: number;
  searchQuery: string;
  filterCategory: string;
  filterDate: string;
}

export default function EntryLogTable({ refreshCount, searchQuery, filterCategory, filterDate }: EntryLogTableProps) {
  const [logs, setLogs] = useState<EntryLogType[]>([
    {
      id: 1,
      equipment_id: "1",
      scanned_at: new Date().toISOString(),
      Equipment: {
        equipment_name: "Guitar",
        category: "guitar",
      },
    },
    {
      id: 2,
      equipment_id: "2",
      scanned_at: new Date().toISOString(),
      Equipment: {
        equipment_name: "Keyboard",
        category: "keyboard",
      },
    },
    {
      id: 3,
      equipment_id: "3",
      scanned_at: new Date().toISOString(),
      Equipment: {
        equipment_name: "Microphone",
        category: "mic",
      },
    },
    {
      id: 4,
      equipment_id: "4",
      scanned_at: new Date().toISOString(),
      student_name: "Nitin",
    },
    {
      id: 5,
      equipment_id: "5",
      scanned_at: new Date().toISOString(),
      student_name: "Rejoy",
    },
  ]);

  const fetchLogs = async () => {
    try {
      const res = await axios.get("/api/entrylogs");
      setLogs(res.data);
    } catch (error) {
      console.error("Error fetching entry logs:", error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [refreshCount]);

  const filteredLogs = logs.filter((log) => {
    const equipmentName = log.Equipment?.equipment_name || "";
    const studentName = log.student_name || "";
    const matchesSearch =
      (log.equipment_id && log.equipment_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" ||
      (log.Equipment && log.Equipment.category.toLowerCase() === filterCategory.toLowerCase()) ||
      (filterCategory === "student" && log.student_name);
    const logDate = new Date(log.scanned_at).toISOString().split("T")[0];
    const matchesDate = filterDate === "" || logDate === filterDate;
    return matchesSearch && matchesCategory && matchesDate;
  });

  return (
    <div className="flex flex-col items-center" style={{ backgroundColor: "#000319", minHeight: "100vh" }}>
      <Table
        aria-label="Entry Log Table"
        className="border border-gray-300 rounded-lg shadow-md text-center bg-[#0d1a33] text-white"
      >
        <TableHeader>
          {columns.map((col) => (
            <TableColumn key={col.key} className="bg-[#1a2a47] font-semibold">
              {col.name}
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {filteredLogs.map((log, index) => (
            <TableRow key={log.id} style={{ height: "50px" }}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                {log.Equipment && log.Equipment.equipment_name
                  ? log.Equipment.equipment_name
                  : log.student_name
                  ? log.student_name
                  : log.equipment_id}
              </TableCell>
              <TableCell>
                {log.Equipment && log.Equipment.category
                  ? equipmentIcons[log.Equipment.category.toLowerCase()] || log.Equipment.category
                  : log.student_name
                  ? equipmentIcons["student"]
                  : "Unknown"}
              </TableCell>
              <TableCell>{new Date(log.scanned_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
