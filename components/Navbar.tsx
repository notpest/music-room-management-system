"use client";
import { useState, useEffect } from "react";
import {
  Navbar,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  NavbarBrand,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
} from "@nextui-org/react";
import Image from "next/image";
import SWOLogo from "../public/SWO_Logo.png";
import { useRouter, usePathname } from "next/navigation";

const NavbarComponent = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"user" | "admin">("user");
  const router = useRouter();
  const pathname = usePathname();

  // Handle mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent access to protected routes if not authenticated
  useEffect(() => {
    if (mounted && !isAuthenticated && pathname !== "/") {
      router.push("/");
    }
  }, [isAuthenticated, pathname, router, mounted]);

  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }

  // Handle login
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      if (username === "admin" && password === "1234") {
        setIsAuthenticated(true);
        setRole("admin"); // Set role to admin for this example
        onOpenChange(); // Close modal
        setUsername(""); // Clear form
        setPassword(""); // Clear form
      } else if (username === "user" && password === "1234") {
        setIsAuthenticated(true);
        setRole("user"); // Set role to user for this example
        onOpenChange(); // Close modal
        setUsername(""); // Clear form
        setPassword(""); // Clear form
      } else {
        alert("Invalid username or password!");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    if (pathname !== "/") {
      router.push("/");
    }
  };

  return (
    <div>
      <Navbar shouldHideOnScroll>
        <NavbarBrand>
          <Image 
            src={SWOLogo} 
            alt="SWO Logo" 
            width={50} 
            height={50}
            priority // Add priority to ensure logo loads quickly
          />
          <p className="font-bold text-inherit ml-2">SWO</p>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link color="foreground" href="/">
              Home
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              href="/RoomBooking"
              aria-current="page"
              className={!isAuthenticated ? "pointer-events-none opacity-50" : ""}
            >
              Room Booking
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              href="/EquipmentBooking"
              aria-current="page"
              className={!isAuthenticated ? "pointer-events-none opacity-50" : ""}
            >
              Equipment Booking
            </Link>
          </NavbarItem>
          {role === "admin" && (
            <NavbarItem>
              <Link
                href="/Approval"
                aria-current="page"
                className={!isAuthenticated ? "pointer-events-none opacity-50" : ""}
              >
                Approval Page
              </Link>
            </NavbarItem>
          )}
        </NavbarContent>
        <NavbarContent justify="end">
          {isAuthenticated ? (
            <NavbarItem>
              <Button 
                color="danger" 
                variant="flat" 
                onPress={handleLogout}
                isLoading={isLoading}
              >
                Logout
              </Button>
            </NavbarItem>
          ) : (
            <NavbarItem>
              <Button 
                onPress={onOpen} 
                color="primary"
                isLoading={isLoading}
              >
                Login
              </Button>
            </NavbarItem>
          )}
        </NavbarContent>
      </Navbar>

      {/* Login Modal */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        placement="center"
        backdrop="blur"
        isDismissable={!isLoading}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Sign In
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <Input
                    type="text"
                    label="Username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    isDisabled={isLoading}
                  />
                  <Input
                    type="password"
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isLoading) {
                        handleLogin();
                      }
                    }}
                    isDisabled={isLoading}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="danger" 
                  variant="light" 
                  onPress={onClose}
                  isDisabled={isLoading}
                >
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={handleLogin}
                  isLoading={isLoading}
                >
                  Sign In
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default NavbarComponent;
