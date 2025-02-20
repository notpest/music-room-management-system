// navbar.tsx
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
import { signIn, signOut, useSession } from "next-auth/react";

const NavbarComponent = () => {
  const { data: session, status } = useSession();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  // If not authenticated and not on the homepage, redirect to "/"
  useEffect(() => {
    if (status === "unauthenticated" && pathname !== "/") {
      router.push("/");
    }
  }, [status, pathname, router]);

  const handleLogin = async () => {
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
      callbackUrl: "/",
    });
    if (result?.error) {
      alert("Invalid credentials");
    } else {
      onOpenChange(); // Close the modal on success
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div>
      <Navbar isBordered className="w-full">
        {/* Menu toggle on the left */}
        <NavbarContent justify="start">
          <NavbarMenuToggle aria-label="Open menu" />
        </NavbarContent>

        {/* Brand logo and name in the center */}
        <NavbarContent justify="center">
          <NavbarBrand>
            <Image src={SWOLogo} alt="SWO Logo" width={50} height={50} priority />
            <p className="font-bold text-inherit ml-2">SWO</p>
          </NavbarBrand>
        </NavbarContent>

        {/* Dropdown for user actions on the right */}
        <NavbarContent justify="end">
          {session ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  color="secondary"
                  name={session.user?.name || ""}
                  size="sm"
                  src="https://i.pravatar.cc/150"
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold">{session.user?.name}</p>
                </DropdownItem>
                <DropdownItem key="settings">My Settings</DropdownItem>
                <DropdownItem key="logout" color="danger" onClick={handleLogout}>
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <NavbarItem>
              <Button onPress={onOpen} color="primary">
                Login
              </Button>
            </NavbarItem>
          )}
        </NavbarContent>

        {/* Mobile menu */}
        <NavbarMenu>
          <NavbarMenuItem>
            <Link href="/">Home</Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link href="/RoomBooking" className={!session ? "opacity-50" : ""}>
              Room Booking
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link href="/EquipmentBooking" className={!session ? "opacity-50" : ""}>
              Equipment Booking
            </Link>
          </NavbarMenuItem>
          {session && session.user?.role === "admin" && (
            <>
              <NavbarMenuItem>
                <Link href="/SlotRequests" className={!session ? "opacity-50" : ""}>
                  Approval Page
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link href="/EntryLog" className={!session ? "opacity-50" : ""}>
                  Entry Log
                </Link>
              </NavbarMenuItem>
            </>
          )}
        </NavbarMenu>
      </Navbar>

      {/* Login Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
        <ModalContent>
          <ModalHeader>Sign In</ModalHeader>
          <ModalBody>
            <Input
              type="text"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onOpenChange}>
              Close
            </Button>
            <Button color="primary" onPress={handleLogin}>
              Sign In
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default NavbarComponent;
