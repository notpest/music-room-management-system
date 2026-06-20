"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCalendarAlt, FaInfoCircle, FaGuitar, FaKeyboard, FaMicrophone } from "react-icons/fa";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
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
                  <div className="flex justify-end gap-4 mt-4">
                    <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-md bg-gray-700">Cancel</button>
                    <button onClick={() => { /* Booking logic here */ setModalOpen(false);}} className="px-4 py-2 rounded-md bg-purple-600">Confirm</button>
                  </div>
              </div>
          );
          setModalOpen(true);
      }
  }

  return (
    <div className="bg-gray-900/50 p-4 rounded-lg text-white w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-700">
            <tr>
              <th className="p-4">Instrument</th>
              <th className="p-4">Category</th>
              <th className="p-4">Availability</th>
              <th className="p-4">Return Date</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((item) => (
              <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/60">
                <td className="p-4">{item.name}</td>
                <td className="p-4 text-xl">{equipmentIcons[item.category.toLowerCase()] || item.category}</td>
                <td className="p-4"><span className={`px-2 py-1 text-xs rounded-full ${statusColorMap[item.availability]}`}>{item.availability}</span></td>
                <td className="p-4">{item.returnDate}</td>
                <td className="p-4">
                  <div className="flex gap-4">
                    <button onClick={() => openBookingModal(item)} disabled={item.availability === 'Booked'} className="disabled:opacity-50"><FaCalendarAlt /></button>
                    <button onClick={() => openDetailsModal(item)}><FaInfoCircle /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={modalTitle}>
          {modalContent}
          {modalTitle.startsWith("Book") && (
              <div className="flex justify-end pt-4">
                  <button onClick={handleBookingConfirm} className="px-6 py-2 bg-purple-600 rounded-md">Book</button>
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
