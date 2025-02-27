"use client";

import React, { useEffect, useState, ChangeEvent } from 'react';
import axios from 'axios';
import dynamic from "next/dynamic";
import {
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableColumn,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
} from '@nextui-org/react';
import SlotTable from '@/components/ui/SlotTable';

// Import Navbar dynamically with no SSR
const Navbar = dynamic(() => import("@/components/Navbar"), {
  ssr: false,
  loading: () => (
    <div className="h-[64px] w-full bg-background/60 backdrop-blur-lg" />
  ),
});

interface SlotConfig {
  id: number;
  start_time: string;
  end_time: string;
  enabled: boolean;
}

interface Band {
  id: number;
  name: string;
  color: string;
}

export default function AdminDashboard() {
  const [configs, setConfigs] = useState<SlotConfig[]>([]);
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newEnabled, setNewEnabled] = useState(true);
  const [students, setStudents] = useState([]);
  const [newStudentRegNo, setNewStudentRegNo] = useState("");
  const [newStudentPassword, setNewStudentPassword] = useState("");
  const [bands, setBands] = useState<Band[]>([]);
  const [newBandName, setNewBandName] = useState("");
  const [newBandColor, setNewBandColor] = useState("#000000");
  const [isStudentModalOpen, setStudentModalOpen] = useState(false);
  const [isBandModalOpen, setBandModalOpen] = useState(false);

  const fetchConfigs = async () => {
    try {
      const res = await axios.get("/api/slotconfig");
      setConfigs(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBands = async () => {
    try {
      const res = await axios.get("/api/bands");
      setBands(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchConfigs();
    fetchBands();
  }, []);

  const addConfig = async () => {
    try {
      await axios.post("/api/slotconfig", {
        start_time: newStart,
        end_time: newEnd,
        enabled: newEnabled,
      });
      setNewStart("");
      setNewEnd("");
      fetchConfigs();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleEnabled = async (id: number, current: boolean) => {
    try {
      await axios.put("/api/slotconfig", {
        id,
        enabled: !current,
      });
      fetchConfigs();
    } catch (error) {
      console.error(error);
    }
  };

  const addStudent = async () => {
    try {
      await axios.post("/api/students", {
        registration_number: newStudentRegNo,
        password: newStudentPassword,
      });
      setNewStudentRegNo("");
      setNewStudentPassword("");
      setStudentModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const addBand = async () => {
    try {
      await axios.post("/api/bands", {
        name: newBandName,
        color: newBandColor,
      });
      setNewBandName("");
      setNewBandColor("#000000");
      setBandModalOpen(false);
      fetchBands();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-black-100">
      <Navbar aria-label="Main Navigation" />
      <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden mx-auto sm:px-10">
        <div className="w-full p-8">
          <h1 className="text-2xl font-bold text-white mb-4">Admin Dashboard</h1>
          
          {/* Slot Configuration */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Slot Configuration</h2>
            <div className="flex flex-col sm:flex-row items-center mb-4 space-y-4 sm:space-y-0 sm:space-x-4">
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
              <Button onPress={addConfig} className="bg-blue-500 text-white">
                Add Slot
              </Button>
            </div>

            <Table
              aria-label="Slot Configuration Table"
              className="border border-gray-300 rounded-lg shadow-md text-center bg-[#0d1a33] text-white"
            >
              <TableHeader>
                <TableColumn>ID</TableColumn>
                <TableColumn>Start Time</TableColumn>
                <TableColumn>End Time</TableColumn>
                <TableColumn>Enabled</TableColumn>
                <TableColumn>Actions</TableColumn>
              </TableHeader>
              <TableBody>
                {configs.map((config) => (
                  <TableRow key={config.id} style={{ height: "50px" }}>
                    <TableCell>{config.id}</TableCell>
                    <TableCell>{config.start_time}</TableCell>
                    <TableCell>{config.end_time}</TableCell>
                    <TableCell>{config.enabled ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <Button onPress={() => toggleEnabled(config.id, config.enabled)} className="bg-red-500 text-white">
                        Toggle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Add Student */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Add New Student</h2>
            <Button onPress={() => setStudentModalOpen(true)} className="bg-green-500 text-white">
              Add Student
            </Button>
          </div>

          {/* Add Band */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Register New Band</h2>
            <Button onPress={() => setBandModalOpen(true)} className="bg-purple-500 text-white">
              Register Band
            </Button>
          </div>

          {/* Slot Table */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Slot Table</h2>
            <SlotTable />
          </div>
        </div>
      </main>

      {/* Add Student Modal */}
      <Modal isOpen={isStudentModalOpen} onOpenChange={setStudentModalOpen}>
        <ModalContent>
          <ModalHeader>Add New Student</ModalHeader>
          <ModalBody>
            <Input
              placeholder="Registration Number"
              value={newStudentRegNo}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewStudentRegNo(e.target.value)}
              fullWidth
            />
            <Input
              placeholder="Password"
              type="password"
              value={newStudentPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewStudentPassword(e.target.value)}
              fullWidth
            />
          </ModalBody>
          <ModalFooter>
            <Button onPress={addStudent} className="bg-green-500 text-white">
              Add Student
            </Button>
            <Button onPress={() => setStudentModalOpen(false)} className="bg-red-500 text-white">
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Band Modal */}
      <Modal isOpen={isBandModalOpen} onOpenChange={setBandModalOpen}>
        <ModalContent>
          <ModalHeader>Register New Band</ModalHeader>
          <ModalBody>
            <Input
              placeholder="Band Name"
              value={newBandName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewBandName(e.target.value)}
              fullWidth
            />
            <Input
              type="color"
              label="Band Color"
              value={newBandColor}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewBandColor(e.target.value)}
              fullWidth
            />
          </ModalBody>
          <ModalFooter>
            <Button onPress={addBand} className="bg-purple-500 text-white">
              Register Band
            </Button>
            <Button onPress={() => setBandModalOpen(false)} className="bg-red-500 text-white">
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
