import React, { SVGProps, useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { Calendar } from "@heroui/react";
import { today, getLocalTimeZone, parseDate } from "@internationalized/date";
import { FaCalendarAlt, FaInfoCircle, FaGuitar, FaKeyboard, FaMicrophone } from "react-icons/fa";
import axios from "axios";

// Define SVG icon props
export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Table columns
const columns = [
  { key: "name", name: "INSTRUMENT NAME" },
  { key: "category", name: "CATEGORY" },
  { key: "availability", name: "AVAILABILITY" },
  { key: "returnDate", name: "RETURN DATE" },
  { key: "actions", name: "ACTIONS" },
];

// Equipment type
type EquipmentType = {
  id: number;
  name: string;
  category: string;
  availability: string;
  returnDate: string;
};

// Equipment data
const equipmentIcons: { [key: string]: JSX.Element } = {
  guitar: <FaGuitar />,
  keyboard: <FaKeyboard />,
  mic: <FaMicrophone />,
};

// Equipment table component
const TableEquip = () => {
  const [equipment, setEquipment] = useState<EquipmentType[]>([
    {
      id: 1,
      name: "Guitar",
      category: "guitar",
      availability: "Available",
      returnDate: "N/A",
    },
    {
      id: 2,
      name: "Keyboard",
      category: "keyboard",
      availability: "Booked",
      returnDate: "2024-03-10",
    },
    {
      id: 3,
      name: "Microphone",
      category: "mic",
      availability: "Available",
      returnDate: "N/A",
    },
  ]);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | null>(null);
  const [isStartDateModalOpen, setStartDateModalOpen] = useState(false);
  const [isEndDateModalOpen, setEndDateModalOpen] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [isBookingConfirmModalOpen, setBookingConfirmModalOpen] = useState(false);
  const [startDate, setStartDate] = useState(today(getLocalTimeZone()));
  const [endDate, setEndDate] = useState(today(getLocalTimeZone()));

  // Fetch equipment from API
  const fetchEquipment = async () => {
    try {
      const response = await axios.get("/api/equipment");
      setEquipment(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Initial API fetch on mount
  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleDatePick = (item: EquipmentType) => {
    setSelectedEquipment(item);
    setStartDateModalOpen(true);
  };

  const handleDetails = (item: EquipmentType) => {
    setSelectedEquipment(item);
    setDetailsModalOpen(true);
  };

  const handleStartDateConfirm = () => {
    setStartDateModalOpen(false);
    setEndDateModalOpen(true);
  };

  const handleEndDateConfirm = () => {
    setEndDateModalOpen(false);
    setBookingConfirmModalOpen(true);
  };

  const renderCell = (item: EquipmentType, columnKey: string) => {
    switch (columnKey) {
      case "name":
        return item.name;
      case "category":
        return equipmentIcons[item.category.toLowerCase()] || item.category;
      case "availability":
        return item.availability;
      case "returnDate":
        return item.returnDate;
      case "actions":
        return (
          <div className="flex gap-2">
            <Tooltip content="Pick Date">
              <FaCalendarAlt
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                onClick={() => handleDatePick(item)}
              />
            </Tooltip>
            <Tooltip content="Details">
              <FaInfoCircle
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                onClick={() => handleDetails(item)}
              />
            </Tooltip>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center" style={{ backgroundColor: "#000319", minHeight: "100vh" }}>
      <Table
        aria-label="Equipment Booking Table"
        className="border border-gray-300 rounded-lg shadow-md text-center bg-[#0d1a33] text-white"
      >
        <TableHeader>
          {columns.map((column) => (
            <TableColumn key={column.key} className="bg-[#1a2a47] font-semibold">
              {column.name}
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {equipment.map((item) => (
            <TableRow key={item.id} style={{ height: "50px" }}>
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {renderCell(item, column.key)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedEquipment && (
        <Modal isOpen={isStartDateModalOpen} onOpenChange={setStartDateModalOpen}>
          <ModalContent>
            <ModalHeader>Pick Start Date for {selectedEquipment.name}</ModalHeader>
            <ModalBody>
              <Calendar
                aria-label="Start Date Picker"
                defaultValue={startDate}
                minValue={
                  selectedEquipment.availability === "Booked"
                    ? parseDate(selectedEquipment.returnDate).add({ days: 1 })
                    : today(getLocalTimeZone())
                }
                onChange={setStartDate}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={handleStartDateConfirm}>
                Next
              </Button>
              <Button color="secondary" onPress={() => setStartDateModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {selectedEquipment && (
        <Modal isOpen={isEndDateModalOpen} onOpenChange={setEndDateModalOpen}>
          <ModalContent>
            <ModalHeader>Pick End Date for {selectedEquipment.name}</ModalHeader>
            <ModalBody>
              <Calendar
                aria-label="End Date Picker"
                defaultValue={endDate}
                minValue={startDate}
                onChange={setEndDate}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={handleEndDateConfirm}>
                Book
              </Button>
              <Button color="secondary" onPress={() => setEndDateModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {selectedEquipment && (
        <Modal isOpen={isDetailsModalOpen} onOpenChange={setDetailsModalOpen}>
          <ModalContent>
            <ModalHeader>Details for {selectedEquipment.name}</ModalHeader>
            <ModalBody>
              <p><strong>Name:</strong> {selectedEquipment.name}</p>
              <p><strong>Category:</strong> {selectedEquipment.category}</p>
              <p><strong>Availability:</strong> {selectedEquipment.availability}</p>
              <p><strong>Return Date:</strong> {selectedEquipment.returnDate}</p>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={() => setDetailsModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {selectedEquipment && (
        <Modal isOpen={isBookingConfirmModalOpen} onOpenChange={setBookingConfirmModalOpen}>
          <ModalContent>
            <ModalHeader>Confirm Booking</ModalHeader>
            <ModalBody>
              <p>Are you sure you want to book the {selectedEquipment.name} from {startDate.toString()} to {endDate.toString()}?</p>
            </ModalBody>
            <ModalFooter>
              <Button color="success" onPress={() => setBookingConfirmModalOpen(false)}>
                Confirm
              </Button>
              <Button color="danger" onPress={() => setBookingConfirmModalOpen(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
};

export default TableEquip;
