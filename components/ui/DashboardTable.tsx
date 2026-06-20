"use client";

import React, { useState, ChangeEvent } from "react";

interface SlotConfig {
  id: number;
  start_time: string;
  end_time: string;
  enabled: boolean;
}

interface DashboardTableProps {
  configs: SlotConfig[];
  fetchConfigs: () => void;
  toggleEnabled: (id: number, current: boolean) => void;
  addConfig: (start: string, end: string) => void;
  currentPage: number;
  itemsPerPage: number;
  handlePageChange: (page: number) => void;
}

const DashboardTable: React.FC<DashboardTableProps> = ({
  configs,
  fetchConfigs,
  toggleEnabled,
  addConfig,
  currentPage,
  itemsPerPage,
  handlePageChange,
}) => {
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");

  const totalPages = Math.ceil(configs.length / itemsPerPage);
  const currentConfigs = configs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderPaginationButtons = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
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
  
  const handleAddClick = () => {
    if (newStart && newEnd) {
      addConfig(newStart, newEnd);
      setNewStart("");
      setNewEnd("");
    } else {
      alert("Please enter both start and end times.");
    }
  };

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 w-full text-white">
      <h2 className="text-2xl font-semibold mb-6 text-center">Slot Management</h2>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="time"
          value={newStart}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewStart(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 text-white"
        />
        <input
          type="time"
          value={newEnd}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewEnd(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 text-white"
        />
        <button
          onClick={handleAddClick}
          className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition-colors"
        >
          Add Slot
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-700">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-300">ID</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Start Time</th>
              <th className="p-4 text-sm font-semibold text-gray-300">End Time</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Status</th>
              <th className="p-4 text-sm font-semibold text-gray-300 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentConfigs.map((config) => (
              <tr key={config.id} className="border-b border-gray-800 hover:bg-gray-800/60 transition-colors">
                <td className="p-4">{config.id}</td>
                <td className="p-4 font-mono">{config.start_time}</td>
                <td className="p-4 font-mono">{config.end_time}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      config.enabled
                        ? "bg-green-500/20 text-green-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {config.enabled ? "Enabled" : "Disabled"}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => toggleEnabled(config.id, config.enabled)}
                    className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${
                      config.enabled
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    {config.enabled ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6">
           <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 mx-1 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {"<"}
          </button>
          {renderPaginationButtons()}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 mx-1 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {">"}
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardTable;
