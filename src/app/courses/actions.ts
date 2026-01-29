
// src/app/courses/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { addCourse, updateCourse, deleteCourse } from '@/lib/store'; // These now point to async API calls
import type { Course } from '@/lib/types';

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorDetails?: string;
}

export async function addCourseAction(
  courseData: Omit<Course, 'id'>,
  affectedPaths: string[] = []
): Promise<ActionResult<Course>> {
  if (!courseData.code || !courseData.name || typeof courseData.creditHours !== 'number' || courseData.creditHours <= 0) {
    return { success: false, error: 'Course code, name, and positive numeric credit hours are required.' };
  }
  try {
    const newCourse = await addCourse(courseData); 
    affectedPaths.forEach(path => revalidatePath(path));
    revalidatePath('/courses');
    revalidatePath('/'); 
    return { success: true, data: newCourse };
  } catch (error) {
    const typedError = error as Error & { details?: string };
    return { 
      success: false, 
      error: 'Failed to add course. Please ensure the backend is running and the database is configured correctly.',
      errorDetails: typedError.message + (typedError.details ? ` Server detail: ${typedError.details}` : '')
    };
  }
}

export async function updateCourseAction(
  courseData: Course,
  affectedPaths: string[] = []
): Promise<ActionResult<Course>> {
   if (!courseData.id || !courseData.code || !courseData.name || typeof courseData.creditHours !== 'number' || courseData.creditHours <= 0) {
    return { success: false, error: 'Valid course ID, code, name, and positive numeric credit hours are required for update.' };
  }
  try {
    const updated = await updateCourse(courseData);
    if (!updated) {
      return { success: false, error: 'Course not found for update or no changes made.' };
    }
    affectedPaths.forEach(path => revalidatePath(path));
    revalidatePath('/courses');
    revalidatePath('/'); 
    return { success: true, data: updated };
  } catch (error) {
    const typedError = error as Error & { details?: string };
    return { 
      success: false, 
      error: 'Failed to update course. Please check server logs and database connection.',
      errorDetails: typedError.message + (typedError.details ? ` Server detail: ${typedError.details}` : '')
    };
  }
}

export async function deleteCourseAction(
  courseId: string,
  affectedPaths: string[] = []
): Promise<ActionResult<boolean>> {
  if (!courseId) {
    return { success: false, error: 'Course ID is required for deletion.' };
  }
  try {
    const success = await deleteCourse(courseId);
    if (!success) {
      // This condition might change depending on how your API handles "not found" for DELETE
      return { success: false, error: 'Course not found or failed to delete.' };
    }
    affectedPaths.forEach(path => revalidatePath(path));
    revalidatePath('/courses');
    revalidatePath('/'); 
    return { success: true, data: true };
  } catch (error) {
    const typedError = error as Error & { details?: string };
    return { 
      success: false, 
      error: 'Failed to delete course. Please check server logs.',
      errorDetails: typedError.message + (typedError.details ? ` Server detail: ${typedError.details}` : '')
    };
  }
}
