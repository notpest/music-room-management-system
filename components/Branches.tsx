import React from "react";
import { FocusCards } from "./ui/focus-cards";
import SWO_Logo from "../public/SWO_Logo.png"; // Import images correctly
import Natyarpana from "../public/Natyarpana.jpeg";
import ckc from "../public/Choir/CKC.png";

const Branches = () => {
  const cards = [
    {
      title: "The Volunteer Body",
      desc: "We volunteer man",
      src: SWO_Logo, // Use imported image directly
    },
    {
      title: "The University Choir",
      desc: "We sing ;)",
      src: ckc,
    },
    {
      title: "Natyarpana",
      desc: "We Dance Nicely",
      src: Natyarpana,
    },
     ];

  return (
    <div className="mt-8">
      <FocusCards cards={cards} />
    </div>
  );
};

export default Branches;
