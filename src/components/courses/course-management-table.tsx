'use client';

import type { Course } from '@/lib/types';
import { useState, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { CourseFormDialog } from './course-form-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { addCourseAction, updateCourseAction, deleteCourseAction } from '@/app/courses/actions';
import { AFFECTED_PATHS } from '@/lib/types';

interface CourseManagementTableProps {
  initialCourses: Course[];
}

export function CourseManagementTable({ initialCourses }: CourseManagementTableProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleAdd = () => {
    setSelectedCourse(null);
    setIsFormOpen(true);
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setIsFormOpen(true);
  };

  const handleDelete = async (courseId: string) => {
    startTransition(async () => {
      const result = await deleteCourseAction(courseId, [AFFECTED_PATHS.courses, AFFECTED_PATHS.dashboard]);
      if (result.success) {
        setCourses((prevCourses) => prevCourses.filter((c) => c.id !== courseId));
        toast({ title: 'Course Deleted', description: 'The course has been successfully deleted.', variant: 'default' });
      } else {
        toast({ title: 'Error', description: result.error || 'Failed to delete course.', variant: 'destructive' });
      }
    });
  };

  // const handleFormSubmit = async (values: Omit<Course, 'id'> | Course) => {
  //   startTransition(async () => {
  //     let result;
  //     if ('id' in values && values.id) { // Existing course (update)
  //       result = await updateCourseAction(values as Course, [AFFECTED_PATHS.courses, AFFECTED_PATHS.dashboard]);
  //       if (result.success && result.data) {
  //         setCourses((prevCourses) => prevCourses.map((c) => (c.id === result.data!.id ? result.data! : c)));
  //         toast({ title: 'Course Updated', description: `${result.data.name} updated successfully.`, variant: 'default' });
  //       }
  //     } else { // New course (add)
  //       result = await addCourseAction(values, [AFFECTED_PATHS.courses, AFFECTED_PATHS.dashboard]);
  //       if (result.success && result.data) {
  //         setCourses((prevCourses) => [...prevCourses, result.data!]);
  //         toast({ title: 'Course Added', description: `${result.data.name} added successfully.`, variant: 'default' });
  //       }
  //     }

  //     if (!result?.success) {
  //       toast({ title: 'Error', description: result?.error || 'Failed to save course.', variant: 'destructive' });
  //     }
  //     setIsFormOpen(false);
  //   });
  // };


  return (
    <div>
      {/* <div className="flex justify-end mb-4">
        <Button onClick={handleAdd} variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Course
        </Button>
      </div> */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Id</TableHead>
              <TableHead>Name</TableHead>
              {/* <TableHead>Credit Hours</TableHead> */}
              {/* <TableHead>Group</TableHead> */}
              {/* <TableHead className="text-right w-[120px]">Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length > 0 ? courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.id}</TableCell>
                <TableCell>{course.name}</TableCell>
                {/* <TableCell>{course.creditHours}</TableCell> */}
                {/* <TableCell>{course.group || 'N/A'}</TableCell> */}
                {/* <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(course)} className="mr-2 hover:text-accent-foreground">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the course
                          and remove it from any scheduled entries.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(course.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={isPending}
                        >
                          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell> */}
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No courses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* <CourseFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedCourse}
        isPending={isPending}
      /> */}
    </div>
  );
}
