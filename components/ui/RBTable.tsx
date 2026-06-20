"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { FaCalendarAlt, FaChevronDown, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import Modal from "./Modal";

// Interfaces (keep them as they are)
interface Slot {
  id: number;
  slot_start: Date;
  slot_end: Date;
  status: string;
  band_id?: string;
  band_name?: string;
}
interface Bookings { [key: string]: string; }
interface Day { key: string; display: string; }
interface TimeSlot { key: string; display: string; end: string; }
interface SlotConfig { id: string; start_time: string; end_time: string; enabled: boolean; }
export type RequestType = { id: string; user_id: string; status: "approved" | "denied" | "pending"; slot_start: string; slot_end: string; request_date: string; response_date: string | null; user_name?: string; band_name?: string; };

// Utility functions
const formatDayKey = (date: Date): string => format(date, "yyyy-MM-dd");
const getMonday = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const RBTable = () => {
  const { data: session } = useSession();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Bookings>({});
  const [days, setDays] = useState<Day[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
  const [roomMapping, setRoomMapping] = useState<{ [key: number]: string }>({});
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<number>(365);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  const [modalTitle, setModalTitle] = useState("");
  const [bands, setBands] = useState<Array<{ id: string; name: string; colour: string }>>([]);
  const [bandColors, setBandColors] = useState<{ [key: string]: string }>({});
  const isAdmin = session?.user?.role === "admin";

  // New simplified state
  const [selectedCell, setSelectedCell] = useState<{ day: string, time: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState("");
  const [selectedBandId, setSelectedBandId] = useState<string>("");
  
  useEffect(() => {
    // Fetch initial data
    const fetchInitialData = async () => {
      try {
        const [roomsRes, bandsRes, slotConfigsRes] = await Promise.all([
          axios.get("/api/rooms"),
          axios.get("/api/bands"),
          axios.get("/api/slotconfig"),
        ]);

        const mapping: { [key: number]: string } = {};
        roomsRes.data.forEach((room: { id: string; number: number }) => {
          mapping[room.number] = room.id;
        });
        setRoomMapping(mapping);

        const allBands = bandsRes.data as Array<{ id: string; name: string; colour: string }>;
        setBands(allBands);
        const coloursMap: { [key: string]: string } = {};
        allBands.forEach((b) => { coloursMap[b.id] = b.colour; });
        setBandColors(coloursMap);
        
        if (session?.user && !isAdmin) {
            setSelectedBandId((session.user as any).band_id || "");
        }

        const configs: SlotConfig[] = slotConfigsRes.data
          .filter((config: SlotConfig) => config.enabled)
          .sort((a: SlotConfig, b: SlotConfig) => a.start_time.localeCompare(b.start_time));
        
        const formattedConfigs: TimeSlot[] = configs.map((config) => {
          const startDate = new Date(`1970-01-01T${config.start_time}`);
          const endDate = new Date(`1970-01-01T${config.end_time}`);
          return {
            key: config.start_time.substring(0, 5),
            display: startDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hourCycle: "h12" }),
            end: endDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hourCycle: "h12" }),
          };
        });
        setTimeSlots(formattedConfigs);

      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchInitialData();
  }, [session, isAdmin]);

  useEffect(() => {
    // Fetch slots when week or room changes
    const fetchSlots = async () => {
      if (Object.keys(roomMapping).length === 0) return;

      const rangeStart = new Date(currentWeekStart);
      const rangeEnd = new Date(rangeStart);
      rangeEnd.setDate(rangeEnd.getDate() + 7);

      try {
        const response = await axios.get("/api/slots", {
          params: {
            start: rangeStart.toISOString(),
            end: rangeEnd.toISOString(),
            roomNumber: selectedRoomNumber,
          },
        });
        setSlots(response.data);
      } catch (error) {
        console.error("Error fetching slots:", error);
      }
    };
    fetchSlots();
  }, [currentWeekStart, selectedRoomNumber, roomMapping]);

  useEffect(() => {
    // Rebuild UI when data changes
    const weekDays = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      return {
        key: formatDayKey(d),
        display: `${format(d, "EEEE")} - ${format(d, "dd/MM/yyyy")}`,
      };
    });
    setDays(weekDays);

    const newBookings: Bookings = {};
    weekDays.forEach(day => {
        timeSlots.forEach(time => {
            const key = `${day.key}-${time.key}`;
            newBookings[key] = "available";
        });
    });

    slots.forEach(slot => {
        const slotStart = new Date(slot.slot_start);
        const dayKey = formatDayKey(slotStart);
        const timeKey = format(slotStart, "HH:mm");
        const bookingKey = `${dayKey}-${timeKey}`;
        if(newBookings[bookingKey]) {
            newBookings[bookingKey] = slot.status;
        }
    });
    setBookings(newBookings);
  }, [slots, currentWeekStart, timeSlots]);


  const handleCellClick = (dayKey: string, timeKey: string) => {
    if (!session) {
        setModalTitle("Login Required");
        setModalContent(<p>You must be logged in to book a slot.</p>);
        setModalOpen(true);
        return;
    }

    const bookingStatus = bookings[`${dayKey}-${timeKey}`];
    if (bookingStatus === 'booked') {
        setModalTitle("Slot Unavailable");
        setModalContent(<p>This slot is already booked.</p>);
        setModalOpen(true);
        return;
    }

    setSelectedCell({ day: dayKey, time: timeKey });
    setModalTitle("Request Slot");
    setModalOpen(true);
  };

  const handleBookingConfirm = async () => {
    if (!selectedCell || !selectedBandId || isSubmitting) return;

    setIsSubmitting(true);
    const { day, time } = selectedCell;
    const slotStart = new Date(`${day}T${time}`);
    const slotEnd = new Date(slotStart.getTime() + 90 * 60 * 1000); // Assuming 90-min slots

    try {
        await axios.post("/api/requests", {
            user_id: session?.user?.id,
            status: "pending",
            slot_start: slotStart.toISOString(),
            slot_end: slotEnd.toISOString(),
            band_id: selectedBandId,
            room_id: roomMapping[selectedRoomNumber],
            reason,
        });
        setModalTitle("Request Submitted");
        setModalContent(<p>Your request has been submitted for approval.</p>);
    } catch (error: any) {
        setModalTitle("Error");
        setModalContent(<p>{error.response?.data?.message || "An unexpected error occurred."}</p>);
    } finally {
        setIsSubmitting(false);
        // No need to close modal here, it shows the status.
    }
  };

  // Render logic
  return (
    <div className="bg-gray-900/50 p-4 rounded-lg text-white w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        {/* Room Selector */}
        <select value={selectedRoomNumber} onChange={e => setSelectedRoomNumber(Number(e.target.value))} className="bg-gray-800 border border-gray-700 rounded-md px-4 py-2">
            {Object.keys(roomMapping).map(num => <option key={num} value={num}>Room {num}</option>)}
        </select>
        {/* Week Navigation */}
        <div className="flex items-center gap-2">
            <button onClick={() => setCurrentWeekStart(getMonday(new Date()))} className="px-4 py-2 bg-gray-800 rounded-md hover:bg-gray-700">Today</button>
            <button onClick={() => setModalOpen(true)}><FaCalendarAlt /></button>
            <button onClick={() => setCurrentWeekStart(d => new Date(d.setDate(d.getDate() - 7)))}><FaChevronLeft /></button>
            <button onClick={() => setCurrentWeekStart(d => new Date(d.setDate(d.getDate() + 7)))}><FaChevronRight /></button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-grow">
        <table className="w-full text-center border-collapse">
            <thead>
                <tr className="bg-gray-800">
                    <th className="p-2 border border-gray-700">Time</th>
                    {days.map(day => <th key={day.key} className="p-2 border border-gray-700">{day.display}</th>)}
                </tr>
            </thead>
            <tbody>
                {timeSlots.map(time => (
                    <tr key={time.key}>
                        <td className="p-2 border border-gray-700 font-mono">{time.display}</td>
                        {days.map(day => {
                            const bookingStatus = bookings[`${day.key}-${time.key}`];
                            const apiSlot = slots.find(s => {
                                const slotStart = new Date(s.slot_start);
                                return formatDayKey(slotStart) === day.key && format(slotStart, "HH:mm") === time.key;
                            });

                            let cellStyle = "cursor-pointer hover:bg-purple-900/50";
                            let cellContent = "Available";
                            if (bookingStatus === 'booked' && apiSlot) {
                                cellStyle = `bg-[${bandColors[apiSlot.band_id!] || '#4A5568'}] text-white font-bold`;
                                cellContent = apiSlot.band_name || "Booked";
                            }
                            
                            return (
                                <td key={`${day.key}-${time.key}`} onClick={() => handleCellClick(day.key, time.key)} className={`p-2 border border-gray-700 transition-colors ${cellStyle}`}>
                                    {cellContent}
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={modalTitle}>
            { selectedCell && modalTitle === "Request Slot" ? (
                <div className="space-y-4">
                    {isAdmin && (
                        <select value={selectedBandId} onChange={e => setSelectedBandId(e.target.value)} className="w-full bg-gray-800 border-gray-700 rounded-md px-4 py-2">
                            <option value="" disabled>Select a Profile</option>
                            {bands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    )}
                    <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for booking (optional)" className="w-full bg-gray-800 border-gray-700 rounded-md px-4 py-2 h-24"/>
                    <div className="flex justify-end">
                        <button onClick={handleBookingConfirm} disabled={isSubmitting || !selectedBandId} className="px-6 py-2 bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-gray-600">
                            {isSubmitting ? "Submitting..." : "Submit Request"}
                        </button>
                    </div>
                </div>
            ) : modalTitle === "Select Week" ? (
                <DayPicker
                    mode="single"
                    selected={currentWeekStart}
                    onSelect={(date) => {
                        if(date) setCurrentWeekStart(getMonday(date));
                        setModalOpen(false);
                    }}
                />
            ) : (
                modalContent
            )}
      </Modal>
    </div>
  );
};

export default RBTable;