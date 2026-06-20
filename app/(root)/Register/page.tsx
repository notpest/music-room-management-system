"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import Modal from "@/components/ui/Modal";
import { SketchPicker } from "react-color";

const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false });

interface DbUser {
  id: string;
  name: string;
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
  const { data: session, status } = useSession();

  const [dbUsers, setDbUsers] = useState<DbUser[]>([]);
  const [bands, setBands] = useState<Band[]>([]);

  const [isModalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.replace("/");
    }
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      const [usersRes, bandsRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/bands"),
      ]);
      const usersData = await usersRes.json();
      const bandsData = await bandsRes.json();
      setDbUsers(usersData);
      setBands(bandsData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (title: string, content: React.ReactNode) => {
    setModalTitle(title);
    setModalContent(content);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalTitle("");
    setModalContent(null);
    fetchData(); // Refresh data when any modal closes
  };

  return (
    <motion.div
      className="bg-black-100 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar />
      <div className="max-w-7xl mx-auto mt-10 p-6 bg-black-100 rounded-lg shadow-md text-white">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button onClick={() => openModal("Register User", <UserForm bands={bands} onFinished={closeModal} />)} className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700">
            Register User
          </button>
          <button onClick={() => openModal("Register Profile", <BandForm onFinished={closeModal} />)} className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700">
            Register Profile
          </button>
        </div>

        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold mb-4">Users</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-gray-700">
                            <tr>
                                <th className="p-2 text-left">Name</th>
                                <th className="p-2 text-left">Email</th>
                                <th className="p-2 text-left">Profiles</th>
                                <th className="p-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dbUsers.map(user => (
                                <tr key={user.id} className="border-b border-gray-800">
                                    <td className="p-2">{user.name}</td>
                                    <td className="p-2">{user.email}</td>
                                    <td className="p-2">{user.bands.map(b => b.name).join(", ") || "—"}</td>
                                    <td className="p-2 text-right">
                                        <button onClick={() => openModal("Edit User", <UserForm user={user} bands={bands} onFinished={closeModal} />)} className="mr-2"><FaEdit /></button>
                                        <button onClick={() => openModal("Delete User", <DeleteConfirmation type="user" id={user.id} onFinished={closeModal} />)}><FaTrash /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div>
                <h2 className="text-2xl font-bold mb-4">Profiles</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-gray-700">
                            <tr>
                                <th className="p-2 text-left">Name</th>
                                <th className="p-2 text-left">Color</th>
                                <th className="p-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bands.map(band => (
                                <tr key={band.id} className="border-b border-gray-800">
                                    <td className="p-2">{band.name}</td>
                                    <td className="p-2"><div className="w-6 h-6 rounded-sm" style={{ backgroundColor: band.colour }}></div></td>
                                    <td className="p-2 text-right">
                                         <button onClick={() => openModal("Edit Profile", <BandForm band={band} onFinished={closeModal} />)} className="mr-2"><FaEdit /></button>
                                         <button onClick={() => openModal("Delete Profile", <DeleteConfirmation type="band" id={band.id} onFinished={closeModal} />)}><FaTrash /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} title={modalTitle}>
        {modalContent}
      </Modal>
    </motion.div>
  );
};

// --- Form Components for Modals ---

const UserForm = ({ user, bands, onFinished }: { user?: DbUser, bands: Band[], onFinished: () => void }) => {
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [password, setPassword] = useState("");
    const [selectedBandIds, setSelectedBandIds] = useState<string[]>(user?.bands.map(b => b.id) || []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { name, email, password: user ? undefined : password, bandIds: selectedBandIds, role: 'user' };
        const url = user ? `/api/users?id=${user.id}` : '/api/auth/register';
        const method = user ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (!res.ok) throw new Error(await res.text());
            onFinished();
        } catch (error) {
            console.error("Failed to save user", error);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" required className="w-full bg-gray-800 p-2 rounded"/>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full bg-gray-800 p-2 rounded"/>
            {!user && <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full bg-gray-800 p-2 rounded"/>}
            <select multiple value={selectedBandIds} onChange={e => setSelectedBandIds(Array.from(e.target.selectedOptions, o => o.value))} className="w-full bg-gray-800 p-2 rounded h-32">
                {bands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <button type="submit" className="w-full py-2 bg-purple-600 rounded">Save</button>
        </form>
    );
};

const BandForm = ({ band, onFinished }: { band?: Band, onFinished: () => void }) => {
    const [name, setName] = useState(band?.name || "");
    const [colour, setColour] = useState(band?.colour || "#ffffff");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { name, colour };
        const url = band ? `/api/bands?id=${band.id}` : '/api/bands';
        const method = band ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (!res.ok) throw new Error(await res.text());
            onFinished();
        } catch (error) {
            console.error("Failed to save band", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Profile Name" required className="w-full bg-gray-800 p-2 rounded"/>
            <div className="flex items-center gap-4">
                <input type="color" value={colour} onChange={e => setColour(e.target.value)} className="p-1 h-10 w-10 block bg-gray-800 border border-gray-700 cursor-pointer rounded-lg"/>
                <input type="text" value={colour} onChange={e => setColour(e.target.value)} placeholder="Hex Color" className="w-full bg-gray-800 p-2 rounded"/>
            </div>
            <button type="submit" className="w-full py-2 bg-purple-600 rounded">Save</button>
        </form>
    );
};

const DeleteConfirmation = ({ type, id, onFinished }: { type: 'user' | 'band', id: string, onFinished: () => void }) => {
    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/${type}s?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(await res.text());
            onFinished();
        } catch (error) {
            console.error(`Failed to delete ${type}`, error);
        }
    };

    return (
        <div>
            <p>Are you sure you want to delete this {type}?</p>
            <div className="flex justify-end gap-4 mt-4">
                <button onClick={onFinished} className="py-2 px-4 bg-gray-700 rounded">Cancel</button>
                <button onClick={handleDelete} className="py-2 px-4 bg-red-600 rounded">Delete</button>
            </div>
        </div>
    )
}

export default RegisterPage;
