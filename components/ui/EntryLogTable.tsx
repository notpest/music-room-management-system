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
import axios from "axios";

export type EntryLogType = {
  id: number;
  equipment_id: string;
  scanned_at: string;
  Equipment?: {
    equipment_name: string;
    category: string;
  };
};

const columns = [
  { key: "sl_no", name: "Sl. No" },
  { key: "name", name: "Name" },
  { key: "category", name: "Category" },
  { key: "scanned_at", name: "Scanned At" },
];

interface EntryLogTableProps {
  refreshCount: number;
  searchQuery: string;
  filterCategory: string;
  filterDate: string;
}

export default function EntryLogTable({ refreshCount, searchQuery, filterCategory, filterDate }: EntryLogTableProps) {
  const [logs, setLogs] = useState<EntryLogType[]>([]);

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
    const matchesSearch =
      log.equipment_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipmentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" ||
      (log.Equipment && log.Equipment.category.toLowerCase() === filterCategory.toLowerCase());
    const logDate = new Date(log.scanned_at).toISOString().split("T")[0];
    const matchesDate = filterDate === "" || logDate === filterDate;
    return matchesSearch && matchesCategory && matchesDate;
  });

  return (
    <div>
      <Table>
        <TableHeader>
          {columns.map((col) => (
            <TableColumn key={col.key}>{col.name}</TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {filteredLogs.map((log, index) => (
            <TableRow key={log.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                {log.Equipment && log.Equipment.equipment_name
                  ? log.Equipment.equipment_name
                  : log.equipment_id}
              </TableCell>
              <TableCell>
                {log.Equipment && log.Equipment.category
                  ? log.Equipment.category
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
