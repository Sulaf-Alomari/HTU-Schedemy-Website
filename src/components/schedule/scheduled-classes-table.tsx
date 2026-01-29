
'use client';

import type { FullScheduleEntry } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ScheduledClassesTableProps {
  scheduledEntries: FullScheduleEntry[];
}

export function ScheduledClassesTable({ scheduledEntries }: ScheduledClassesTableProps) {

  if (!scheduledEntries || scheduledEntries.length == 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No classes have been scheduled yet.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course Code</TableHead>
            <TableHead>Course Name</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Instructor</TableHead>
            <TableHead>TA</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Time Slot</TableHead>
            <TableHead>Day</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scheduledEntries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">{entry.id}</TableCell>
              <TableCell>{entry.course ? entry.course.name : '' }</TableCell>
              <TableCell>{entry.section || <span className="text-muted-foreground/70">N/A</span>}</TableCell>
              <TableCell>{entry.instructor?.name ?? ''}</TableCell>
              <TableCell>{entry.ta?.name ?? ''} </TableCell>
              <TableCell>{entry.room.name}</TableCell>
              <TableCell><TableCell>{entry.timeSlot.startTime} - {entry.timeSlot.endTime}</TableCell></TableCell>
              <TableCell>{entry.timeSlot.day}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
