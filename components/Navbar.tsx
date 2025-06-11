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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => onOpen(); // onOpen is from useDisclosure()
    window.addEventListener("openLoginModal", handler);
    return () => window.removeEventListener("openLoginModal", handler);
  }, [onOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < lastScrollY) {
        setShowNavbar(true);
      } else {
        setShowNavbar(false);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  const handleLogin = async () => {
    const result = await signIn("credentials", {
      identifier: username,
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
    <div className={`transition-transform duration-300 ${showNavbar ? "translate-y-0" : "-translate-y-full"}`}>
      <Navbar isBordered className="w-full bg-black-100 backdrop-blur-lg">
          {/* Menu toggle on the left */}
          <NavbarContent justify="start" style={{ marginLeft: "1rem" }}>
            <NavbarMenuToggle
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            />
          </NavbarContent>

          {/* Brand logo and name in the center */}
          <NavbarContent justify="center">
            <NavbarBrand>
              <Link href="/">
                <Image src={SWOLogo} alt="SWO Logo" width={50} height={50} priority />
              </Link>
            </NavbarBrand>
          </NavbarContent>

          {/* Dropdown for user actions on the right */}
          <NavbarContent justify="end" style={{ marginRight: "1rem" }}>
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
                    src="/"
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat">
                  <DropdownItem key="profile" className="h-14 gap-2">
                    <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold">{session.user?.name}</p>
                </DropdownItem>
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
          {/* <NavbarMenuItem>
            <Link href="/EquipmentBooking" className={!session ? "opacity-50" : ""}>
              Equipment Booking
            </Link>
          </NavbarMenuItem> */}
          {session && session.user?.role === "admin" && (
            <>
              <NavbarMenuItem>
                <Link href="/SlotRequests" className={!session ? "opacity-50" : ""}>
                  Approval Page
                </Link>
              </NavbarMenuItem>
              {/* <NavbarMenuItem>
                <Link href="/EntryLog" className={!session ? "opacity-50" : ""}>
                  Entry Log
                </Link>
              </NavbarMenuItem> */}
              <NavbarMenuItem>
                <Link href="/Dashboard" className={!session ? "opacity-50" : ""}>
                  Dashboard
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link href="/Register " className={!session ? "opacity-50" : ""}>
                  Register
                </Link>
              </NavbarMenuItem>
            </>
          )}
            <div className="absolute bottom-4 text-center text-sm text-gray-500 mb-6" style={{ width: "98%" }}>
    If you have any queries, kindly contact roshan.yohann@christuniversity.in
  </div>
        </NavbarMenu>
        
      </Navbar>

      {/* Login Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
        <ModalContent>
          <ModalHeader>Sign In</ModalHeader>
          <ModalBody>
            <Input
              type="text"
              label="Email or Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
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