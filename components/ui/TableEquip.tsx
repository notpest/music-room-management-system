"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { FaCalendarAlt, FaInfoCircle, FaGuitar, FaKeyboard, FaMicrophone } from "react-icons/fa";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { motion } from "framer-motion";
import Modal from "./Modal";

type EquipmentType = {
  id: number;
  name: string;
  category: string;
  availability: string;
  returnDate: string;
};

const equipmentIcons: { [key: string]: JSX.Element } = {
  guitar: <FaGuitar className="text-purple-400" />,
  keyboard: <FaKeyboard className="text-purple-400" />,
  mic: <FaMicrophone className="text-purple-400" />,
};

const statusColorMap: { [key: string]: string } = {
  Available: "bg-green-500/20 text-green-300",
  Booked: "bg-red-500/20 text-red-300",
};

const TableEquip = () => {
  const [equipment, setEquipment] = useState<EquipmentType[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [modalTitle, setModalTitle] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [isTableScrolled, setIsTableScrolled] = useState(false);

  const handleTableScroll = useCallback(() => {
    const el = tableScrollRef.current;
    if (el) {
      setIsTableScrolled(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    }
  }, []);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        // This is a placeholder. Replace with your actual API endpoint.
        // const response = await axios.get("/api/equipment");
        // setEquipment(response.data);
        setEquipment([ // Mock data
            { id: 1, name: "Guitar", category: "guitar", availability: "Available", returnDate: "N/A" },
            { id: 2, name: "Keyboard", category: "keyboard", availability: "Booked", returnDate: "2026-07-15" },
            { id: 3, name: "Microphone", category: "mic", availability: "Available", returnDate: "N/A" },
        ]);
      } catch (error) {
        console.error(error);
      }
    };
    fetchEquipment();
  }, []);

  const openBookingModal = (item: EquipmentType) => {
    setSelectedEquipment(item);
    setModalTitle(`Book ${item.name}`);
    setModalContent(
        <DateRangePicker 
            onStartDateChange={setStartDate} 
            onEndDateChange={setEndDate} 
            disabledDays={item.availability === 'Booked' ? { before: new Date(item.returnDate) } : { before: new Date() }}
        />
    );
    setModalOpen(true);
  };
  
  const openDetailsModal = (item: EquipmentType) => {
    setSelectedEquipment(item);
    setModalTitle(`Details for ${item.name}`);
    setModalContent(
        <div className="text-gray-300 space-y-2">
            <p><strong>Name:</strong> {item.name}</p>
            <p><strong>Category:</strong> {item.category}</p>
            <p><strong>Availability:</strong> <span className={`px-2 py-1 text-xs rounded-full ${statusColorMap[item.availability]}`}>{item.availability}</span></p>
            <p><strong>Return Date:</strong> {item.returnDate}</p>
        </div>
    );
    setModalOpen(true);
  }

  const handleBookingConfirm = () => {
      if(selectedEquipment && startDate && endDate) {
          setModalTitle("Confirm Booking");
          setModalContent(
              <div>
                  <p>Book {selectedEquipment.name} from {format(startDate, "PPP")} to {format(endDate, "PPP")}?</p>
                  <div className="flex justify-end gap-3 mt-4">
                    <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-sm font-mono text-gray-300 hover:bg-white/20 transition-all">Cancel</button>
                    <button onClick={() => { /* Booking logic here */ setModalOpen(false);}} className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-sm font-mono font-bold border border-purple-400/20 hover:from-purple-700 hover:to-purple-600 transition-all shadow-lg shadow-purple-500/25">Confirm</button>
                  </div>
              </div>
          );
          setModalOpen(true);
      }
  }

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
              <th className="p-2 sm:p-4 text-xs font-bold uppercase tracking-wider text-gray-400">Instrument</th>
              <th className="p-2 sm:p-4 text-xs font-bold uppercase tracking-wider text-gray-400">Category</th>
              <th className="p-2 sm:p-4 text-xs font-bold uppercase tracking-wider text-gray-400">Availability</th>
              <th className="p-2 sm:p-4 text-xs font-bold uppercase tracking-wider text-gray-400">Return Date</th>
              <th className="p-2 sm:p-4 text-xs font-bold uppercase tracking-wider text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
                className="border-b border-white/10 hover:bg-white/[0.03] transition-colors"
              >
                <td className="p-2 sm:p-3 font-mono text-sm text-gray-300">{item.name}</td>
                <td className="p-2 sm:p-3 text-lg">{equipmentIcons[item.category.toLowerCase()] || item.category}</td>
                <td className="p-2 sm:p-3"><span className={`px-2 py-1 text-xs rounded-full ${statusColorMap[item.availability]}`}>{item.availability}</span></td>
                <td className="p-2 sm:p-3 font-mono text-sm text-gray-400">{item.returnDate}</td>
                <td className="p-2 sm:p-3">
                  <div className="flex gap-2">
                    <button onClick={() => openBookingModal(item)} disabled={item.availability === 'Booked'} className="p-2 rounded-lg hover:bg-white/10 transition-all text-purple-400 disabled:opacity-50"><FaCalendarAlt className="text-sm" /></button>
                    <button onClick={() => openDetailsModal(item)} className="p-2 rounded-lg hover:bg-white/10 transition-all text-gray-400"><FaInfoCircle className="text-sm" /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        </div>
        {isTableScrolled && (
          <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-black-100/80 via-black-100/40 to-transparent pointer-events-none rounded-r-2xl" />
        )}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={modalTitle}>
          {modalContent}
          {modalTitle.startsWith("Book") && (
              <div className="flex justify-end pt-4">
                  <button onClick={handleBookingConfirm} className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl text-sm font-mono font-bold border border-purple-400/20 hover:from-purple-700 hover:to-purple-600 transition-all shadow-lg shadow-purple-500/25">Book</button>
              </div>
          )}
      </Modal>
    </div>
  );
};

const DateRangePicker = ({ onStartDateChange, onEndDateChange, disabledDays }: any) => {
    const [range, setRange] = useState<{from: Date|undefined, to: Date|undefined}>({from: undefined, to: undefined});

    useEffect(() => {
        onStartDateChange(range.from);
        onEndDateChange(range.to);
    }, [range, onStartDateChange, onEndDateChange]);

    return (
        <DayPicker
            mode="range"
            selected={range}
            onSelect={setRange as any}
            disabled={disabledDays}
        />
    )
}

export default TableEquip;
