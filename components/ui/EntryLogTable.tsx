"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { FaGuitar, FaKeyboard, FaMicrophone, FaUser } from "react-icons/fa";
import { MdOutlinePiano } from "react-icons/md";
import { motion } from "framer-motion";
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
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [isTableScrolled, setIsTableScrolled] = useState(false);
  const itemsPerPage = 10;

  const handleTableScroll = useCallback(() => {
    const el = tableScrollRef.current;
    if (el) {
      setIsTableScrolled(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    }
  }, []);

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

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 sm:p-6 rounded-3xl text-white w-full shadow-2xl">
      <div className="relative">
        <div
          ref={tableScrollRef}
          onScroll={handleTableScroll}
          className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]"
        >
        <table className="w-full text-left">
          <thead className="bg-white/5">
            <tr>
              <th className="p-2 sm:p-4 text-xs font-bold uppercase tracking-wider text-gray-400">Sl. No</th>
              <th className="p-2 sm:p-4 text-xs font-bold uppercase tracking-wider text-gray-400">Name</th>
              <th className="p-2 sm:p-4 text-xs font-bold uppercase tracking-wider text-gray-400">Category</th>
              <th className="p-2 sm:p-4 text-xs font-bold uppercase tracking-wider text-gray-400">Scanned At</th>
            </tr>
          </thead>
          <tbody>
            {currentLogs.map((log, index) => (
              <motion.tr
                key={log.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.02 }}
                className="border-b border-white/10 hover:bg-white/[0.03] transition-colors"
              >
                <td className="p-2 sm:p-3 font-mono text-sm text-gray-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td className="p-2 sm:p-3 font-mono text-sm text-gray-300">
                  {log.Equipment?.equipment_name || log.student_name || log.equipment_id}
                </td>
                <td className="p-2 sm:p-3 text-lg">
                  {log.Equipment?.category 
                    ? equipmentIcons[log.Equipment.category.toLowerCase()] || log.Equipment.category
                    : log.student_name 
                    ? equipmentIcons["student"] 
                    : "—"}
                </td>
                <td className="p-2 sm:p-3 font-mono text-sm text-gray-400">{new Date(log.scanned_at).toLocaleString()}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        </div>
        {isTableScrolled && (
          <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-black-100/80 via-black-100/40 to-transparent pointer-events-none rounded-r-2xl" />
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-xs transition-all"
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .map((p, i, arr) => {
              const showEllipsis = i > 0 && p - arr[i - 1] > 1;
              return (
                <React.Fragment key={p}>
                  {showEllipsis && <span className="text-xs text-gray-500 px-1">…</span>}
                  <button
                    onClick={() => setCurrentPage(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      currentPage === p
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              );
            })}
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-xs transition-all"
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
}
