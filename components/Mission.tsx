"use client";

import React, { useState, useEffect } from "react";
import { BackgroundGradient } from "./ui/background-gradient";
import Image from "next/image";
import bandImage from "../public/Bands/Band1.jpeg";
import choir1Image from "../public/Choir/Choir3.jpeg";
import choir2Image from "../public/Choir/Magnificat.jpeg";
import choir3Image from "../public/Choir/Choir3.jpeg";

// Data
const missionData = {
  vision: {
    title: "Vision",
    description:
      "To inspire excellence and build confident student leaders to create a better world.",
    image: bandImage,
  },
  mission: {
    title: "Mission",
    description:
      "To foster talent and holistic growth by providing students with a multidisciplinary platform of opportunities for service and self-expression.",
    image: choir1Image,
  },
  scope: {
    title: "Scope",
    description:
      "A sense of responsibility in the student community of Christ (Deemed to be University) towards self and society.",
    image: choir2Image,
  },
  purpose: {
    title: "Purpose",
    description:
      "To inspire students to build a better world through holistic development.",
    image: choir3Image,
  },
};

const Mission = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const sections = Object.values(missionData);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSection((prevSection) => (prevSection + 1) % sections.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [sections.length]);

  const handleDotClick = (index: number) => {
    setCurrentSection(index);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black-100">
      <BackgroundGradient className="rounded-[22px] p-4 sm:p-10 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row items-center justify-between">
        {/* Slideshow */}
        <div className="w-full sm:w-1/2 relative" style={{ height: "400px" }}>
          {sections.map((section, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSection ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={section.image}
                alt={section.title}
                width={300}
                height={400}
                className="object-cover rounded-lg w-full h-full"
              />
            </div>
          ))}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {sections.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full cursor-pointer ${
                  index === currentSection ? "bg-white" : "bg-gray-400"
                }`}
                onClick={() => handleDotClick(index)}
              />
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="w-full sm:w-1/2 text-right mt-4 sm:mt-0 sm:ml-10">
          <p className="text-base sm:text-xl text-black mb-2 dark:text-neutral-200 font-semibold">
            {sections[currentSection].title}
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {sections[currentSection].description}
          </p>
        </div>
      </BackgroundGradient>
    </div>
  );
};

export default Mission;
