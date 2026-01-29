import type { Instructor, TA, Room, Course, TimeSlot, DayOfWeek } from './types';

export const instructors: Instructor[] = [
  { id: 'inst1', name: 'Dr. Alan Turing' },
  { id: 'inst2', name: 'Dr. Marie Curie' },
  { id: 'inst3', name: 'Dr. Isaac Newton' },
  { id: 'inst4', name: 'Dr. Ada Lovelace' },
];

export const tas: TA[] = [
  { id: 'ta1', name: 'John Doe' },
  { id: 'ta2', name: 'Jane Smith' },
  { id: 'ta3', name: 'Robert Paulson' },
];

export const rooms: Room[] = [
  { id: 'room1', name: 'Room 101', capacity: 50 },
  { id: 'room2', name: 'Room 102 (Lab)', capacity: 30 },
  { id: 'room3', name: 'Room 205', capacity: 60 },
  { id: 'room4', name: 'Auditorium A', capacity: 150 },
];

export const courses: Course[] = [
  { id: 'crs1', code: 'CS101', name: 'Introduction to Computer Science', creditHours: 3, group: 'Core' },
  { id: 'crs2', code: 'PHY201', name: 'Classical Mechanics', creditHours: 4, group: 'Physics Core' },
  { id: 'crs3', code: 'BIO105', name: 'Principles of Biology', creditHours: 3, group: 'Biology Core' },
  { id: 'crs4', code: 'MAT300', name: 'Advanced Calculus', creditHours: 3, group: 'Math Elective' },
];

export const daysOfWeek: DayOfWeek[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

export const timeSlotPeriods: { startTime: string, endTime: string }[] = [
    { startTime: "08:00", endTime: "10:00" },
    { startTime: "10:00", endTime: "12:00" },
    { startTime: "13:00", endTime: "15:00" },
    { startTime: "15:00", endTime: "17:00" },
];

export const timeSlots: TimeSlot[] = daysOfWeek.flatMap((day, dayIndex) => 
  timeSlotPeriods.map((period, periodIndex) => {
    const id = `ts-${dayIndex}-${periodIndex}`;
    const startTimeAMPM = new Date(`1970-01-01T${period.startTime}:00`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const endTimeAMPM = new Date(`1970-01-01T${period.endTime}:00`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return {
      id,
      day,
      startTime: period.startTime,
      endTime: period.endTime,
      display: `${day} ${startTimeAMPM} - ${endTimeAMPM}`,
    };
  })
);
