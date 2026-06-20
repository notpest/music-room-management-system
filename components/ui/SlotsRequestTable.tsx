"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaFilter, FaCalendarAlt, FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import Modal from "./Modal";

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
  room_id: string;
};

const statusColorMap = {
  approved: "bg-green-500/20 text-green-300",
  denied: "bg-red-500/20 text-red-300",
  pending: "bg-yellow-500/20 text-yellow-300",
};

interface SlotsRequestsTableProps {
  isAdmin: boolean;
  userId: string;
}

export default function SlotsRequestTable({ isAdmin, userId }: SlotsRequestsTableProps) {
  const [requests, setRequests] = useState<RequestType[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RequestType[]>([]);
  const [rooms, setRooms] = useState<{ id: string; number: string }[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [modalTitle, setModalTitle] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  useEffect(() => {
    const fetchRoomsAndRequests = async () => {
      try {
        const roomsRes = await axios.get("/api/rooms");
        setRooms(roomsRes.data);
        if (roomsRes.data.length > 0) {
          setSelectedRoom(roomsRes.data[0].id);
        }
      } catch (error) {
        console.error("Error fetching rooms", error);
      }
    };
    fetchRoomsAndRequests();
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!selectedRoom) return;
      try {
        const params: any = { room_id: selectedRoom };
        if (!isAdmin) params.user_id = userId;
        const res = await axios.get("/api/requests", { params });
        setRequests(res.data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };
    fetchRequests();
  }, [selectedRoom, isAdmin, userId]);

  useEffect(() => {
    let tempRequests = requests.filter((req) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (req.user_name || "").toLowerCase().includes(q) ||
        (req.band_name || "").toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || req.status === statusFilter;
      const matchesDate = !dateFilter || format(new Date(req.request_date), "yyyy-MM-dd") === format(dateFilter, "yyyy-MM-dd");

      return matchesSearch && matchesStatus && matchesDate;
    });
    setFilteredRequests(tempRequests);
  }, [searchQuery, statusFilter, dateFilter, requests]);
  
  const paginatedRequests = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const handleAction = async (id: string, newStatus: "approved" | "denied" | "delete") => {
    try {
      if (newStatus === 'delete') {
          await axios.delete(`/api/requests?id=${id}`);
      } else {
        await axios.put(`/api/requests?id=${id}`, { status: newStatus });
      }
      setRequests(requests.map(r => r.id === id && newStatus !== 'delete' ? {...r, status: newStatus} : r).filter(r => r.id !== id || newStatus !== 'delete'));
    } catch (error: any) {
        setModalTitle("Action Failed");
        setModalContent(<p>{error.response?.data?.message || "An error occurred."}</p>)
        setModalOpen(true);
    }
  };

  const openEditModal = (req: RequestType) => {
    setModalTitle("Edit Request");
    setModalContent(<EditRequestForm request={req} rooms={rooms} onSave={() => {
        setModalOpen(false);
        // re-fetch requests
    }}/>);
    setModalOpen(true);
  };
  
  return (
    <div className="bg-gray-900/50 p-4 rounded-lg text-white w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <div className="flex gap-4">
            <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} className="bg-gray-800 border-gray-700 rounded-md px-4 py-2">
                {rooms.map(r => <option key={r.id} value={r.id}>Room {r.number}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-gray-800 border-gray-700 rounded-md px-4 py-2">
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
            </select>
        </div>
        <div className="flex items-center gap-2">
            <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-gray-800 border-gray-700 rounded-md px-4 py-2"/>
            <button onClick={() => {
                setModalTitle("Select Date");
                setModalContent(<DayPicker mode="single" selected={dateFilter} onSelect={setDateFilter}/>);
                setModalOpen(true);
            }} className="p-2 bg-gray-800 rounded-md hover:bg-gray-700"><FaCalendarAlt/></button>
            {dateFilter && <button onClick={() => setDateFilter(undefined)} className="p-2 bg-red-800 rounded-md hover:bg-red-700"><FaTimes/></button>}
        </div>
      </div>
      {/* Table */}
      <div className="overflow-auto flex-grow">
        <table className="w-full text-left">
            <thead className="border-b border-gray-700">
                <tr>
                    {isAdmin && <th className="p-2">User</th>}
                    <th className="p-2">Profile</th>
                    <th className="p-2">Slot</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                {paginatedRequests.map(req => (
                    <tr key={req.id} className="border-b border-gray-800 hover:bg-gray-800/60">
                        {isAdmin && <td className="p-2">{req.user_name}</td>}
                        <td className="p-2">{req.band_name}</td>
                        <td className="p-2 font-mono">{format(new Date(req.slot_start), "MMM d, h:mm a")}</td>
                        <td className="p-2"><span className={`px-2 py-1 text-xs rounded-full ${statusColorMap[req.status]}`}>{req.status}</span></td>
                        <td className="p-2">
                            <div className="flex gap-2">
                                {isAdmin && req.status === 'pending' && <button onClick={() => handleAction(req.id, 'approved')} className="text-green-400"><FaCheck/></button>}
                                {isAdmin && req.status === 'pending' && <button onClick={() => handleAction(req.id, 'denied')} className="text-red-400"><FaTimes/></button>}
                                {isAdmin && <button onClick={() => openEditModal(req)} className="text-blue-400"><FaEdit/></button>}
                                <button onClick={() => handleAction(req.id, 'delete')} className="text-gray-400"><FaTrash/></button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-center mt-4">
        {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => setCurrentPage(page)} className={`px-4 py-2 mx-1 rounded-md ${currentPage === page ? 'bg-purple-600' : 'bg-gray-800'}`}>{page}</button>
        ))}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={modalTitle}>
        {modalContent}
      </Modal>
    </div>
  );
}

const EditRequestForm = ({ request, rooms, onSave }: { request: RequestType, rooms: {id: string, number: string}[], onSave: () => void }) => {
    const [formState, setFormState] = useState(request);

    const handleSave = async () => {
        try {
            await axios.put(`/api/requests?id=${formState.id}`, formState);
            onSave();
        } catch (error) {
            console.error("Failed to save", error);
        }
    }

    return (
        <div className="space-y-4 text-white">
            <select value={formState.status} onChange={e => setFormState({...formState, status: e.target.value as any})} className="w-full bg-gray-800 border-gray-700 rounded-md px-4 py-2">
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
            </select>
            <select value={formState.room_id} onChange={e => setFormState({...formState, room_id: e.target.value})} className="w-full bg-gray-800 border-gray-700 rounded-md px-4 py-2">
                {rooms.map(r => <option key={r.id} value={r.id}>Room {r.number}</option>)}
            </select>
            <input type="datetime-local" value={format(new Date(formState.slot_start), "yyyy-MM-dd'T'HH:mm")} onChange={e => setFormState({...formState, slot_start: new Date(e.target.value).toISOString()})} className="w-full bg-gray-800 border-gray-700 rounded-md px-4 py-2"/>
            <textarea value={formState.reason || ""} onChange={e => setFormState({...formState, reason: e.target.value})} className="w-full bg-gray-800 border-gray-700 rounded-md px-4 py-2"/>
            <button onClick={handleSave} className="px-6 py-2 bg-purple-600 rounded-md">Save</button>
        </div>
    )
}