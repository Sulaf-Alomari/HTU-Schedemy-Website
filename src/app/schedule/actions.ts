
'use server';

import { revalidatePath } from 'next/cache';
import { addScheduleEntry, getCourseById, getInstructorById, getTARById, getRoomById, getTimeSlotById } from '@/lib/store'; 
import type { ScheduleEntry, Course, Instructor, TA, Room, TimeSlot } from '@/lib/types';
import { AFFECTED_PATHS } from '@/lib/types';

interface AddScheduleEntryResult {
  success: boolean;
  data?: {
    entry: ScheduleEntry;
    course: Course;
    instructor: Instructor;
    ta?: TA;
    room: Room;
    timeSlot: TimeSlot;
  };
  error?: string;
}

export async function addScheduleEntryAction(
  formData: Omit<ScheduleEntry, 'id'>,
  affectedPaths: string[] = []
): Promise<AddScheduleEntryResult> {
  
  // Validate required fields (server-side check, mostly for robustness)
  if (!formData.courseId || !formData.instructorId || !formData.roomId || !formData.timeSlotId) {
    return { success: false, error: 'Missing required fields.' };
  }

  // // Perform conflict check
  // const conflictMessage = checkForConflicts(formData);
  // if (conflictMessage) {
  //   return { success: false, error: conflictMessage };
  // }

  try {
    const newEntry = addScheduleEntry(formData);
    
    // Fetch details for the toast message/response using direct store functions
    const course = getCourseById(newEntry.courseId);
    const instructor = getInstructorById(newEntry.instructorId); 
    const ta = newEntry.taId ? getTARById(newEntry.taId) : undefined; 
    const room = getRoomById(newEntry.roomId); 
    const timeSlot = getTimeSlotById(newEntry.timeSlotId); 

    if (!course || !instructor || !room || !timeSlot) {
      // This case should ideally not happen if data integrity is maintained
      console.error("Failed to retrieve full details for new schedule entry:", newEntry);
      return { success: false, error: 'Data inconsistency after adding entry.' };
    }
    
    // Revalidate paths
    const pathsToRevalidate = [...new Set([...affectedPaths, AFFECTED_PATHS.dashboard, AFFECTED_PATHS.addSchedule, AFFECTED_PATHS.viewSchedule])];
    pathsToRevalidate.forEach(path => revalidatePath(path));


    return { 
      success: true, 
      data: { 
        entry: newEntry,
        course,
        instructor,
        ta,
        room,
        timeSlot
      } 
    };
  } catch (error) {
    console.error('Failed to add schedule entry:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred.' };
  }
}
