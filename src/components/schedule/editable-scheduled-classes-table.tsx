'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { TimeSlot } from '../../lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, X } from 'lucide-react';
import { getTimeSlot } from "@/lib/store";

export function EditableScheduledClassesTable({
                                                scheduledEntries,
                                                courses,
                                                instructors: initialInstructors,
                                                tas,
                                              }: {
  scheduledEntries: any[];
  courses: any[];
  instructors: any[];
  tas: any[];
}) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);



  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const slots = await getTimeSlot();
        setTimeSlots(slots);
      } catch (error) {
        console.error('Failed to load time slots:', error);
      }
    };

    fetchTimeSlots();
  }, []);

  const { toast } = useToast();
  const [editableEntries, setEditableEntries] = useState(() => {
    // Normalize the data structure when initializing
    return scheduledEntries.map(entry => ({
      ...entry,
      courseId: entry.courseId || entry.course?.id,
      instructorId: entry.instructorId || entry.instructor?.id,
      taId: entry.taId || entry.ta?.id,
      roomId: entry.roomId || entry.room?.id,
      timeSlotId: entry.timeSlotId || entry.timeSlot?.id,
      isModified: false // Track if this entry has been modified
    }));
  });
  const [instructors, setInstructors] = useState(initialInstructors);
  const [isSaving, setIsSaving] = useState(false);
  const [conflicts, setConflicts] = useState<Record<string, {instructor?: string, ta?: string}>>({});

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const [selectedTimeSlotFilter, setSelectedTimeSlotFilter] = useState<string>('');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('');

  const originalEntries = useState(() =>
      scheduledEntries.map(entry => ({
        ...entry,
        courseId: entry.courseId || entry.course?.id,
        instructorId: entry.instructorId || entry.instructor?.id,
        taId: entry.taId || entry.ta?.id,
        roomId: entry.roomId || entry.room?.id,
        timeSlotId: entry.timeSlotId || entry.timeSlot?.id
      }))
  )[0];



  const filteredEntries = editableEntries.filter(entry => {
    const timeSlotId = entry.timeSlotId || entry.timeSlot?.id;
    const day = entry.timeSlot?.day || entry.day;

    let matchesTimeSlot = true;
    let matchesDay = true;

    if (selectedTimeSlotFilter) {
      matchesTimeSlot = timeSlotId?.toString() === selectedTimeSlotFilter;
    }

    if (selectedDayFilter) {
      matchesDay = day === selectedDayFilter;
    }

    return matchesTimeSlot && matchesDay;
  });

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEntries = filteredEntries.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTimeSlotFilter, selectedDayFilter]);

  // const goToFirstPage = () => setCurrentPage(1);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  // const goToLastPage = () => setCurrentPage(totalPages);

  const clearFilters = () => {
    setSelectedTimeSlotFilter('');
    setSelectedDayFilter('');
  };

  const hasActiveFilters = selectedTimeSlotFilter || selectedDayFilter;

  const availableDays = [...new Set(editableEntries.map(entry =>
      entry.timeSlot?.day || entry.day
  ))].filter(Boolean);

  const getAllEntriesForConflictCheck = () => {
    return editableEntries.map(entry => {
      if (!entry.isModified) {
        // Use original data for unmodified entries
        const originalEntry = originalEntries.find(orig => orig.id === entry.id);
        return originalEntry || entry;
      }
      return entry;
    });
  };

  const detectConflicts = (allEntries: any[]) => {
    const newConflicts: Record<string, {instructor?: string, ta?: string}> = {};
    const timeSlotMap: Record<string, {instructors: Set<string>, tas: Set<string>}> = {};

    allEntries.forEach(entry => {
      const timeSlotKey = `${entry.timeSlot?.startTime}-${entry.timeSlot?.endTime}-${entry.timeSlot?.day}`;

      if (!timeSlotMap[timeSlotKey]) {
        timeSlotMap[timeSlotKey] = { instructors: new Set(), tas: new Set() };
      }

      const instructorId = entry.instructorId || entry.instructor?.id;
      if (instructorId) {
        if (timeSlotMap[timeSlotKey].instructors.has(instructorId)) {
          newConflicts[entry.id] = {
            ...newConflicts[entry.id],
            instructor: 'Instructor already booked in this time slot'
          };
        } else {
          timeSlotMap[timeSlotKey].instructors.add(instructorId);
        }
      }

      const taId = entry.taId || entry.ta?.id;
      if (taId) {
        if (timeSlotMap[timeSlotKey].tas.has(taId)) {
          newConflicts[entry.id] = {
            ...newConflicts[entry.id],
            ta: 'TA already booked in this time slot'
          };
        } else {
          timeSlotMap[timeSlotKey].tas.add(taId);
        }
      }
    });

    return newConflicts;
  };

  // Update conflict detection to run whenever editableEntries changes
  useEffect(() => {
    const allEntriesForConflictCheck = getAllEntriesForConflictCheck();
    const newConflicts = detectConflicts(allEntriesForConflictCheck);
    setConflicts(newConflicts);
  }, [editableEntries, originalEntries]);

  function isEntryComplete(entry: any) {
    const courseId = entry.courseId || entry.course?.id;
    const instructorId = entry.instructorId || entry.instructor?.id;
    const taId = entry.taId || entry.ta?.id;
    const roomId = entry.roomId || entry.room?.id;
    const timeSlotId = entry.timeSlotId || entry.timeSlot?.id;

    return courseId && instructorId && taId && roomId && timeSlotId;
  }

  const handleChange = (id: string, field: string, value: string) => {
    if (!value) return;

    setEditableEntries(prev => {
      const updatedEntries = prev.map(entry =>
          entry.id == id ? { ...entry, [field]: value, isModified: true } : entry
      );

      // Immediately check for conflicts with the updated data
      const allEntriesForConflictCheck = updatedEntries.map(entry => {
        if (!entry.isModified) {
          const originalEntry = originalEntries.find(orig => orig.id == entry.id);
          return originalEntry || entry;
        }
        return entry;
      });

      // Update conflicts immediately
      const newConflicts = detectConflicts(allEntriesForConflictCheck);
      setConflicts(newConflicts);

      return updatedEntries;
    });

    // Handle instructor teaching load updates
    if (field === 'instructorId') {
      const previousEntry = editableEntries.find(entry => entry.id === id);
      const previousInstructorId = previousEntry?.instructorId || previousEntry?.instructor?.id;

      setInstructors(prevInstructors => {
        const updatedInstructors = [...prevInstructors];

        if (previousInstructorId) {
          const prevInstructorIndex = updatedInstructors.findIndex(i => i.id === previousInstructorId);
          if (prevInstructorIndex !== -1) {
            updatedInstructors[prevInstructorIndex] = {
              ...updatedInstructors[prevInstructorIndex],
              teachingLoad: updatedInstructors[prevInstructorIndex].teachingLoad + 3
            };
          }
        }

        const newInstructorIndex = updatedInstructors.findIndex(i => i.id === value);
        if (newInstructorIndex !== -1) {
          updatedInstructors[newInstructorIndex] = {
            ...updatedInstructors[newInstructorIndex],
            teachingLoad: Math.max(0, updatedInstructors[newInstructorIndex].teachingLoad - 3)
          };
        }

        return updatedInstructors;
      });
    }
  };

  const handleSaveAll = async () => {
    if (Object.keys(conflicts).length > 0) {
      toast({
        title: "Conflict Detected",
        description: "Please resolve scheduling conflicts before saving",
        variant: "destructive",
      });
      return;
    }

    const instructorLoadIssues = editableEntries.some(entry => {
      const instructorId = entry.instructorId || entry.instructor?.id;
      if (instructorId) {
        const instructor = instructors.find(i => i.id == instructorId);
        return instructor && instructor.teachingLoad < 3;
      }
      return false;
    });

    if (instructorLoadIssues) {
      toast({
        title: "Invalid Teaching Load",
        description: "One or more instructors don't have sufficient teaching load",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const dataToSave = editableEntries.map(entry => ({
        id: entry.id,
        courseId: entry.courseId || entry.course?.id,
        instructorId: entry.instructorId || entry.instructor?.id,
        taId: entry.taId || entry.ta?.id,
        roomId: entry.roomId || entry.room?.id,
        timeSlotId: entry.timeSlotId || entry.timeSlot?.id
      }));

      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) throw new Error('Failed to save changes');

      toast({
        title: "Success",
        description: "All schedule entries updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  function isInstructorBooked(instructorId: string, currentEntry: any) {
    const allBookings: any[] = [];
    editableEntries.forEach(entry => {
      if (entry.id == currentEntry.id) return;

      let entryToCheck;
      if (entry.isModified) {
        entryToCheck = entry;
      } else {
        entryToCheck = originalEntries.find(orig => orig.id == entry.id) || entry;
      }

      allBookings.push(entryToCheck);
    });

    return allBookings.some(entry => {
      const entryInstructorId = entry.instructor?.id || entry.instructorId;

      if (!entryInstructorId || entryInstructorId != instructorId) return false;

      const sameTimeSlot = entry.timeSlot?.startTime == currentEntry.timeSlot?.startTime &&
          entry.timeSlot?.endTime == currentEntry.timeSlot?.endTime &&
          entry.timeSlot?.day == currentEntry.timeSlot?.day;

      return sameTimeSlot;
    });
  }

  function isTABooked(taId: string, currentEntry: any) {
    const allBookings: any[] = [];

    editableEntries.forEach(entry => {
      if (entry.id == currentEntry.id) return;

      let entryToCheck;
      if (entry.isModified) {
        // Use current modified data
        entryToCheck = entry;
      } else {
        entryToCheck = originalEntries.find(orig => orig.id == entry.id) || entry;
      }

      allBookings.push(entryToCheck);
    });

    return allBookings.some(entry => {
      const entryTaId = entry.taId || entry.ta?.id;
      if (!entryTaId || entryTaId != taId) return false;

      const sameTimeSlot = entry.timeSlot?.startTime == currentEntry.timeSlot?.startTime &&
          entry.timeSlot?.endTime == currentEntry.timeSlot?.endTime &&
          entry.timeSlot?.day == currentEntry.timeSlot?.day;

      return sameTimeSlot;
    });
  }

  return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            {/*<span className="text-sm font-medium text-gray-700">Filters:</span>*/}
            <span className="text-sm font-medium text-gray-700">Time Slot:</span>
          </div>

          <div className="flex flex-col gap-1">
            {/*<label className="text-xs text-gray-600">Time Slot</label>*/}
            <Select value={selectedTimeSlotFilter} onValueChange={(value) => setSelectedTimeSlotFilter(value === 'all' ? '' : value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All time slots" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time slots</SelectItem>
                {timeSlots.map((slot) => (
                    <SelectItem key={slot.id} value={slot.id.toString()}>
                      {slot.startTime} - {slot.endTime} ({slot.day})
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Day Filter */}
          {/*<div className="flex flex-col gap-1">*/}
          {/*  <label className="text-xs text-gray-600">Day</label>*/}
          {/*  <Select value={selectedDayFilter} onValueChange={(value) => setSelectedDayFilter(value === 'all' ? '' : value)}>*/}
          {/*    <SelectTrigger className="w-[140px]">*/}
          {/*      <SelectValue placeholder="All days" />*/}
          {/*    </SelectTrigger>*/}
          {/*    <SelectContent>*/}
          {/*      <SelectItem value="all">All days</SelectItem>*/}
          {/*      {availableDays.map((day) => (*/}
          {/*          <SelectItem key={day} value={day}>*/}
          {/*            {day}*/}
          {/*          </SelectItem>*/}
          {/*      ))}*/}
          {/*    </SelectContent>*/}
          {/*  </Select>*/}
          {/*</div>*/}

          {/* Clear Filters Button */}
          {hasActiveFilters && (

                <div>
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear Filters
                  </Button>
                </div>


          )}

          {hasActiveFilters && (
              <div className="flex gap-2 text-sm text-blue-600">
                {selectedTimeSlotFilter && (
                    <span className="bg-blue-100 px-2 py-1 rounded">
                  Time: {timeSlots.find(t => t.id.toString() === selectedTimeSlotFilter)?.startTime} - {timeSlots.find(t => t.id.toString() === selectedTimeSlotFilter)?.endTime}
                </span>
                )}
                {selectedDayFilter && (
                    <span className="bg-blue-100 px-2 py-1 rounded">
                  Day: {selectedDayFilter}
                </span>
                )}
              </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredEntries.length)} of {filteredEntries.length} entries
            {hasActiveFilters && ` (filtered from ${editableEntries.length} total)`}
          </div>
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time Slot</TableHead>
              <TableHead>Day</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Teaching Assistant</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentEntries.map((entry) => (
                <TableRow
                    key={entry.id}
                    className={
                      conflicts[entry.id]
                          ? 'bg-red-50'
                          : isEntryComplete(entry)
                              ? 'bg-blue-200'
                              : ''
                    }
                >
                  <TableCell>{entry.timeSlot?.startTime} - {entry.timeSlot?.endTime}</TableCell>
                  <TableCell>{entry.timeSlot?.day}</TableCell>
                  <TableCell>{entry.room?.name}</TableCell>
                  <TableCell>
                    <Select
                        value={entry.courseId || ''}
                        onValueChange={(value) => handleChange(entry.id, 'courseId', value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        {(() => {
                          const selectedCourse = courses.find(
                              (course) => course.id == entry.courseId || course.id == entry.course?.id
                          );
                          return selectedCourse ? (
                              <span>{selectedCourse.name}</span>
                          ) : (
                              <SelectValue placeholder="Select course" />
                          );
                        })()}
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <Select
                          value={entry.instructorId || ''}
                          onValueChange={(value) => handleChange(entry.id, 'instructorId', value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          {(() => {
                            const selectedInstructor = instructors.find(
                                (inst) => inst.id == entry.instructorId || inst.id == entry.instructor?.id
                            );
                            return selectedInstructor ? (
                                <span>{selectedInstructor.name} - Load: {selectedInstructor.teachingLoad}</span>
                            ) : (
                                <SelectValue placeholder="Select Instructor" />
                            );
                          })()}
                        </SelectTrigger>
                        <SelectContent>
                          {instructors.map((instructor) => (
                              <SelectItem
                                  key={instructor.id}
                                  value={instructor.id}
                                  disabled={isInstructorBooked(instructor.id, entry)}
                              >
                                {instructor.name} - Load: {instructor.teachingLoad}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {conflicts[entry.id]?.instructor && (
                          <p className="text-xs text-red-500 mt-1">
                            {conflicts[entry.id]?.instructor}
                          </p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <Select
                          value={entry.taId || ''}
                          onValueChange={(value) => handleChange(entry.id, 'taId', value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          {(() => {
                            const selectedTA = tas.find(
                                (ta) => ta.id == entry.taId || ta.id == entry.ta?.id
                            );

                            return selectedTA ? (
                                <span>{selectedTA.name}</span>
                            ) : (
                                <SelectValue placeholder="Select TA" />
                            );
                          })()}
                        </SelectTrigger>
                        <SelectContent>
                          {tas.map((ta) => (
                              <SelectItem
                                  key={ta.id}
                                  value={ta.id}
                                  disabled={isTABooked(ta.id, entry)}
                              >
                                {ta.name}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {conflicts[entry.id]?.ta && (
                          <p className="text-xs text-red-500 mt-1">
                            {conflicts[entry.id]?.ta}
                          </p>
                      )}
                    </div>
                  </TableCell>

                </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/*<Button*/}
            {/*    variant="outline"*/}
            {/*    size="sm"*/}
            {/*    onClick={goToFirstPage}*/}
            {/*    disabled={currentPage === 1}*/}
            {/*>*/}
            {/*  <ChevronsLeft className="h-4 w-4" />*/}
            {/*</Button>*/}
            <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            {/*<Button*/}
            {/*    variant="outline"*/}
            {/*    size="sm"*/}
            {/*    onClick={goToLastPage}*/}
            {/*    disabled={currentPage === totalPages}*/}
            {/*>*/}
            {/*  <ChevronsRight className="h-4 w-4" />*/}
            {/*</Button>*/}
          </div>

          <Button
              onClick={handleSaveAll}
              disabled={isSaving || Object.keys(conflicts).length > 0}
          >
            {isSaving ? 'Saving All Changes...' : 'Save All Changes'}
          </Button>
        </div>
      </div>
  );
}