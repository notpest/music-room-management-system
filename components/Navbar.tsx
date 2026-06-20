"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import SWOLogo from "../../public/SWO_Logo.png";
import Modal from "./ui/Modal";
import RegistrationModal from "./ui/RegistrationModal";

const NavbarComponent = () => {
  const { data: session } = useSession();
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegModalOpen, setRegModalOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < lastScrollY || window.scrollY < 50) {
        setShowNavbar(true);
      } else {
        setShowNavbar(false);
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      alert("Invalid credentials");
    } else {
      setLoginModalOpen(false);
    }
    setIsLoggingIn(false);
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/RoomBooking", label: "Room Booking", auth: true },
    { href: "/SlotRequests", label: "Slot Requests", auth: true },
    { href: "/Dashboard", label: "Dashboard", admin: true },
    { href: "/Register", label: "Register", admin: true },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 w-full bg-black bg-opacity-50 backdrop-blur-lg transition-transform duration-300 ${
          showNavbar || isMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side: Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-2">
                <Image src={SWOLogo} alt="SWO Logo" width={40} height={40} priority />
                <span className="text-white font-bold text-xl hidden sm:block">SWO</span>
              </Link>
            </div>

            {/* Center: Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navLinks.map(({ href, label, auth, admin }) => {
                  const isActive = pathname === href;
                  if ((auth && !session) || (admin && session?.user?.role !== 'admin')) {
                    return null;
                  }
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-purple-600 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right side: Auth buttons & Mobile menu toggle */}
            <div className="flex items-center">
              <div className="hidden md:block">
                {session ? (
                   <div className="relative">
                     <button onClick={() => signOut({ callbackUrl: "/" })} className="px-4 py-2 text-sm bg-red-600 rounded-md hover:bg-red-700">
                       Logout
                     </button>
                   </div>
                ) : (
                  <button
                    onClick={() => setLoginModalOpen(true)}
                    className="px-4 py-2 text-sm bg-purple-600 rounded-md hover:bg-purple-700"
                  >
                    Login
                  </button>
                )}
              </div>
              <div className="md:hidden">
                <button
                  onClick={() => setMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    {isMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map(({ href, label, auth, admin }) => {
                  if ((auth && !session) || (admin && session?.user?.role !== 'admin')) {
                    return null;
                  }
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    {label}
                  </Link>
                );
              })}
               <div className="pt-4 border-t border-gray-700">
                {session ? (
                     <button onClick={() => {signOut({ callbackUrl: "/" }); setMenuOpen(false);}} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-gray-700 hover:text-white">
                       Logout
                     </button>
                ) : (
                  <button
                    onClick={() => {setLoginModalOpen(true); setMenuOpen(false);}}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Login
                  </button>
                )}
               </div>
            </div>
          </div>
        )}
      </nav>
      
      {/* Modals */}
      <Modal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} title="Sign In">
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoggingIn}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoggingIn}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
          />
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                setLoginModalOpen(false);
                setRegModalOpen(true);
              }}
              className="text-sm text-purple-400 hover:underline"
            >
              Don't have an account? Sign up
            </button>
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="px-6 py-2 bg-purple-600 rounded-md disabled:bg-gray-600"
            >
              {isLoggingIn ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </div>
      </Modal>

      <RegistrationModal isOpen={isRegModalOpen} onClose={() => setRegModalOpen(false)} />
    </>
  );
};

export default NavbarComponent;
