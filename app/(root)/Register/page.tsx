// app/register/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import { SketchPicker } from "react-color";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import Select, { SelectChangeEvent } from '@mui/material/Select';

// Import Navbar dynamically with no SSR
const Navbar = dynamic(() => import("@/components/Navbar"), {
  ssr: false,
  loading: () => (
    <div className="h-[64px] w-full bg-background/60 backdrop-blur-lg" />
  ),
});

const RegisterPage = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [bandId, setBandId] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [bandColor, setBandColor] = useState("#000000");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isBandModalOpen, setBandModalOpen] = useState(false);

  const [bands, setBands] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetch("/api/bands")
      .then((res) => res.json())
      .then((data) => {
        // Expect data = [ { id, name, colour }, … ]
        // We only need id & name for the dropdown
        setBands((data as Array<{ id: string; name: string }>));
      })
      .catch((err) => {
        console.error("Error fetching bands:", err);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, password, bandId, email, role, bandColor }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.message || "Something went wrong");
    } else {
      setSuccess(true);
      router.push("/");
    }
  };

  const handleBandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
  
    const res = await fetch("/api/bands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: bandId, colour: bandColor }),
    });
  
    const data = await res.json();
    if (!res.ok) {
      setError(data.message || "Something went wrong");
    } else {
      setSuccess(true);
      setBandModalOpen(false);
    }
  };
  
  return (
    <motion.div 
      className="bg-black-100 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar aria-label="Main Navigation" />
      <div className="max-w-lg mx-auto mt-10 p-6 bg-black-100 rounded-lg shadow-md text-white">
        <div className="flex flex-col space-y-4">
          <Button 
            onPress={() => setUserModalOpen(true)} 
            className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Register User
          </Button>
          <Button 
            onPress={() => setBandModalOpen(true)} 
            className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Register Band
          </Button>
        </div>
      </div>
      {/* User Registration Modal */}
      <Modal isOpen={isUserModalOpen} onOpenChange={setUserModalOpen}>
        <ModalContent>
          <ModalHeader>Register User</ModalHeader>
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-white">Name:</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-white">Username:</label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-white">Password:</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-white">Email:</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2"
                />
              </div>

              {/* Band Dropdown */}
              <div className="mb-4">
                <FormControl fullWidth>
                  <InputLabel id="band-label" className="text-white">
                    Select Band
                  </InputLabel>
                  <Select
                    labelId="band-label"
                    id="band-select"
                    value={bandId}
                    label="Band"
                    onChange={(e) => {
                      setBandId(e.target.value as string);
                    }}
                    sx={{
                      backgroundColor: "#1e293b",
                      color: "white",
                      "& .MuiSvgIcon-root": { color: "white" },
                    }}
                    MenuProps={{ disablePortal: true }}
                  >
                    {bands.map((b) => (
                      <MenuItem key={b.id} value={b.id}>
                        {b.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              <ModalFooter>
                <Button 
                  color="primary" 
                  type="submit" 
                  className="bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Register
                </Button>
                <Button 
                  color="secondary" 
                  onPress={() => setUserModalOpen(false)} 
                  className="bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Close
                </Button>
              </ModalFooter>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
      {/* Band Registration Modal */}
      <Modal isOpen={isBandModalOpen} onOpenChange={setBandModalOpen}>
      <ModalContent>
        <ModalHeader>Register Band</ModalHeader>
          <ModalBody>
            <form onSubmit={handleBandSubmit}>
              <div className="mb-4">
                <label className="block text-white">Band Name:</label>
                <Input
                  type="text"
                  value={bandId}
                  onChange={(e) => setBandId(e.target.value)}
                  required
                  className="w-full px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-white">Band Color:</label>
                <div className="flex items-center gap-2">
                  {/* Color Preview Square */}
                  <div
                    style={{ backgroundColor: bandColor }}
                    className="w-8 h-8 rounded-md border border-gray-400"
                  ></div>
                  {/* Hex Code Input */}
                  <Input
                    type="text"
                    value={bandColor}
                    onChange={(e) => setBandColor(e.target.value)}
                    placeholder="#FFFFFF"
                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" // Validate hex code
                  required
                    className="w-full px-3 py-2"
                  />
                  {/* Color Picker Icon with Popover */}
                  <Popover placement="bottom">
                    <PopoverTrigger>
                      <button
                        type="button"
                        className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition duration-300 ease-in-out"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          className="w-6 h-6 text-white"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                          />
                        </svg>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <SketchPicker
                        color={bandColor}
                        onChangeComplete={(color) => setBandColor(color.hex)}
                />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <ModalFooter>
                <Button
                  color="primary"
                  type="submit"
                  className="bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105"
                >
                Register
                </Button>
                <Button
                  color="secondary"
                  onPress={() => setBandModalOpen(false)}
                  className="bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Close
                </Button>
              </ModalFooter>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </motion.div>
  );
};

export default RegisterPage;
