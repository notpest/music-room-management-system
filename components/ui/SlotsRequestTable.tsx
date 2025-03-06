"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
} from "@nextui-org/react";
import axios from "axios";
import { EditIcon } from "./EditIcon";
import { DeleteIcon } from "./DeleteIcon";
import { FaFilter } from "react-icons/fa";
import { Calendar } from "@heroui/react";
import { parseDate, today } from "@internationalized/date";

// --- Icon Components for Approve and Deny Actions ---
const AcceptIcon = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ height: 20, width: 20 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const DenyIcon = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ height: 20, width: 20 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// --- Type for a Request ---
export type RequestType = {
  id: string;
  user_id: string;
  status: "approved" | "denied" | "pending";
  slot_start: string;
  slot_end: string;
  request_date: string;
  response_date: string | null;
  user_name?: string;
  band_name?: string;
};

const columns = [
  { key: "user_name", name: "USER NAME" },
  { key: "band_name", name: "BAND NAME" },
  { key: "status", name: "STATUS" },
  { key: "slot_start", name: "SLOT START TIME" },
  { key: "slot_end", name: "SLOT END TIME" },
  { key: "request_date", name: "REQUEST DATE" },
  { key: "response_date", name: "RESPONSE DATE" },
  { key: "actions", name: "ACTIONS" },
];

const statusColorMap: { [key in RequestType["status"]]: "success" | "danger" | "warning" } = {
  approved: "success",
  denied: "danger",
  pending: "warning",
};

const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

const combineDateAndTime = (originalISO: string, newTime: string): string => {
  const originalDate = new Date(originalISO);
  const [hours, minutes] = newTime.split(":").map(Number);
  originalDate.setHours(hours, minutes, 0, 0);
  return originalDate.toISOString();
};

export default function SlotsRequestTable() {
  interface TimeSlot {
    key: string;
    display: string;
  }

  const timeSlots: TimeSlot[] = [
    { key: "07:30", display: "07:30 AM" },
    { key: "09:00", display: "09:00 AM" },
    { key: "10:30", display: "10:30 AM" },
    { key: "12:00", display: "12:00 PM" },
    { key: "13:30", display: "01:30 PM" },
    { key: "15:00", display: "03:00 PM" },
    { key: "16:30", display: "04:30 PM" },
    { key: "18:00", display: "06:00 PM" },
  ];
  
  // State for selected room id – default is room 365.
  // Replace these with your actual room UUIDs.
  const [selectedRoom, setSelectedRoom] = useState<string>("25b48b88-7e94-422b-b3b4-97c78aa6966a");

  const [defaultStartTime, setDefaultStartTime] = useState<string>("");
  const [defaultEndTime, setDefaultEndTime] = useState<string>("");
  const [requests, setRequests] = useState<RequestType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [isCalendarOpen, setCalendarOpen] = useState(false);

  // Edit modal states
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestType | null>(null);
  const [editForm, setEditForm] = useState({
    status: "",
    slot_start: "",
    slot_end: "",
  });

  // Fetch requests from API with room_id filtering
  const fetchRequests = async () => {
    try {
      const res = await axios.get("/api/requests", {
        params: { room_id: selectedRoom },
      });
      setRequests(res.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [selectedRoom]);

  const handleApprove = async (id: string) => {
    try {
      await axios.put(`/api/requests?id=${id}`, { status: "approved" });
      fetchRequests();
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleDeny = async (id: string) => {
    try {
      await axios.put(`/api/requests?id=${id}`, { status: "denied" });
      fetchRequests();
    } catch (error) {
      console.error("Error denying request:", error);
    }
  };

  const handleEdit = (req: RequestType) => {
    setSelectedRequest(req);
    const formattedStart = formatTime(req.slot_start);
    const formattedEnd = formatTime(req.slot_end);
    setEditForm({
      status: req.status,
      slot_start: formattedStart,
      slot_end: formattedEnd,
    });
    setDefaultStartTime(formattedStart);
    setDefaultEndTime(formattedEnd);
    setEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/requests?id=${id}`);
      fetchRequests();
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  const submitEditForm = async () => {
    if (!selectedRequest) return;
  
    const updatedSlotStart = combineDateAndTime(selectedRequest.slot_start, editForm.slot_start);
    const updatedSlotEnd = combineDateAndTime(selectedRequest.slot_end, editForm.slot_end);
  
    const updateData = {
      status: editForm.status,
      slot_start: updatedSlotStart,
      slot_end: updatedSlotEnd,
    };
  
    try {
      await axios.put(`/api/requests?id=${selectedRequest.id}`, updateData);
      setEditModalOpen(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error("Error editing request:", error);
    }
  };
  
  const filteredRequests = requests.filter((req) => {
    const matchesSearch = (req.user_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    const matchesDate = dateFilter === "" || req.request_date.startsWith(dateFilter);
    return matchesSearch && matchesStatus && matchesDate;
  });
  
  const renderCell = (req: RequestType, columnKey: string) => {
    switch (columnKey) {
      case "user_name":
        return <span>{req.user_name || "N/A"}</span>;
      case "band_name":
        return <span>{req.band_name || "N/A"}</span>;
      case "status":
        return (
          <Chip color={statusColorMap[req.status]}>
            {req.status.toUpperCase()}
          </Chip>
        );
      case "slot_start":
        return <span>{new Date(req.slot_start).toLocaleString()}</span>;
      case "slot_end":
        return <span>{new Date(req.slot_end).toLocaleString()}</span>;
      case "request_date":
        return <span>{new Date(req.request_date).toLocaleString()}</span>;
      case "response_date":
        return (
          <span>
            {req.response_date ? new Date(req.response_date).toLocaleString() : "-"}
          </span>
        );
      case "actions":
        return (
          <div style={{ display: "flex", gap: "8px" }}>
            {req.status === "pending" && (
              <>
                <Tooltip content="Approve">
                  <button onClick={() => handleApprove(req.id)}>
                    <AcceptIcon />
                  </button>
                </Tooltip>
                <Tooltip content="Deny">
                  <button onClick={() => handleDeny(req.id)}>
                    <DenyIcon />
                  </button>
                </Tooltip>
              </>
            )}
            <Tooltip content="Edit">
              <button onClick={() => handleEdit(req)}>
                <EditIcon />
              </button>
            </Tooltip>
            <Tooltip content="Delete">
              <button onClick={() => handleDelete(req.id)}>
                <DeleteIcon />
              </button>
            </Tooltip>
          </div>
        );
      default:
        return null;
    }
  };
  
  function getLocalTimeZone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  
  // (Optionally, you could add a toggle button here to switch selectedRoom between room 365 and 366.)
  // For example:
  const toggleRoom = () => {
    setSelectedRoom((prev) => (prev === "25b48b88-7e94-422b-b3b4-97c78aa6966a" ? "3abca8d0-8c88-437c-b7fd-9d5c67fcfee0" : "25b48b88-7e94-422b-b3b4-97c78aa6966a"));
  };
  
  return (
    <div className="flex flex-col items-center" style={{ backgroundColor: "#000319", minHeight: "100vh" }}>
      <div className="flex items-center justify-between w-full my-10 px-4">
        <div className="flex-1 flex justify-center items-center space-x-2 text-lg font-semibold text-white">
          <span>Current Room: Room {selectedRoom === "uuid365" ? 365 : 366}</span>
        </div>
        <Button onPress={toggleRoom} color="primary">
          Switch Room {selectedRoom === "uuid365" ? "366" : "365"}
        </Button>
      </div>
  
      <div className="flex items-center my-10 space-x-4" style={{ width: "90%" }}>
        <Input
          isClearable
          variant="underlined"
          placeholder="Search by user ID..."
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
  
      <Table
        aria-label="Requests Table"
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
          {filteredRequests.map((req) => (
            <TableRow key={req.id} style={{ height: "50px" }}>
              {columns.map((col) => (
                <TableCell key={col.key}>
                  {renderCell(req, col.key)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
  
      <Modal isOpen={isEditModalOpen} onOpenChange={setEditModalOpen}>
        <ModalContent>
          <ModalHeader>Edit Request</ModalHeader>
          <ModalBody>
            <Select
              label="Status"
              selectedKeys={new Set([editForm.status])}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setEditForm({ ...editForm, status: selected });
              }}
            >
              <SelectItem key="pending" value="pending">
                Pending
              </SelectItem>
              <SelectItem key="approved" value="approved">
                Approved
              </SelectItem>
              <SelectItem key="denied" value="denied">
                Denied
              </SelectItem>
            </Select>
            <Select
              label="Slot Start Time"
              placeholder={defaultStartTime}
              selectedKeys={new Set([editForm.slot_start])}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                if (timeSlots.some((ts) => ts.key === selected)) {
                  setEditForm({ ...editForm, slot_start: selected });
                } else {
                  alert("Invalid time slot selected");
                }
              }}
            >
              {timeSlots.map((slot) => (
                <SelectItem key={slot.key} value={slot.key}>
                  {slot.display}
                </SelectItem>
              ))}
            </Select>
            <Select
              label="Slot End Time"
              placeholder={defaultEndTime}
              selectedKeys={new Set([editForm.slot_end])}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                if (timeSlots.some((ts) => ts.key === selected) || selected === "19:30") {
                  setEditForm({ ...editForm, slot_end: selected });
                } else {
                  alert("Invalid time slot selected");
                }
              }}
            >
              <>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot.key} value={slot.key}>
                    {slot.display}
                  </SelectItem>
                ))}
                <SelectItem key="19:30" value="19:30">
                  07:30 PM
                </SelectItem>
              </>
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button color="success" onPress={submitEditForm}>
              Save Changes
            </Button>
            <Button color="danger" onPress={() => setEditModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  
      <Modal isOpen={isFilterModalOpen} onOpenChange={setFilterModalOpen}>
        <ModalContent>
          <ModalHeader>Filter Requests</ModalHeader>
          <ModalBody>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ marginRight: "1rem" }}>Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: "0.5rem" }}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
              </select>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ marginRight: "1rem" }}>Request Date:</label>
              <div
                style={{
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={() => setCalendarOpen(true)}
              >
                {dateFilter ? new Date(dateFilter).toLocaleDateString("en-GB") : "dd-mm-yyyy"}
              </div>
              {isCalendarOpen && (
                <Calendar
                  aria-label="Date Picker"
                  defaultValue={dateFilter ? parseDate(dateFilter) : today(getLocalTimeZone())}
                  onChange={(e) => {
                    setDateFilter(e.toString());
                    setCalendarOpen(false);
                  }}
              />
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="success" onPress={() => setFilterModalOpen(false)}>
              Apply Filters
            </Button>
            <Button color="danger" onPress={() => setFilterModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
