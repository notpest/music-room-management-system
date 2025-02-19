"use client";
import React, { useState, useEffect} from "react";
import Image, { StaticImageData } from "next/image";
import band1 from "../../public/Bands/Band1.jpeg";
import TalentWeek from "../../public/Bands/Talent Week.jpeg";
import Magnificat from "../../public/Choir/Magnificat.jpeg";
import SoundCurry from "../../public/Choir/Choir3.jpeg";

interface EventProps {
  title: string;
  description: string;
  imageSrc: StaticImageData | string;
  altText: string;
  visible: boolean;
  reverse?: boolean; // Determines the layout direction
}

const EventData: EventProps[] = [
  {
    title: "Magnificat",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing twas a dream elit. Nullam tempor euismod quam, vel placerat augue faucibus id. Phasellus mollis lorem ac orci scelerisque facilisis.",
    imageSrc: Magnificat, // Use imported image
    altText: "Magnificat",
    visible: false, // Initially hidden
    reverse: false,
  },
  {
    title: "Sound Curry",
    description:
      "Lorem ipsum dolor sit amet, manifesting consectetur adipiscing elit. Nullam tempor euismod quam, vel placerat augue faucibus id. Phasellus mollis lorem ac orci scelerisque facilisis.",
    imageSrc: SoundCurry, // Use imported image
    altText: "SoundCurry",
    visible: false, // Initially hidden
    reverse: true,
  },
  {
    title: "Blossoms",
    description:
      "Lorem ipsum dolor sit amet, rigged consectetur adipiscing elit. Nullam tempor euismod quam, vel placerat augue faucibus id. Phasellus mollis lorem ac orci scelerisque facilisis.",
    imageSrc: band1,
    altText: "Band 1",
    visible: false, // Initially hidden
    reverse: false,
  },
  {
    title: "Talent Week",
    description:
      "Lorem ipsum dolor sit amet, consectetur twas amazing adipiscing elit. Nullam tempor euismod quam, vel placerat augue faucibus id. Phasellus mollis lorem ac orci scelerisque facilisis.",
    imageSrc: TalentWeek,
    altText: "Talent Week",
    visible: false, // Initially hidden
    reverse: true,
  },
];

const Event: React.FC<EventProps> = ({
  title,
  description,
  imageSrc,
  altText,
  visible,
  reverse = false,
}) => {
  return (
    <div
      className={`transition-opacity duration-1000 ease-in-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div
        className={`max-w-6xl mx-auto mt-4 flex items-center ${
          reverse ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Text Section */}
        <div className="flex-1 p-4">
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-gray-700">{description}</p>
        </div>

        {/* Image Section */}
        <div className="flex-1 p-4">
          <Image
            src={imageSrc}
            alt={altText}
            className="rounded-lg shadow-lg"
            placeholder="blur" // Optional: Adds a blur placeholder for optimized images
          />
        </div>
      </div>
    </div>
  );
};

const EventsPage: React.FC = () => {
  const [visibleStates, setVisibleStates] = useState<boolean[]>(
    EventData.map(() => false)
  );

  useEffect(() => {
    const handleScroll = () => {
      const updatedStates = EventData.map((_, index) => {
        const element = document.getElementById(`event-${index}`);
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        return rect.top < window.innerHeight - 100; // Fade in when the element is near the viewport
      });
      setVisibleStates(updatedStates);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Trigger on mount

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen py-10">
      {EventData.map((event, index) => (
        <div id={`event-${index}`} key={index}>
          <Event
            title={event.title}
            description={event.description}
            imageSrc={event.imageSrc}
            altText={event.altText}
            visible={visibleStates[index]} // Controlled by scroll logic
            reverse={event.reverse}
          />
        </div>
      ))}
    </div>
  );
};

export default EventsPage;
