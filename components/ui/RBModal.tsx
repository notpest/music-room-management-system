"use client";

import React, { useState } from "react";
import Modal from "./Modal"; // The new generic modal

const RBModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition-colors"
      >
        Open Modal
      </button>
      
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Booking Details">
        <div className="space-y-4 text-gray-300">
          <p>
            This is where the room booking details or a form would go.
          </p>
          <p>
            You can add any content here, like booking forms, information, or confirmation messages. 
            The modal is built with Tailwind CSS and Framer Motion for a clean look and smooth animations.
          </p>
          <div className="flex justify-end space-x-4 pt-4">
            <button 
              onClick={() => setIsOpen(false)}
              className="px-6 py-2 bg-gray-700 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition-colors"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RBModal;
