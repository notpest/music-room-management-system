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
      "Magnificat is an annual music festival wherein the University Choir, which is one of the wings of SWO, organises and performs for the students. The fest is planned around Christmas time lasting for a span of 10 days during the course of which the Choir teams of all the three campuses in Bangalore- Central, Kengeri and Bannerghatta- perform in each of the three campuses. Magnificat also witnesses the performances of the Choir teams from other Universities, church groups as well as orchestras. With all the campuses decked and decorated in the colours of Christmas, the spirit of Christmas comes alive in this celebration of music and carols spreading warmth and joy among all.",
    imageSrc: Magnificat, // Use imported image
    altText: "Magnificat",
    visible: false, // Initially hidden
    reverse: false,
  },
  {
    title: "Erato",
    description:
      "Erato organised by The University Choir & the Cultural Teams across all the three campuses in Bangalore. An evening of beautiful choral and band performances showcasing diverse genres of music! We thrill you with exciting performances of intricate harmonies and soulful rhythms!",
    imageSrc: SoundCurry, // Use imported image
    altText: "Erato",
    visible: false, // Initially hidden
    reverse: true,
  },
  {
    title: "Blossoms",
    description:
      "An annual cultural fest organised by the Student Welfare Office, Blossoms seeks to host activities and competitions at the inter deanery level. Much like Darpan in its search for talent and skills among the students and participants, Blossoms provides an opportunity on a bigger scale. With varying categories of activities like, literary, art, performing arts like music, dance and theatre the fest witnesses a remarkable display of flair and brilliance among all those associated with it.",
    imageSrc: band1,
    altText: "Band 1",
    visible: false, // Initially hidden
    reverse: false, 
  },
  {
    title: "Talent Week",
    description: 
      "Talent Week is a stage for all students & faculties to showcase their talents through various artforms including music, theatre, streetplay and dance! Each day is dedicated to one artform allowing students from all around the campus to participate and take the stage!",
    imageSrc: TalentWeek,
    altText: "Talent Week",
    visible: false, // Initially hidden
    reverse: true,
  },
  {
    title: "Nritta",
    description:
      "One of the biggest stages is set for Nritta, the dance fest which showcases the multitude of talents among the students. The fest receives participation from hundreds of students every year who come forth to perform and portray their dancing abilities in numerous dance forms while simultaneously enjoying themselves. A robust and vibrant range of colours and performances are given by various groups from across all three campuses in Bangalore along with that of the cultural teams in each of the campuses.",
    imageSrc: SoundCurry,
    altText: "Nritta",
    visible: false, // Initially hidden
    reverse: false,
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
