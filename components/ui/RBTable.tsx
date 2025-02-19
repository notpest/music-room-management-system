import React, { useState, useEffect, ChangeEvent } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import axios from "axios";

// Interfaces
interface Slot {
  id: number;
  slot_start: Date;
  slot_end: Date;
  status: string;
  band_id?: string;
  band_name?: string;
}

interface Bookings {
  [key: string]: string;
}

interface Day {
  key: string;
  display: string;
}

interface TimeSlot {
  key: string;
  display: string;
}

// Utility functions to generate consistent keys
const formatDayKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTimeKey = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Helper: Given any date, return the Monday of that week
const getMonday = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday (0)
  return new Date(date.setDate(diff));
};

const RBTable = () => {
  // API slots and booking mapping
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Bookings>({});
  // Days and times for the current week view
  const [days, setDays] = useState<Day[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  // Week navigation: currentWeekStart is the Monday of the week to display.
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));

  // Modal and booking states
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  // "book" = booking modal; "alreadyBooked" = error modal
  const [modalType, setModalType] = useState<"book" | "alreadyBooked" | null>(null);
  const [selectedDayKey, setSelectedDayKey] = useState<string>("");
  const [selectedTimeKey, setSelectedTimeKey] = useState<string>("");
  const [bandId, setBandId] = useState<string>("");
  const [bookingStartTime, setBookingStartTime] = useState<string>("");
  const [bookingEndTime, setBookingEndTime] = useState<string>("");

  // New states to hold default values for placeholders
  const [defaultStartTime, setDefaultStartTime] = useState<string>("");
  const [defaultEndTime, setDefaultEndTime] = useState<string>("");

  // Week Picker Modal states
  const [weekPickerOpen, setWeekPickerOpen] = useState(false);
  const [tempWeekDate, setTempWeekDate] = useState<string>("");
  
  // Fetch slots from API
  const fetchSlots = async () => {
    try {
      const response = await axios.get("/api/slots");
      setSlots(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Initial API fetch on mount
  useEffect(() => {
    fetchSlots();
  }, []);

  // Generate time slots (same for every day)
  const generateTimeSlots = (): TimeSlot[] => {
    return [
      { key: "07:30", display: "07:30 AM" },
      { key: "09:00", display: "09:00 AM" },
      { key: "10:30", display: "10:30 AM" },
      { key: "12:00", display: "12:00 PM" },
      { key: "13:30", display: "01:30 PM" },
      { key: "15:00", display: "03:00 PM" },
      { key: "16:30", display: "04:30 PM" },
      { key: "18:00", display: "06:00 PM" },
      { key: "19:30", display: "07:30 PM" },
    ];
  };

  // Helper function: Given a start time (HH:mm), return the end time (90 minutes later) in HH:MM AM/PM format.
  const calculateEndTime = (startTime: string): string => {
    const [hourStr, minuteStr] = startTime.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    date.setMinutes(date.getMinutes() + 90);
    const endHour = date.getHours();
    const endMinute = date.getMinutes().toString().padStart(2, "0");
    const period = endHour >= 12 ? "PM" : "AM";
    const formattedHour = ((endHour % 12) || 12).toString().padStart(2, "0");
    return `${formattedHour}:${endMinute} ${period}`;
  };

  // Generate week days (Monday to Sunday) based on currentWeekStart
  const generateWeekDays = (weekStart: Date): Day[] => {
    const daysArray: Day[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      daysArray.push({
        key: formatDayKey(d),
        display: d.toLocaleDateString("en-US", {
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).replace(",", " -"),
      });
    }
    return daysArray;
  };

  // When slots or the selected week change, rebuild the days, times and booking mapping.
  useEffect(() => {
    const weekDays = generateWeekDays(currentWeekStart);
    const defaultTimeSlots = generateTimeSlots();
    const defaultBookings: Bookings = {};

    // Override with API slots (if any fall within the week), marking all time cells that fall within the booking range.
    slots.forEach((slot) => {
      const slotStart = new Date(slot.slot_start);
      const slotEnd = new Date(slot.slot_end);
      // Loop over each day in the week
      weekDays.forEach((day) => {
        // Only process the day if it matches the slot's day.
        if (day.key === formatDayKey(slotStart)) {
          defaultTimeSlots.forEach((time) => {
            // Construct the Date for this cell by combining the day and time.
            const [dYear, dMonth, dDay] = day.key.split("-").map(Number);
            const [tHour, tMinute] = time.key.split(":").map(Number);
            const cellDateTime = new Date(dYear, dMonth - 1, dDay, tHour, tMinute);
            // If the cell's time falls within the slot's range, mark it as booked.
            if (cellDateTime >= slotStart && cellDateTime < slotEnd) {
              const bookingKey = `${day.key}-${time.key}`;
              defaultBookings[bookingKey] = slot.status;
            }
          });
        }
      });
    });

    // Fill in defaults for each cell if not overridden
    weekDays.forEach((day) => {
      defaultTimeSlots.forEach((time) => {
        const key = `${day.key}-${time.key}`;
        if (!defaultBookings[key]) {
          defaultBookings[key] = "available";
        }
      });
    });

    setDays(weekDays);
    setTimeSlots(defaultTimeSlots);
    setBookings(defaultBookings);
  }, [slots, currentWeekStart]);

  // Colors for booked slots
  const bandColors: { [key: string]: string } = {
    "a5631eb3-94a8-4012-9471-2f06565d82fe": "rgba(70, 130, 180, 0.4)", // Midnight Hours (Steel Blue)
    "66428c87-b0ee-4f72-a7b6-806465924d48": "rgba(128, 0, 128, 0.4)", // Grey Matter (Purple)
    "2ab048a7-5abb-4220-bec7-1011cf1e0aa0": "rgba(255, 165, 0, 0.4)", // Vismrit (Orange)
    "404e8947-9c73-4e74-85d5-cd86de4dd631": "rgba(252, 50, 50, 0.4)", // University Choir (Forest Green)
    "ec5fb5f7-8be6-4ee1-830c-9fcdf918d742": "rgba(248, 7, 56, 0.4)", // CUB (Crimson)
  };

  // Get cell styling based on booking status
  const getCellStyle = (
    booking: string | undefined,
    band_id?: string,
    band_name?: string
  ): React.CSSProperties => {
    if (booking?.toLowerCase() === "available") {
      return {
        backgroundColor: "rgba(0, 255, 0, 0.1)",
        color: "rgba(0, 255, 0, 0.8)",
        backdropFilter: "blur(8px)",
      };
    }
    if (booking?.toLowerCase() === "booked" && band_id && band_name) {
      return {
        backgroundColor: bandColors[band_id] || "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(8px)",
        color: "black",
      };
    }
    return {};
  };

  // When a cell is clicked, open either a booking modal or an error modal.
  const handleCellClick = (dayKey: string, timeKey: string, display: string) => {
    const booking = bookings[`${dayKey}-${timeKey}`];
    if (booking?.toLowerCase() === "booked") {
      setModalType("alreadyBooked");
      setSelectedSlot(display);
      setModalOpen(true);
    } else {
      setModalType("book");
      setSelectedSlot(display);
      setSelectedDayKey(dayKey);
      setSelectedTimeKey(timeKey);
      // Set default start and end times based on the selected slot.
      const startIndex = timeSlots.findIndex((ts) => ts.key === timeKey);
      const defaultStart = timeKey;
      const defaultEnd = timeSlots[startIndex + 1]
        ? timeSlots[startIndex + 1].key
        : timeKey; // fallback if there is no next slot
      setBookingStartTime(defaultStart);
      setBookingEndTime(defaultEnd);
      setDefaultStartTime(defaultStart);
      setDefaultEndTime(defaultEnd);
      setModalOpen(true);
    }
  };

  // Helper: Parse a 12‑hour time string (e.g. "07:30 AM") into an object { hour, minute }
  const parseTime12 = (timeStr: string): { hour: number; minute: number } | null => {
    const regex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
    const match = timeStr.match(regex);
    if (!match) return null;
    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const meridiem = match[3].toUpperCase();
    if (meridiem === "PM" && hour < 12) {
      hour += 12;
    }
    if (meridiem === "AM" && hour === 12) {
      hour = 0;
    }
    return { hour, minute };
  };

  const handleBookingConfirm = async () => {
    // Validate using keys instead of display values
    const validStart = timeSlots.some((ts) => ts.key === bookingStartTime);
    const validEnd = timeSlots.some((ts) => ts.key === bookingEndTime);
    if (!validStart || !validEnd) {
      alert("One or both time slots are invalid.");
      return;
    }

    // Look up the display values to pass to parseTime12
    const startSlot = timeSlots.find((ts) => ts.key === bookingStartTime);
    const endSlot = timeSlots.find((ts) => ts.key === bookingEndTime);
    if (!startSlot || !endSlot) {
      alert("Invalid time slot selection.");
      return;
    }

    const startParsed = parseTime12(startSlot.display);
    const endParsed = parseTime12(endSlot.display);
    if (!startParsed || !endParsed) {
      alert("Invalid time format. Please use HH:MM AM/PM format.");
      return;
    }

    const [year, month, day] = selectedDayKey.split("-").map(Number);
    const [startHour, startMinute] = bookingStartTime.split(":").map(Number);
    const [endHour, endMinute] = bookingEndTime.split(":").map(Number);
    const localSlotStart = new Date(year, month - 1, day, startHour, startMinute);
    const localSlotEnd = new Date(year, month - 1, day, endHour, endMinute);

    const adjustedSlotStart = localSlotStart;
    const adjustedSlotEnd = localSlotEnd;

    try {
      await axios.post("/api/requests", {
        user_id: bandId,
        status: "pending",
        slot_start: adjustedSlotStart.toISOString(),
        slot_end: adjustedSlotEnd.toISOString(),
        band_id: bandId,
      });
      setModalOpen(false);
      setBandId("");
      setBookingStartTime("");
      setBookingEndTime("");
      fetchSlots();
    } catch (error) {
      console.error("Error creating slot request:", error);
      alert("Error creating slot request.");
    }
  };

  // Week navigation functions
  const handlePrevWeek = () => {
    setCurrentWeekStart(new Date(currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000));
  };

  // When the user selects a date from the week picker, update the current week (to that date’s Monday)
  const handleWeekSelect = () => {
    if (tempWeekDate) {
      const chosenDate = new Date(tempWeekDate);
      setCurrentWeekStart(getMonday(chosenDate));
      setWeekPickerOpen(false);
    }
  };

  const mergedCells = React.useMemo(() => {
    if (days.length === 0 || timeSlots.length === 0) return {};
    // Build a raw data matrix: for each day, an array (one per time slot)
    const rawData: { [dayKey: string]: Array<{ booking: string; band_id?: string; band_name?: string }> } = {};
    days.forEach((day) => {
      rawData[day.key] = timeSlots.map((time) => {
        const bookingKey = `${day.key}-${time.key}`;
        const bookingStatus = bookings[bookingKey];
        const [dYear, dMonth, dDay] = day.key.split("-").map(Number);
        const [tHour, tMinute] = time.key.split(":").map(Number);
        const cellDateTime = new Date(dYear, dMonth - 1, dDay, tHour, tMinute);
        const apiSlot = slots.find((s) => {
          const slotStart = new Date(s.slot_start);
          const slotEnd = new Date(s.slot_end);
          return cellDateTime >= slotStart && cellDateTime < slotEnd;
        });
        return {
          booking: bookingStatus,
          band_id: apiSlot?.band_id,
          band_name: apiSlot?.band_name,
        };
      });
    });

    // Now compute merge information per day:
    // For each day: if the cell is booked and its previous cell (if any) is booked by the same band,
    // then mark it as merged (show: false). Otherwise, count how many consecutive cells (rows)
    // have the same booked slot.
    const mergeInfo: {
      [dayKey: string]: Array<{ show: boolean; rowSpan: number; data: { booking: string; band_id?: string; band_name?: string } }>;
    } = {};
    Object.keys(rawData).forEach((dayKey) => {
      mergeInfo[dayKey] = [];
      const cells = rawData[dayKey];
      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        if (cell.booking?.toLowerCase() !== "booked" || !cell.band_id) {
          // For "available" or non‑booked cells, no merging is needed.
          mergeInfo[dayKey][i] = { show: true, rowSpan: 1, data: cell };
        } else {
          // For booked cells, check if the previous cell is booked with the same band.
          if (
            i > 0 &&
            rawData[dayKey][i - 1].booking?.toLowerCase() === "booked" &&
            rawData[dayKey][i - 1].band_id === cell.band_id
          ) {
            mergeInfo[dayKey][i] = { show: false, rowSpan: 0, data: cell };
          } else {
            // Count how many consecutive rows have the same booked slot.
            let span = 1;
            for (let j = i + 1; j < cells.length; j++) {
              const nextCell = cells[j];
              if (nextCell.booking?.toLowerCase() === "booked" && nextCell.band_id === cell.band_id) {
                span++;
              } else {
                break;
              }
            }
            mergeInfo[dayKey][i] = { show: true, rowSpan: span, data: cell };
            // Mark subsequent rows as merged.
            for (let j = i + 1; j < i + span; j++) {
              mergeInfo[dayKey][j] = { show: false, rowSpan: 0, data: cells[j] };
            }
          }
        }
      }
    });
    return mergeInfo;
  }, [days, timeSlots, bookings, slots]);

  return (
    <div className="flex flex-col items-center" style={{ backgroundColor: "#000319", minHeight: "100vh" }}>
      {/* Navigation Controls */}
      <div className="flex items-center my-4 space-x-4">
        <Button onPress={handlePrevWeek}>←</Button>
        <div className="text-white">
          Slots of{" "}
          {currentWeekStart.toLocaleDateString("en-US", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </div>
        <Button onPress={handleNextWeek}>→</Button>
        <Button onPress={() => setWeekPickerOpen(true)}>Pick Week</Button>
      </div>

      {/* Booking Table */}
      <Table className="border border-gray-300 rounded-lg shadow-md text-center bg-[#0d1a33] text-white">
        <TableHeader>
          {[
            <TableColumn key="time" className="bg-[#1a2a47] font-semibold">
              Time
            </TableColumn>,
          ].concat(
            days.map((day) => (
              <TableColumn key={day.key} className="bg-[#1a2a47] font-semibold">
                {day.display}
              </TableColumn>
            ))
          )}
        </TableHeader>
        
        <TableBody>
          {timeSlots.map((time, rowIndex) => (
            <TableRow key={time.key} style={{ height: "50px" }}>
              {[
                <TableCell
                  key={`time-${time.key}`}
                  style={{
                    position: "relative",
                    padding: 0,
                  }}
                >
                  {(rowIndex === 0 ||
                    time.display !== calculateEndTime(timeSlots[rowIndex - 1].key)) && (
                    <span
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        textAlign: "center",
                        transform: rowIndex === 0 ? "none" : "translateY(-50%)",
                        padding: "0 4px",
                      }}
                    >
                      {time.display}
                    </span>
                  )}
                  <span
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      textAlign: "center",
                      transform:
                        rowIndex === timeSlots.length - 1 ? "none" : "translateY(50%)",
                      padding: "0 4px",
                    }}
                  >
                    {calculateEndTime(time.key)}
                  </span>
                </TableCell>,
              ].concat(
                days.map((day) => {
                  const mergeData = mergedCells[day.key] && mergedCells[day.key][rowIndex];
                  if (!mergeData || !mergeData.show) {
                    return (
                      <TableCell
                        key={`${day.key}-${time.key}`}
                        style={{ display: "none" }}
                      />
                    );
                  }
                  return (
                    <TableCell
                      key={`${day.key}-${time.key}`}
                      rowSpan={mergeData.rowSpan}
                      style={{
                        ...getCellStyle(
                          mergeData.data.booking,
                          mergeData.data.band_id,
                          mergeData.data.band_name
                        ),
                        verticalAlign: "middle",
                        textAlign: "center",
                        border: "0.3px solid rgba(0, 0, 0, 0.2)",
                      }}
                      onClick={() =>
                        handleCellClick(
                          day.key,
                          time.key,
                          `${day.display} at ${time.display}`
                        )
                      }
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.filter = "brightness(0.8)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.filter = "")
                      }
                    >
                      {mergeData.data.booking?.toLowerCase() === "booked"
                        ? mergeData.data.band_name
                        : mergeData.data.booking?.toLowerCase() === "available"
                        ? "Available"
                        : mergeData.data.booking || "Available"}
                    </TableCell>
                  );
                })
              )}
            </TableRow>                      
          ))}
        </TableBody>
      </Table>
      {/* Booking / Already‑Booked Modal */}
      <Modal isOpen={isModalOpen} onOpenChange={setModalOpen}>
        <ModalContent>
          {modalType === "alreadyBooked" ? (
            <>
              <ModalHeader>Slot Already Booked</ModalHeader>
              <ModalBody>
                <p>{`The slot on ${selectedSlot} is already booked.`}</p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={() => setModalOpen(false)}>
                  Close
                </Button>
              </ModalFooter>
            </>
          ) : modalType === "book" ? (
            <>
              <ModalHeader>Request Slot</ModalHeader>
              <ModalBody>
                <Input
                  isClearable
                  variant="underlined"
                  fullWidth
                  label="Band ID"
                  placeholder="Enter your Band ID"
                  value={bandId}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setBandId(e.target.value)
                  }
                  onClear={() => setBandId("")}
                />
                {/* Dropdown for selecting Slot Start Time */}
                <Select
                  label="Slot Start Time"
                  placeholder={defaultStartTime}
                  selectedKeys={new Set([bookingStartTime])}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    if (timeSlots.some((ts) => ts.key === selected)) {
                      setBookingStartTime(selected);
                    } else {
                      alert("Invalid time slot selected");
                    }
                  }}
                >
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.key} value={slot.key}>
                      {slot.display}
                    </SelectItem>
                  ))}
                </Select>
                {/* Dropdown for selecting Slot End Time */}
                <Select
                label="Slot End Time"
                placeholder={defaultEndTime}
                selectedKeys={new Set([bookingEndTime])}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  if (timeSlots.some((ts) => ts.key === selected) || selected === "21:00") {
                    setBookingEndTime(selected);
                  } else {
                    alert("Invalid time slot selected");
                  }
                }}
              >
                <>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.key} value={slot.key}>
                      {slot.display}
                    </SelectItem>
                  ))}
                  {/* Append extra option for 9:00 PM */}
                  <SelectItem key="21:00" value="21:00">
                    09:00 PM
                  </SelectItem>
                </>
              </Select>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="success"
                  onPress={() => {
                    // Validate that both times exist in the valid timeSlots list
                    const validStart = timeSlots.some(
                      (ts) => ts.key === bookingStartTime
                    );
                    const validEnd = timeSlots.some(
                      (ts) => ts.key === bookingEndTime
                    );
                    if (!validStart || !validEnd) {
                      alert("One or both time slots are invalid.");
                      return;
                    }
                    handleBookingConfirm();
                  }}
                >
                  Confirm
                </Button>
              </ModalFooter>
            </>
          ) : null}
        </ModalContent>
      </Modal>

      {/* Week Picker Modal */}
      <Modal isOpen={weekPickerOpen} onOpenChange={setWeekPickerOpen}>
        <ModalContent>
          <ModalHeader>Select Week</ModalHeader>
          <ModalBody>
            <Input
              type="date"
              fullWidth
              label="Select a Date"
              placeholder="Choose a date"
              value={tempWeekDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTempWeekDate(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onPress={() => setWeekPickerOpen(false)}>
              Cancel
            </Button>
            <Button color="success" onPress={handleWeekSelect}>
              Select
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RBTable;
