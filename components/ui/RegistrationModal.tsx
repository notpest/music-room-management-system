"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { Select, SelectItem, Input, Button } from "@nextui-org/react";
import { useState, useEffect } from "react";

interface Band {
  id: string;
  name: string;
  colour: string;
}

export default function RegistrationModal({ 
  isOpen, 
  onOpenChange 
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [regName, setRegName] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regBands, setRegBands] = useState<Band[]>([]);
  const [selectedBandIds, setSelectedBandIds] = useState<Set<string>>(new Set());
  const [loadingBands, setLoadingBands] = useState(true);
  const [regError, setRegError] = useState<string | null>(null); // Add error state
  const [isSubmitting, setIsSubmitting] = useState(false); // Add loading state
  
  useEffect(() => {
    (async () => {
      try {
        setLoadingBands(true);
        const res = await fetch("/api/bands");
        const data = await res.json();
        setRegBands(data);
      } catch (e) {
        console.error("unable to load bands", e);
      } finally {
        setLoadingBands(false);
      }
    })();
  }, []);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null); // Reset error
    setIsSubmitting(true); // Start loading
    
    try {
      const payload = {
        name: regName,
        password: regPassword,
        email: regEmail,
        role: "user",
        bandIds: Array.from(selectedBandIds),
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setRegError(data.message || "Registration failed");
      } else {
        // Success: close modal and reset form
        onOpenChange(false); // Close the modal
        setRegName("");
        setRegPassword("");
        setRegEmail("");
        setSelectedBandIds(new Set());
        alert("Registration successful! You can now Sign In.");
      }
    } catch (err) {
      console.error("Error registering user:", err);
      setRegError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false); // End loading
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Register User</ModalHeader>
            <ModalBody>
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <Input label="Name" value={regName} onChange={e => setRegName(e.target.value)} required />
                <Input label="Email" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                <Input label="Password" type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
                <Select
                  label="Select Profiles"
                  placeholder={loadingBands ? "Loading profiles…" : "Choose your Profile"}
                  selectionMode="multiple"
                  selectedKeys={selectedBandIds}
                  onSelectionChange={(keys) => setSelectedBandIds(keys as Set<string>)}
                  className="w-full"
                  isDisabled={loadingBands}
                >
                  {regBands.map((band) => (
                    <SelectItem key={band.id} value={band.id}>
                      {band.name}
                    </SelectItem>
                  ))}
                </Select>
                
                {/* Contact text added here */}
                <div className="text-xs text-gray-500 mt-1 flex justify-items-center">
                  <span>Don't see your profile listed? Kindly contact Roshan Sir</span>
                </div>

                {/* Display error message if any */}
                {regError && (
                  <div className="text-red-500 p-2 rounded bg-red-100">
                    {regError}
                  </div>
                )}
                
                <ModalFooter className="justify-end">
                  <Button 
                    color="success" 
                    type="submit"
                    isDisabled={isSubmitting}
                    isLoading={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "Confirm"}
                  </Button>
                </ModalFooter>
              </form>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}