// Register/page.tsx
"use client";
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
  User as HUser,
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
  loading: () => <div className="h-[64px] w-full bg-background/60 backdrop-blur-lg" />,
});

/** ── SVG Icon Components ───────────────────────────────────────────────────── **/
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
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

const EditIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
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
    <path d="M2.5 18.3333H17.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} strokeWidth={1.5} />
  </svg>
);

interface DbUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  bands: Array<{ id: string; name: string }>;
}

interface Band {
  id: string;
  name: string;
  colour: string;
}

const RegisterPage = () => {
  const router = useRouter();

  // States for new-user / new-band modals (unchanged)
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedBandIds, setSelectedBandIds] = useState<string[]>([]);
  const [bandId, setBandId] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [bandColor, setBandColor] = useState("#000000");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isBandModalOpen, setBandModalOpen] = useState(false);
  const [bands, setBands] = useState<Band[]>([]);

  // **NEW**: state to hold all users from DB
  const [dbUsers, setDbUsers] = useState<DbUser[]>([]);

  // **NEW**: state and handlers for edit‐user modal
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editBandIds, setEditBandIds] = useState<string[]>([]);
  // ------------------------------------------------------------------------
  // Fetch all bands once on mount (for both new‐band dropdown and edit‐user dropdown)
  useEffect(() => {
    fetch("/api/bands")
      .then((res) => res.json())
      .then((data) => {
        setBands(data as Band[]);
      })
      .catch((err) => {
        console.error("Error fetching Profile:", err);
      });
  }, []);

    // ───────────────────────────────────────────────────────────────────────
  // (1) Re‐fetch bands (called after any create/edit/delete)
  const fetchDbBands = () => {
    fetch("/api/bands")
      .then((res) => res.json())
      .then((data: Band[]) => {
        setBands(data);
      })
      .catch((err) => {
        console.error("Error fetching Profile:", err);
      });
  };

  // Immediately after useEffect(() => fetch("/api/bands")…), you can call:
  useEffect(() => {
    fetchDbBands();
  }, []);

  // ───────────────────────────────────────────────────────────────────────
  // (2) Delete a band by ID, then re‐fetch
  const handleDeleteBand = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Profile?")) return;
    try {
      const res = await fetch(`/api/bands?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchDbBands();
      } else {
        console.error("Delete Profile failed");
      }
    } catch (err) {
      console.error("Error deleting Profile:", err);
    }
  };

  // ───────────────────────────────────────────────────────────────────────
  // (3) Edit‐Band modal state & handlers
  const [editBandId, setEditBandId] = useState<string | null>(null);
  const [isEditBandModalOpen, setEditBandModalOpen] = useState(false);
  const [editBandName, setEditBandName] = useState("");
  const [editBandColour, setEditBandColour] = useState("#000000");

  const openEditBandModal = (b: Band) => {
    setEditBandId(b.id);
    setEditBandName(b.name);
    // Assume your API uses `colour` (hex) as the field name:
    // We fetched `Band[] = { id, name, colour? }` (if your model is `colour`)
    // If your Band model has `colour`, change this line accordingly:
    // e.g. setEditBandColour(b.colour)
    setEditBandColour((b as any).colour || "#000000");
    setEditBandModalOpen(true);
  };

  const handleEditBandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBandId) return;
    try {
      const res = await fetch(`/api/bands?id=${editBandId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editBandName,
          colour: editBandColour,
        }),
      });
      if (res.ok) {
        setEditBandModalOpen(false);
        fetchDbBands();
      } else {
        console.error("Edit Profile failed");
      }
    } catch (err) {
      console.error("Error editing Profile:", err);
    }
  };

  // ------------------------------------------------------------------------
  // Function to fetch all users (with band_name)
  const fetchDbUsers = () => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data: DbUser[]) => {
        setDbUsers(data);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
      });
  };

  // On component mount, fetch users
  useEffect(() => {
    fetchDbUsers();
  }, []);

  // ------------------------------------------------------------------------
  // Register new user (unchanged except we refetch after success)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

     const payload = {
      name,
      username,
      password,
      email,
      role,
      bandIds: selectedBandIds, // ← send the array
      // you can still include bandColor if your register needs it
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.message || "Something went wrong");
    } else {
      setSuccess(true);
      setUserModalOpen(false);
      fetchDbUsers(); // <— refresh user list
      // Optionally clear form fields here
      setName("");
      setUsername("");
      setPassword("");
      setEmail("");
      setBandId("");
    }
  };

  // ------------------------------------------------------------------------
  // Register new band (unchanged except we refetch bands and users if needed)
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
      // re‐fetch band list
      fetch("/api/bands")
        .then((res) => res.json())
        .then((data) => setBands(data as Band[]))
        .catch((err) => console.error("Error fetching bands:", err));
    }
  };

  // ------------------------------------------------------------------------
  // Delete a user by ID, then refresh the list
  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchDbUsers();
      } else {
        console.error("Delete failed");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  // ------------------------------------------------------------------------
  // Open the edit modal, prefill fields
  const openEditModal = (u: DbUser) => {
    setEditId(u.id);
    setEditName(u.name);
    setEditUsername(u.username);
    setEditEmail(u.email);
    setEditBandIds(u.bands.map((b) => b.id));
    setEditModalOpen(true);
  };

  // Submit the user‐edit form (PUT), then refresh and close
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    try {
      const res = await fetch(`/api/users?id=${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          username: editUsername,
          email: editEmail,
          bandIds: editBandIds,
        }),
      });
      if (res.ok) {
        setEditModalOpen(false);
        fetchDbUsers();
      } else {
        console.error("Edit failed");
      }
    } catch (err) {
      console.error("Error editing user:", err);
    }
  };

  // ------------------------------------------------------------------------
  // Render each cell in the “left” table
  const renderDbCell = React.useCallback(
    (user: DbUser, columnKey: keyof DbUser | "actions") => {
      switch (columnKey) {
        case "name":
          return <>{user.name}</>;

        case "username":
          return <>{user.username}</>;

        case "bands":
          return <>
              {user.bands.length === 0
                ? "—"
                : user.bands.map((b) => b.name).join(", ")}
            </>;

        case "actions":
          return (
            <div className="flex justify-end items-center gap-2">
              <Tooltip content="Edit user">
                <span
                  className="cursor-pointer text-default-400 active:opacity-50"
                  onClick={() => openEditModal(user)}
                >
                  <EditIcon />
                </span>
              </Tooltip>
              <Tooltip color="danger" content="Delete user">
                <span
                  className="cursor-pointer text-danger active:opacity-50"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  <DeleteIcon />
                </span>
              </Tooltip>
            </div>
          );

        default:
          return null;
      }
    },
    []
  );

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
          <div className="flex flex-col lg:flex-row mb-4 space-y-4 lg:space-y-0 lg:space-x-4">
            <Button
              onPress={() => setUserModalOpen(true)}
              className="w-full py-2 px-4 bg-[#18181b] text-white rounded transition duration-300 ease-in-out transform hover:scale-105"
            >
              Register User
            </Button>
            <Button
              onPress={() => setBandModalOpen(true)}
              className="w-full py-2 px-4 bg-[#18181b] text-white rounded transition duration-300 ease-in-out transform hover:scale-105"
            >
              Register Profile
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row justify-center w-full max-w-[1800px] mx-auto gap-8 px-4">
          {/* ── LEFT TABLE: show users fetched from DB ────────────────────────── */}
          <div className="flex-1 min-w-[300px] md:min-w-[500px] lg:min-w-[650px]">
            <Table aria-label="DB Users Table" className="w-full">
              <TableHeader
                columns={[
                  { name: "NAME", uid: "name" },
                  { name: "USERNAME", uid: "username" },
                  { name: "PROFILE", uid: "bands" },
                  { name: "ACTIONS", uid: "actions" },
                ]}
              >
                {(column) => (
                  <TableColumn
                    key={column.uid}
                    align={column.uid === "actions" ? "end" : "start"}
                  >
                    {column.name}
                  </TableColumn>
                )}
              </TableHeader>
              <TableBody items={dbUsers}>
                {(item) => (
                  <TableRow key={item.id}>
                    {(columnKey) => (
                      <TableCell
                        className={`py-4 text-base ${
                          columnKey === "actions" ? "text-right" : ""
                        }`}
                      >
                        {renderDbCell(
                          item,
                          columnKey as keyof DbUser | "actions"
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* ── RIGHT TABLE: show all bands (name, colour, actions) ─────────────── */}
          <div className="flex-1 min-w-[300px] md:min-w-[500px] lg:min-w-[650px]">
            <Table aria-label="Bands Table" className="w-full">
              <TableHeader
                columns={[
                  { name: "PROFILE NAME", uid: "name" },
                  { name: "COLOUR", uid: "colour" },
                  { name: "ACTIONS", uid: "actions" },
                ]}
              >
                {(column) => (
                  <TableColumn
                    key={column.uid}
                    align={column.uid === "actions" ? "end" : "start"}
                  >
                    {column.name}
                  </TableColumn>
                )}
              </TableHeader>
              <TableBody items={bands}>
                {(item: Band & { colour: string }) => (
                  <TableRow key={(item as any).id}>
                    {/* BAND NAME */}
                    <TableCell className="py-4 text-base text-left">
                      {(item as Band).name}
                    </TableCell>

                    {/* COLOUR */}
                    <TableCell className="py-4 text-base text-left">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-sm border"
                          style={{ backgroundColor: (item as any).colour }}
                        />
                        <span>{(item as any).colour}</span>
                      </div>
                    </TableCell>

                    {/* ACTIONS */}
                    <TableCell className="py-4 text-base text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Tooltip content="Edit Profile">
                          <span
                            className="cursor-pointer text-default-400 active:opacity-50"
                            onClick={() => openEditBandModal(item as any)}
                          >
                            <EditIcon />
                          </span>
                        </Tooltip>
                        <Tooltip color="danger" content="Delete Profile">
                          <span
                            className="cursor-pointer text-danger active:opacity-50"
                            onClick={() => handleDeleteBand((item as any).id)}
                          >
                            <DeleteIcon />
                          </span>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      </div>

      {/* ── User Registration Modal ────────────────────────────────────────── */}
      <Modal isOpen={isUserModalOpen} onOpenChange={setUserModalOpen}>
        <ModalContent>
          <ModalHeader>Register User</ModalHeader>
          <ModalBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full"
              />
              <Input
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full"
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
              <Select
                label="Select Profile"
                selectionMode="multiple"
                selectedKeys={new Set(selectedBandIds)}
                onSelectionChange={(keys) => {
                  // NextUI’s Select passes a Set of selected values
                  setSelectedBandIds(Array.from(keys) as string[]);
                }}
                className="w-full"
              >
                <>
                  {bands.map((band) => (
                    <SelectItem key={band.id} value={band.id}>
                      {band.name}
                    </SelectItem>
                  ))}
                </>               
              </Select>
              <ModalFooter className="justify-end">
                <Button color="success" type="submit">
                  Confirm
                </Button>
              </ModalFooter>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* ── Band Registration Modal ────────────────────────────────────────── */}
      <Modal isOpen={isBandModalOpen} onOpenChange={setBandModalOpen}>
        <ModalContent>
          <ModalHeader>Register Profile</ModalHeader>
          <ModalBody>
            <form onSubmit={handleBandSubmit} className="space-y-4">
              <Input
                label="Profile Name"
                type="text"
                value={bandId}
                onChange={(e) => setBandId(e.target.value)}
                required
                className="w-full"
              />
              <div className="flex items-center gap-2">
                <div
                  style={{ backgroundColor: bandColor }}
                  className="w-8 h-8 rounded-md border border-gray-400"
                />
                <Input
                  label="Profile Color"
                  type="text"
                  value={bandColor}
                  onChange={(e) => setBandColor(e.target.value)}
                  placeholder="#FFFFFF"
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                  required
                  className="w-full"
                />
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
                      styles={{
                        default: {
                          picker: {
                            background: "#1e1e1e",
                            boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                            borderRadius: "0.5rem",
                            padding: "1rem",
                          },
                          saturation: {
                            borderRadius: "0.5rem",
                          },
                          hue: {
                            borderRadius: "0.5rem",
                          },
                        },
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <ModalFooter className="justify-end">
                <Button color="success" type="submit">
                  Confirm
                </Button>
              </ModalFooter>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* ── Edit User Modal ────────────────────────────────────────────────── */}
      <Modal isOpen={isEditModalOpen} onOpenChange={setEditModalOpen}>
        <ModalContent>
          <ModalHeader>Edit User</ModalHeader>
          <ModalBody>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <Input
                label="Name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full"
              />
              <Input
                label="Username"
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                required
                className="w-full"
              />
              <Input
                label="Email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
                className="w-full"
              />
              <Select
                label="Select Profiles"
                selectionMode="multiple"
                selectedKeys={new Set(editBandIds)} 
                onSelectionChange={(keys) => {
                  setEditBandIds(Array.from(keys) as string[]);
                }}
                className="w-full"
              >
                <>
                  {/* <SelectItem key="" value={""}>
                    None
                  </SelectItem> */}
                    {bands.map((band) => (
                      <SelectItem key={band.id} value={band.id}>
                        {band.name}
                      </SelectItem>
                    ))}
                </>
              </Select>
              <ModalFooter className="justify-end">
                <Button color="success" type="submit">
                  Save
                </Button>
                <Button color="secondary" onPress={() => setEditModalOpen(false)}>
                  Cancel
                </Button>
              </ModalFooter>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* ── Edit Band Modal ────────────────────────────────────────────────────── */}
      <Modal isOpen={isEditBandModalOpen} onOpenChange={setEditBandModalOpen}>
        <ModalContent>
          <ModalHeader>Edit Profile</ModalHeader>
          <ModalBody>
            <form onSubmit={handleEditBandSubmit} className="space-y-4">
              <Input
                label="Profile Name"
                type="text"
                value={editBandName}
                onChange={(e) => setEditBandName(e.target.value)}
                required
                className="w-full"
              />
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-md border-gray-400"
                  style={{ backgroundColor: editBandColour }}
                />
                <Input
                  label="Colour (Hex)"
                  type="text"
                  value={editBandColour}
                  onChange={(e) => setEditBandColour(e.target.value)}
                  placeholder="#FFFFFF"
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                  required
                  className="w-full"
                />
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
                      color={editBandColour}
                      onChangeComplete={(color) => setEditBandColour(color.hex)}
                      styles={{
                        default: {
                          picker: {
                            background: "#1e1e1e",
                            boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                            borderRadius: "0.5rem",
                            padding: "1rem",
                          },
                          saturation: {
                            borderRadius: "0.5rem",
                          },
                          hue: {
                            borderRadius: "0.5rem",
                          },
                        },
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <ModalFooter className="justify-end">
                <Button color="success" type="submit">
                  Save
                </Button>
                <Button color="secondary" onPress={() => setEditBandModalOpen(false)}>
                  Cancel
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
