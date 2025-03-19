"use client";

import React, { useState, ChangeEvent } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableColumn,
  Button,
  Pagination,
  Input,
  Chip,
} from "@nextui-org/react";

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

  // Color mapping for the "enabled" column
  const enabledColorMap: { [key: string]: "success" | "danger" | "default" | "primary" | "secondary" | "warning" | undefined } = {
    true: "success",
    false: "danger",
  };

  // Calculate the current configurations to display based on pagination
  const currentConfigs = configs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Function to go to the previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  // Function to go to the next page
  const goToNextPage = () => {
    if (currentPage < Math.ceil(configs.length / itemsPerPage)) {
      handlePageChange(currentPage + 1);
    }
  };

  return (
    <div className="bg-black-100 shadow-md rounded-lg p-6 w-full">
      <h2 className="text-xl font-semibold mb-4">Slot Management</h2>

      {/* Input Fields for Adding Slots */}
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Start Time (HH:mm)"
          value={newStart}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewStart(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder="End Time (HH:mm)"
          value={newEnd}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewEnd(e.target.value)}
          className="flex-1"
        />
        <Button
          onPress={() => {
            if (newStart && newEnd) {
              addConfig(newStart, newEnd);
              setNewStart("");
              setNewEnd("");
            } else {
              alert("Please enter both start and end times.");
            }
          }}
          className="bg-blue-500 text-white"
        >
          Add Slot
        </Button>
      </div>

      {/* Table for Slot Configurations */}
      <Table aria-label="Slot Configurations">
        <TableHeader className="font-sans font-semibold text-sm">
          <TableColumn>ID</TableColumn>
          <TableColumn>Start Time</TableColumn>
          <TableColumn>End Time</TableColumn>
          <TableColumn>Enabled</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {currentConfigs.map((config) => (
            <TableRow key={config.id}>
              <TableCell>{config.id}</TableCell>
              <TableCell>{config.start_time}</TableCell>
              <TableCell>{config.end_time}</TableCell>
              <TableCell>
                <Chip
                  className="capitalize"
                  color={enabledColorMap[config.enabled.toString()]}
                  size="sm"
                  variant="flat"
                >
                  {config.enabled ? "Yes" : "No"}
                </Chip>
              </TableCell>
              <TableCell>
                <Button
                  onPress={() => toggleEnabled(config.id, config.enabled)}
                  color={config.enabled ? "danger" : "success"} // Toggle button color
                  className="text-white"
                >
                  {config.enabled ? "Disable" : "Enable"}
                </Button>
              </TableCell>
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
          total={Math.ceil(configs.length / itemsPerPage)}
          page={currentPage}
          initialPage={1}
          onChange={handlePageChange}
        />

        {/* Next Page Button */}
        <Button
          isIconOnly
          variant="light"
          onPress={goToNextPage}
          disabled={currentPage === Math.ceil(configs.length / itemsPerPage)}
        >
          {">"}
        </Button>
      </div>
    </div>
  );
};

export default DashboardTable;