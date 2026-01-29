
export interface Identifiable {
  id: string;
}

export interface Named extends Identifiable {
  name: string;
}

export type Instructor = Named;
export type TA = Named;
export type Room = Named & { capacity?: number };

export interface Course {
  id: string;
  code: string;
  name: string;
  creditHours: number;
  group?: string;
}

export interface TimeSlot extends Identifiable {
  day: string; // "Sunday", "Monday", ...
  startTime: string; // "08:00"
  endTime: string; // "10:00"
  // display: string; // "Sunday 08:00 AM - 10:00 AM"
}

export interface ScheduleEntry {
  id: string;
  courseId: string;
  section?: string;
  instructorId: string;
  taId?: string;
  roomId: string;
  timeSlotId: string;
}

// For UI display convenience, combining data
export interface FullScheduleEntry extends Omit<ScheduleEntry, 'courseId' | 'instructorId' | 'taId' | 'roomId' | 'timeSlotId'> {
  id: string;
  section?: string;
  course?: Course;
  instructor: Instructor;
  ta?: TA;
  room: Room;
  timeSlot: TimeSlot;
}

export type DayOfWeek = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";

export const AFFECTED_PATHS = {
  dashboard: "/",
  addSchedule: "/schedule/add",
  courses: "/courses",
  viewSchedule: "/schedule/view", // Added new path
};

