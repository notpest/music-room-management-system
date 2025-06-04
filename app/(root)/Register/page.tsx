"use client"
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Chip,
  Tooltip,
} from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@nextui-org/react";
import { SketchPicker } from "react-color";

// Import Navbar dynamically with no SSR
const Navbar = dynamic(() => import("@/components/Navbar"), {
  ssr: false,
  loading: () => (
    <div className="h-[64px] w-full bg-background/60 backdrop-blur-lg" />
  ),
});

interface User {
  id: number;
  name: string;
  role: string;
  team: string;
  status: string;
  age: string;
  avatar: string;
  email: string;
}

interface Band {
  id: string;
  name: string;
}

const users: User[] = [
  {
    id: 1,
    name: "Tony Reichert",
    role: "CEO",
    team: "Management",
    status: "active",
    age: "29",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    email: "tony.reichert@example.com",
  },
  {
    id: 2,
    name: "Zoey Lang",
    role: "Technical Lead",
    team: "Development",
    status: "paused",
    age: "25",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    email: "zoey.lang@example.com",
  },
  {
    id: 3,
    name: "Jane Fisher",
    role: "Senior Developer",
    team: "Development",
    status: "active",
    age: "22",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
    email: "jane.fisher@example.com",
  },
  {
    id: 4,
    name: "William Howard",
    role: "Community Manager",
    team: "Marketing",
    status: "vacation",
    age: "28",
    avatar: "https://i.pravatar.cc/150?u=a048581f4e29026701d",
    email: "william.howard@example.com",
  },
  {
    id: 5,
    name: "Kristen Copper",
    role: "Sales Manager",
    team: "Sales",
    status: "active",
    age: "24",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
    email: "kristen.cooper@example.com",
  },
];

const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 20 20"
      width="1em"
      {...props}
    >
      <path
        d="M12.9833 10C12.9833 11.65 11.65 12.9833 10 12.9833C8.35 12.9833 7.01666 11.65 7.01666 10C7.01666 8.35 8.35 7.01666 10 7.01666C11.65 7.01666 12.9833 8.35 12.9833 10Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M9.99999 16.8916C12.9417 16.8916 15.6833 15.1583 17.5917 12.1583C18.3417 10.9833 18.3417 9.00831 17.5917 7.83331C15.6833 4.83331 12.9417 3.09998 9.99999 3.09998C7.05833 3.09998 4.31666 4.83331 2.40833 7.83331C1.65833 9.00831 1.65833 10.9833 2.40833 12.1583C4.31666 15.1583 7.05833 16.8916 9.99999 16.8916Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );


const DeleteIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 20 20"
      width="1em"
      {...props}
    >
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
      <path
        d="M8.60834 13.75H11.3833"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M7.91669 10.4167H12.0834"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );

const EditIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 20 20"
      width="1em"
      {...props}
    >
      <path
        d="M11.05 3.00002L4.20835 10.2417C3.95002 10.5167 3.70002 11.0584 3.65002 11.4334L3.34169 14.1334C3.23335 15.1084 3.93335 15.775 4.90002 15.6084L7.58335 15.15C7.95835 15.0834 8.48335 14.8084 8.74168 14.525L15.5834 7.28335C16.7667 6.03335 17.3 4.60835 15.4583 2.86668C13.625 1.14168 12.2334 1.75002 11.05 3.00002Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
      <path
        d="M9.90833 4.20831C10.2667 6.50831 12.1333 8.26665 14.45 8.49998"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
      <path
        d="M2.5 18.3333H17.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
    </svg>
  );


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
  const [bands, setBands] = useState<Band[]>([]);

  useEffect(() => {
    fetch("/api/bands")
      .then((res) => res.json())
      .then((data) => {
        setBands(data as Band[]);
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
      fetch("/api/bands")
        .then((res) => res.json())
        .then((data) => {
          setBands(data as Band[]);
        });
    }
  };

  const renderCell = React.useCallback((user: User, columnKey: keyof User | 'actions') => {
  const cellValue = user[columnKey as keyof User];

  switch (columnKey) {
    case "name":
      return (
        <User
          avatarProps={{ radius: "lg", src: user.avatar }}
          description={user.email}
          name={cellValue as string}
        >
          {user.email}
        </User>
      );
    case "actions":
      return (
        <div className="relative flex justify-end items-center gap-2"> {/* 👈 added justify-end */}
          <Tooltip content="Details">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <EyeIcon />
            </span>
          </Tooltip>
          <Tooltip content="Edit user">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <EditIcon />
            </span>
          </Tooltip>
          <Tooltip color="danger" content="Delete user">
            <span className="text-lg text-danger cursor-pointer active:opacity-50">
              <DeleteIcon />
            </span>
          </Tooltip>
        </div>
      );
    default:
      return cellValue;
  }
}, []);


  // Split users into two arrays for the two tables
  const firstTableUsers = users.slice(0, Math.ceil(users.length/2));
  const secondTableUsers = users.slice(Math.ceil(users.length/2));

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
          
<div className="flex flex-col lg:flex-row justify-center w-full max-w-[1800px] mx-auto gap-8 px-4">
  {/* Table 1 - Left */}
  <div className="flex-1 min-w-[300px] md:min-w-[500px] lg:min-w-[650px]">
    <Table aria-label="Users Table 1" className="w-full">
      <TableHeader columns={[{ name: "NAME", uid: "name" }, { name: "ACTIONS", uid: "actions" }]}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "end" : "start"}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={firstTableUsers}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell
                className={`py-4 text-base ${columnKey === "actions" ? "text-right" : ""}`}
              >
                {renderCell(item, columnKey as keyof User | 'actions')}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>

  {/* Table 2 - Right */}
  <div className="flex-1 min-w-[300px] md:min-w-[500px] lg:min-w-[650px]">
    <Table aria-label="Users Table 2" className="w-full">
      <TableHeader columns={[{ name: "NAME", uid: "name" }, { name: "ACTIONS", uid: "actions" }]}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "end" : "start"}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={secondTableUsers}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell
                className={`py-4 text-base ${columnKey === "actions" ? "text-right" : ""}`}
              >
                {renderCell(item, columnKey as keyof User | 'actions')}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
</div>
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
                <Select
                  label="Select Band"
                  selectedKeys={bandId ? [bandId] : []}
                  onChange={(e) => setBandId(e.target.value)}
                  className="text-white"
                >
                  {bands.map((band) => (
                    <SelectItem key={band.id} value={band.id}>
                      {band.name}
                    </SelectItem>
                  ))}
                </Select>
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
                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
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