"use client";

import React from "react";
import { BackgroundGradient } from "./ui/background-gradient";
import Image from "next/image";
import SWOLogo from "../public/SWO_Logo.png";

// Data
const missionData = {
  vision: {
    title: "Vision",
    description:
      "To inspire excellence and build confident student leaders to create a better world.",
  },
  mission: {
    title: "Mission",
    description:
      "To foster talent and holistic growth by providing students with a multidisciplinary platform of opportunities for service and self-expression.",
  },
  scope: {
    title: "Scope",
    description:
      "A sense of responsibility in the student community of Christ (Deemed to be University) towards self and society.",
  },
  purpose: {
    title: "Purpose",
    description:
      "To inspire students to build a better world through holistic development.",
  },
};

const Mission = () => {
  return (
    <div>
      <BackgroundGradient className="rounded-[22px] p-4 sm:p-10 bg-white dark:bg-zinc-900 flex flex-col items-center justify-center">
        {/* <div className="relative inline-block p-2 rounded-full bg-gradient-to-r from-[#f9e89d] via-[#ffffff] to-[#f9e89d]"> */}
          {/* Logo */}
          <Image
            src={SWOLogo}
            alt="Students Welfare Office Kengeri"
            height={400}
            width={400}
            className="object-contain rounded-full"
          />
        {/* </div> */}

        {/* Sections */}
        {Object.values(missionData).map((section, index) => (
          <div key={index} className="text-center mt-4">
            <p className="text-base sm:text-xl text-black mb-2 dark:text-neutral-200 font-semibold">
              {section.title}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {section.description}
            </p>
          </div>
        ))}
      </BackgroundGradient>
    </div>
  );
};

export default Mission;