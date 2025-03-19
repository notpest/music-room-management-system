"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Button,
} from "@nextui-org/react";
import { FaGuitar, FaKeyboard, FaMicrophone, FaUser } from "react-icons/fa";
import { MdOutlinePiano } from "react-icons/md";
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
  instrument: <MdOutlinePiano />,
  mic: <FaMicrophone />,
  student: <FaUser />,
  teacher: <FaUser />,
};

interface EntryLogTableProps {
  refreshCount: number;
  searchQuery: string;
  filterCategory: string;
  filterDate: string;
}

export default function EntryLogTable({ refreshCount, searchQuery, filterCategory, filterDate }: EntryLogTableProps) {
  const [logs, setLogs] = useState<EntryLogType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page

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

  // Filter logs based on search, category, and date
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

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const currentLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Go to previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Go to next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="flex flex-col items-center" style={{ backgroundColor: "#000319", minHeight: "100vh" }}>
      <Table aria-label="Entry Log Table">
        <TableHeader>
          {columns.map((col) => (
            <TableColumn key={col.key} className="bg-[#1a2a47] font-sans font-semibold text-sm">
              {col.name}
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {currentLogs.map((log, index) => (
            <TableRow key={log.id} style={{ height: "50px" }}>
              <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
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

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-4 gap-2">
        {/* Previous Page Button */}
        <Button
          isIconOnly
          variant="light"
          onPress={goToPreviousPage}
          disabled={currentPage === 1}
        >
          {"<"}
        </Button>

        {/* Pagination Component */}
        <Pagination
          total={totalPages}
          page={currentPage}
          initialPage={1}
          onChange={setCurrentPage}
        />

        {/* Next Page Button */}
        <Button
          isIconOnly
          variant="light"
          onPress={goToNextPage}
          disabled={currentPage === totalPages}
        >
          {">"}
        </Button>
      </div>
    </div>
  );
}