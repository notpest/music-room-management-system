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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
  ButtonGroup,
  Popover, 
  PopoverTrigger, 
  PopoverContent,
  useDisclosure
} from "@nextui-org/react";
import axios from "axios";
import { EditIcon } from "./EditIcon";
import { FaFilter, FaCalendarAlt, FaChevronDown } from "react-icons/fa";
import { Calendar } from "@heroui/react";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import { parseDate, today } from "@internationalized/date";

// --- Icon Components for Approve and Deny Actions ---
const AcceptIcon = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ height: 20, width: 20 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const DeleteIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
    <path
      d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
    <path
      d="M7.08331 4.14169L7.26665 3.05002C7.39998 2.25835 7.49998 1.66669 8.90831 1.66669H11.0916C12.5 1.66669 12.6083 2.29169 12.7333 3.05835L12.9166 4.14169"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
    <path
      d="M15.7084 7.61664L15.1667 16.0083C15.075 17.3166 15 18.3333 12.675 18.3333H7.32502C5.00002 18.3333 4.92502 17.3166 4.83335 16.0083L4.29169 7.61664"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
    <path d="M8.60834 13.75H11.3833" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    <path d="M7.91669 10.4167H12.0834" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
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
  reason?: string;
};

const statusColorMap: { [key in RequestType["status"]]: "default" | "primary" | "secondary" | "success" | "warning" | "danger" } = {
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

interface SlotsRequestsTableProps {
   isAdmin: boolean;
   userId: string;
 }

export default function SlotsRequestTable({
   isAdmin,
   userId,
 }: SlotsRequestsTableProps) {

  
const baseCols = [
  { key: "user_name", name: "USER NAME" },
  { key: "band_name", name: "PROFILE NAME" },
  { key: "status", name: "STATUS" },
  { key: "slot_start", name: "SLOT START TIME" },
  { key: "slot_end", name: "SLOT END TIME" },
  { key: "reason", name: "REASON" },
  { key: "request_date", name: "REQUEST DATE" },
  { key: "response_date", name: "RESPONSE DATE" },
];

const columns = [...baseCols, { key: "actions", name: "ACTIONS" }];

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
  const [roomAlignment, setRoomAlignment] = useState<string>("365");
  const [defaultStartTime, setDefaultStartTime] = useState<string>("");
  const [defaultEndTime, setDefaultEndTime] = useState<string>("");
  const [requests, setRequests] = useState<RequestType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestType | null>(null);
  const [editForm, setEditForm] = useState({
    status: "",
    slot_start: "",
    slot_end: "",
    reason: "",
  });

  const [conflictMessage, setConflictMessage] = useState("");
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [conflictBandName, setConflictBandName] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<RequestType | null>(null);


  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7); // Set to 7 for 7 items per page

  // Filtered requests based on search, status, and date
  const q = searchQuery.toLowerCase();
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
    (req.user_name   || "").toLowerCase().includes(q) ||
    (req.band_name   || "").toLowerCase().includes(q) ||
    req.status.toLowerCase().includes(q) ||
    new Date(req.slot_start)
      .toLocaleString().toLowerCase().includes(q) ||
    new Date(req.slot_end)
      .toLocaleString().toLowerCase().includes(q) ||
    new Date(req.request_date)
      .toLocaleString().toLowerCase().includes(q) ||
    (req.response_date
      ? new Date(req.response_date)
          .toLocaleString().toLowerCase().includes(q)
      : false);

    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    const matchesDate   = dateFilter === "" || req.request_date.startsWith(dateFilter);
    return matchesSearch && matchesStatus && matchesDate;
  });

 // Paginated requests for the current page - this will now show exactly 8 items per page
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Sync inputValue with dateFilter
  useEffect(() => {
    if (dateFilter) {
      setInputValue(new Date(dateFilter).toLocaleDateString("en-GB"));
    } else {
      setInputValue("");
    }
  }, [dateFilter]);

  // Fetch requests, including user_id if not admin
  const fetchRequests = async () => {
    try {
      const params: any = { room_id: selectedRoom };
      if (!isAdmin) params.user_id = userId;
      const res = await axios.get("/api/requests", { params });
      setRequests(res.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [selectedRoom, isAdmin, userId]);

  const handleApprove = async (id: string) => {
    try {
      await axios.put(`/api/requests?id=${id}`, { status: "approved" });
      fetchRequests();
    } catch (error: any) {
      console.error("Error approving request:", error);
      if (error.response?.status === 409) {
        setConflictBandName(error.response.data.band_name);
        setIsConflictModalOpen(true);
      }
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
      reason: req.reason || "",
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleDeleteClick = (req: RequestType) => {
    setRequestToDelete(req);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (requestToDelete) {
      try {
        await axios.delete(`/api/requests?id=${requestToDelete.id}`);
        fetchRequests();
      } catch (error) {
        console.error("Error deleting request:", error);
      } finally {
        setIsDeleteModalOpen(false);
        setRequestToDelete(null);
      }
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
      reason: editForm.reason,
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
  
  const renderCell = (req: RequestType, columnKey: string) => {
    switch (columnKey) {
      case "user_name":
        return(
          <Popover placement="top" showArrow offset={10}>
            <PopoverTrigger>
              <div className="max-w-[150px] truncate cursor-pointer">
                {req.user_name || "N/A"}
              </div>
            </PopoverTrigger>
            <PopoverContent className="max-w-[300px] bg-[#1a2a47] text-white p-4">
              <div className="px-1 py-2">
                <div className="text-small font-bold">User Name</div>
                <div className="text-tiny whitespace-pre-wrap">
                  {req.user_name || "No user name provided"}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )
      case "band_name":
        return (
          <Popover placement="top" showArrow offset={10}>
            <PopoverTrigger>
              <div className="max-w-[150px] truncate cursor-pointer">
                {req.band_name || "N/A"}
              </div>
            </PopoverTrigger>
            <PopoverContent className="max-w-[300px] bg-[#1a2a47] text-white p-4">
              <div className="px-1 py-2">
                <div className="text-small font-bold">Profile Name</div>
                <div className="text-tiny whitespace-pre-wrap">
                  {req.band_name || "No band name provided"}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        );
      case "status":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[req.status]}
            size="sm"
            variant="flat"
          >
            {req.status.toUpperCase()}
          </Chip>
        );
      case "slot_start":
        return <span>{new Date(req.slot_start).toLocaleString()}</span>;
      case "slot_end":
        return <span>{new Date(req.slot_end).toLocaleString()}</span>;
      case "reason":
        return (
          <Popover placement="top" showArrow offset={10}>
            <PopoverTrigger>
              <div className="max-w-[150px] truncate cursor-pointer">
                {req.reason || "N/A"}
              </div>
            </PopoverTrigger>
            <PopoverContent className="max-w-[300px] bg-[#1a2a47] text-white p-4">
              <div className="px-1 py-2">
                <div className="text-small font-bold">Reason</div>
                <div className="text-tiny whitespace-pre-wrap">
                  {req.reason || "No reason provided"}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        );
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
            {isAdmin && req.status === "pending" && (
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
            {isAdmin && (
              <Tooltip content="Edit">
                <button onClick={() => handleEdit(req)}>
                  <EditIcon />
                </button>
              </Tooltip>
            )}
            <Tooltip content="Delete">
              <button onClick={() => handleDeleteClick(req)}>
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
  
  const handleRoomAlignment = (newAlignment: string) => {
    setRoomAlignment(newAlignment);
    setSelectedRoom(newAlignment === "365" ? "25b48b88-7e94-422b-b3b4-97c78aa6966a" : "3abca8d0-8c88-437c-b7fd-9d5c67fcfee0");
  };

  const toggleRoom = () => {
    setSelectedRoom((prev) =>
      prev === "25b48b88-7e94-422b-b3b4-97c78aa6966a"
        ? "3abca8d0-8c88-437c-b7fd-9d5c67fcfee0"
        : "25b48b88-7e94-422b-b3b4-97c78aa6966a"
    );
  };
  
  return (
    <div className="flex flex-col items-center" style={{ backgroundColor: "#000319", height:"89vh"}}>
 {/* Room Toggle Button */}
<div className="flex justify-center w-full my-4 px-4">
  <div className="flex flex-row items-center space-x-4 my-6 w-full max-w-5xl">
    {/* Dropdown */}
    <Dropdown placement="bottom-start">
      <DropdownTrigger>
        <Button className="flex items-center gap-2 bg-[#18181b] text-white px-4 py-2 rounded">
          {selectedRoom === "25b48b88-7e94-422b-b3b4-97c78aa6966a" ? "Room 365" : "Room 366"}
          <FaChevronDown />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disallowEmptySelection
        aria-label="Room Selection"
        className="max-w-[200px] min-w-[100px]"
        selectedKeys={new Set([selectedRoom])}
        selectionMode="single"
        onSelectionChange={(keys) => {
          const newRoom = Array.from(keys)[0] as string;
          handleRoomAlignment(newRoom);
        }}
      >
        <DropdownItem key="365">Room 365</DropdownItem>
        <DropdownItem key="366">Room 366</DropdownItem>
      </DropdownMenu>
    </Dropdown>

    {/* Search + Filter Icon */}
    <div className="flex items-center space-x-2 flex-grow">
      <Input
        isClearable
        variant="underlined"
        placeholder="Search.."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full"
      />
      <Tooltip content="Filter">
        <FaFilter
          className="text-lg text-default-400 cursor-pointer active:opacity-50"
          onClick={() => setFilterModalOpen(true)}
        />
      </Tooltip>
    </div>
  </div>
</div>
  
      <Table aria-label="Requests Table">
        <TableHeader>
          {columns.map((col) => (
            <TableColumn key={col.key} className="bg-[#1a2a47] font-sans font-semibold text-sm">
              {col.name}
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {paginatedRequests.map((req) => (
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

      {/* Pagination with < and > buttons */}
      <div className="flex justify-center mt-4">
        <Pagination
          total={Math.ceil(filteredRequests.length / itemsPerPage)}
          initialPage={1}
          page={currentPage}
          onChange={(page) => setCurrentPage(page)}
          showControls
        />
      </div>
  
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
            <Input
              label="Reason"
              value={editForm.reason || ""}
              onChange={(e) => setEditForm({...editForm, reason: e.target.value})}
              placeholder="Enter reason for booking"
            />
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
  
      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>
            <p className="text-white mb-4">
              Are you sure you want to delete this request?
            </p>
            
            {requestToDelete && (
              <div className="space-y-2">
                <div>
                  <strong>Profile:</strong> {requestToDelete.band_name || "N/A"}
                </div>
                <div>
                  <strong>Start:</strong> {formatDateTime(requestToDelete.slot_start)}
                </div>
                <div>
                  <strong>End:</strong> {formatDateTime(requestToDelete.slot_end)}
                </div>
                {requestToDelete.reason && (
                  <div>
                    <strong>Reason:</strong> {requestToDelete.reason}
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              color="danger" 
              onPress={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Conflict Error Modal */}
      <Modal isOpen={isConflictModalOpen} onClose={() => setIsConflictModalOpen(false)}>
        <ModalContent>
          <ModalHeader className="text-danger">Time Slot Conflict</ModalHeader>
          <ModalBody>
            <p className="text-white">This slot has already been approved for {conflictBandName}.</p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onPress={() => setIsConflictModalOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isFilterModalOpen} onOpenChange={setFilterModalOpen}>
        <ModalContent>
          <ModalHeader>Filter Requests</ModalHeader>
          <ModalBody>
            {/* Status Filter Dropdown */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ marginRight: "1rem" }}>Status:</label>
              <Dropdown>
                <DropdownTrigger>
                  <Button className="capitalize" variant="bordered">
                    {statusFilter === "all" ? "All" : statusFilter}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  disallowEmptySelection
                  aria-label="Status filter"
                  closeOnSelect={true}
                  selectedKeys={new Set([statusFilter])}
                  selectionMode="single"
                  variant="flat"
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setStatusFilter(selected);
                  }}
              >
                  <DropdownItem key="all">All</DropdownItem>
                  <DropdownItem key="pending" className="bg-warning-100">
                    Pending
                  </DropdownItem>
                  <DropdownItem key="approved" className="bg-success-100">
                    Approved
                  </DropdownItem>
                  <DropdownItem key="denied" className="bg-danger-100">
                    Denied
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>

            {/* Date Filter Input with Calendar Icon */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ marginRight: "1rem" }}>Request Date:</label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="dd/mm/yyyy"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                  }}
                  onBlur={() => {
                    // Validate the input when the field loses focus
                    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
                    if (regex.test(inputValue)) {
                      const [day, month, year] = inputValue.split("/");
                      const isoDate = new Date(`${year}-${month}-${day}`).toISOString();
                      setDateFilter(isoDate);
                    } else {
                      // If the input is invalid, reset to the last valid date or empty
                      setInputValue(dateFilter ? new Date(dateFilter).toLocaleDateString("en-GB") : "");
                    }
                  }}
                  onKeyPress={(e) => {
                    // Validate the input when the user presses Enter
                    if (e.key === "Enter") {
                      const regex = /^\d{2}\/\d{2}\/\d{4}$/;
                      if (regex.test(inputValue)) {
                        const [day, month, year] = inputValue.split("/");
                        const isoDate = new Date(`${year}-${month}-${day}`).toISOString();
                        setDateFilter(isoDate);
                      } else {
                        setInputValue(dateFilter ? new Date(dateFilter).toLocaleDateString("en-GB") : "");
                      }
                    }
                  }}
                />
                <Button
                  isIconOnly
                  onPress={() => setCalendarOpen(true)}
                  className="bg-transparent"
                >
                  <FaCalendarAlt className="text-lg text-default-400" />
                </Button>
              </div>
              {isCalendarOpen && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
                <Calendar
                  aria-label="Date Picker"
                  defaultValue={dateFilter ? parseDate(dateFilter) : (today(getLocalTimeZone()) as any)}
                  onChange={(e) => {
                      const selectedDate = e.toString();
                      setDateFilter(selectedDate);
                      setInputValue(new Date(selectedDate).toLocaleDateString("en-GB"));
                      setCalendarOpen(false);
                    }}
                />
                </div>
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