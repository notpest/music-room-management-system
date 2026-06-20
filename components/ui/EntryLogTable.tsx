"use client";

import React, { useEffect, useState } from "react";
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

const equipmentIcons: { [key: string]: JSX.Element } = {
  guitar: <FaGuitar className="text-purple-400" />,
  instrument: <MdOutlinePiano className="text-purple-400" />,
  mic: <FaMicrophone className="text-purple-400" />,
  student: <FaUser className="text-purple-400" />,
  teacher: <FaUser className="text-purple-400" />,
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
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get("/api/entrylogs");
        setLogs(res.data);
      } catch (error) {
        console.error("Error fetching entry logs:", error);
      }
    };
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

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const currentLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderPaginationButtons = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-4 py-2 mx-1 rounded-md transition-colors ${
            currentPage === i
              ? "bg-purple-600 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 sm:p-6 text-white w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-700">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-300">Sl. No</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Name</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Category</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Scanned At</th>
            </tr>
          </thead>
          <tbody>
            {currentLogs.map((log, index) => (
              <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/60 transition-colors">
                <td className="p-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td className="p-4">
                  {log.Equipment?.equipment_name || log.student_name || log.equipment_id}
                </td>
                <td className="p-4 text-xl">
                  {log.Equipment?.category 
                    ? equipmentIcons[log.Equipment.category.toLowerCase()] || log.Equipment.category
                    : log.student_name 
                    ? equipmentIcons["student"] 
                    : "—"}
                </td>
                <td className="p-4">{new Date(log.scanned_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 mx-1 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {"<"}
          </button>
          {renderPaginationButtons()}
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 mx-1 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {">"}
          </button>
        </div>
      )}
    </div>
  );
}
