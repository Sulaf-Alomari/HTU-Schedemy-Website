'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getInstructors, getTAs } from '@/lib/store'; // Assuming these can be fetched client-side or passed from a server component

// Define types for schedule entry, instructor, and TA
interface ScheduleEntry {
  id: string | number;
  course: { id: string | number; name: string };
  section?: string;
  room: { id: string | number; name: string };
  timeSlot: { id: string | number; name: string };
  instructorId?: string | number; // To store assigned instructor ID
  taId?: string | number; // To store assigned TA ID
}

interface Instructor {
  id: string | number;
  name: string;
}

interface TA {
  id: string | number;
  name: string;
}

export default function AssignSchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [tas, setTAs] = useState<TA[]>([] as TA[]); // Initialize as empty array with TA type

  // Fetch schedule, instructors, and TAs on component mount
  useEffect(() => {
    // TODO: Fetch generated schedule from backend API
    const fetchedSchedule: ScheduleEntry[] = [
      // Example data - replace with actual fetch
      { id: 1, course: { id: 'CS101', name: 'Introduction to Programming' }, section: '001', room: { id: 'B101', name: 'Building B, Room 101' }, timeSlot: { id: 'TS1', name: 'Mon 9:00-10:00' }, instructorId: undefined, taId: undefined },
      { id: 2, course: { id: 'MATH201', name: 'Calculus II' }, room: { id: 'A203', name: 'Building A, Room 203' }, timeSlot: { id: 'TS2', name: 'Tue 10:00-11:00' }, instructorId: undefined, taId: undefined },
    ];
    setSchedule(fetchedSchedule);

    // Fetch instructors and TAs (assuming getInstructors and getTAs are client-side or fetched elsewhere and passed)
    const fetchedInstructors = getInstructors(); // Replace with actual fetch if needed
    const fetchedTAs = getTAs(); // Replace with actual fetch if needed
    setInstructors(fetchedInstructors);
    setTAs(fetchedTAs);
  }, []);

  const handleInstructorChange = (entryId: string | number, instructorId: string) => {
    setSchedule(schedule.map(entry =>
      entry.id === entryId ? { ...entry, instructorId: instructorId } : entry
    ));
  };

  const handleTAChange = (entryId: string | number, taId: string) => {
    setSchedule(schedule.map(entry =>
      entry.id === entryId ? { ...entry, taId: taId } : entry
    ));
  };

  const handleSave = () => {
    // Send updated schedule (with assigned instructors/TAs) to backend API
    console.log("Saving assigned schedule:", schedule);
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Assign Instructors and TAs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Time Slot</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>TA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedule.map(entry => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.course.id}</TableCell>
                  <TableCell>{entry.course.name}</TableCell>
                  <TableCell>{entry.section || <span className="text-muted-foreground/70">N/A</span>}</TableCell>
                  <TableCell>{entry.room.name}</TableCell>
                  <TableCell>{entry.timeSlot.name}</TableCell>
                  <TableCell>
                    <Select onValueChange={(value) => handleInstructorChange(entry.id, value)} value={entry.instructorId?.toString()}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Instructor" />
                      </SelectTrigger>
                      <SelectContent>
                        {instructors.map(instructor => (
                          <SelectItem key={instructor.id} value={instructor.id.toString()}>
                            {instructor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select onValueChange={(value) => handleTAChange(entry.id, value)} value={entry.taId?.toString()}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select TA" />
                      <SelectContent>
                        {tas.map(ta => (
                          <SelectItem key={ta.id} value={ta.id.toString()}>
                            {ta.name}
                          </SelectItem>
                        ))}
                         <SelectItem value="">None</SelectItem> {/* Option for no TA */}
                      </SelectContent>
                      </SelectTrigger>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button className="mt-4" onClick={handleSave}>Save Assignments</Button>
        </CardContent>
      </Card>
    </div>
  );
}