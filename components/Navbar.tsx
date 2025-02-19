"use client";

import React, { useState, useEffect } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarMenuToggle,
  NavbarMenuItem,
  NavbarMenu,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from "@heroui/react";
import Image from "next/image";
import SWOLogo from "../public/SWO_Logo.png";
import { useRouter, usePathname } from "next/navigation";

const NavbarComponent = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated && pathname !== "/") {
      router.push("/");
    }
  }, [isAuthenticated, pathname, router]);

  const handleLogin = () => {
    if (username === "admin" && password === "1234") {
      setIsAuthenticated(true);
      setRole("admin");
      onOpenChange();
    } else if (username === "user" && password === "1234") {
      setIsAuthenticated(true);
      setRole("user");
      onOpenChange();
    } else {
      alert("Invalid credentials");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    router.push("/");
  };

  return (
    <div>
      <Navbar isBordered>
        <NavbarContent className="sm:hidden" justify="start">
          <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} />
        </NavbarContent>

        <NavbarContent className="sm:hidden pr-3" justify="center">
          <NavbarBrand>
            <Image src={SWOLogo} alt="SWO Logo" width={50} height={50} priority />
            <p className="font-bold text-inherit ml-2">SWO</p>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarBrand>
            <Image src={SWOLogo} alt="SWO Logo" width={50} height={50} priority />
            <p className="font-bold text-inherit ml-2">SWO</p>
          </NavbarBrand>
          <NavbarItem>
            <Link href="/">Home</Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/RoomBooking" className={!isAuthenticated ? "opacity-50" : ""}>Room Booking</Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/EquipmentBooking" className={!isAuthenticated ? "opacity-50" : ""}>Equipment Booking</Link>
          </NavbarItem>
          {role === "admin" && (
           <>
              <NavbarItem>
                <Link href="/SlotRequests" className={!isAuthenticated ? "opacity-50" : ""}>Slot Requests</Link>
              </NavbarItem>
              
              <NavbarItem>
                <Link href="/EntryLog" className={!isAuthenticated ? "opacity-50" : ""}>Entry Log</Link>
              </NavbarItem>
            </>
          )}
        </NavbarContent>

        <NavbarContent justify="end">
          {isAuthenticated ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  color="secondary"
                  name={username}
                  size="sm"
                  src="https://i.pravatar.cc/150"
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold">{username}</p>
                </DropdownItem>
                <DropdownItem key="settings">My Settings</DropdownItem>
                <DropdownItem key="logout" color="danger" onClick={handleLogout}>
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <NavbarItem>
              <Button onPress={onOpen} color="primary">Login</Button>
            </NavbarItem>
          )}
        </NavbarContent>

        <NavbarMenu>
          <NavbarMenuItem>
            <Link href="/">Home</Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link href="/RoomBooking" className={!isAuthenticated ? "opacity-50" : ""}>Room Booking</Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link href="/EquipmentBooking" className={!isAuthenticated ? "opacity-50" : ""}>Equipment Booking</Link>
          </NavbarMenuItem>
          {role === "admin" && (
            <>
              <NavbarMenuItem>
                <Link href="/SlotRequests" className={!isAuthenticated ? "opacity-50" : ""}>Slot Requests</Link>
              </NavbarMenuItem>

              <NavbarMenuItem>
                <Link href="/EntryLog" className={!isAuthenticated ? "opacity-50" : ""}>Entry Log</Link>
              </NavbarMenuItem>
            </>
          )}
        </NavbarMenu>
      </Navbar>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
        <ModalContent>
          <ModalHeader>Sign In</ModalHeader>
          <ModalBody>
            <Input type="text" label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <Input type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onOpenChange}>Close</Button>
            <Button color="primary" onPress={handleLogin}>Sign In</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default NavbarComponent;