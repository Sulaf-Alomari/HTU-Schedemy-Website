'use client';

import type { FormEvent } from 'react';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { Course, Instructor, TA, Room, TimeSlot } from '@/lib/types';
import { addScheduleEntryAction } from '@/app/schedule/actions';
import { AFFECTED_PATHS } from '@/lib/types';

interface AddScheduleEntryFormProps {
  courses: Course[];
  instructors: Instructor[];
  tas: TA[];
  rooms: Room[];
  timeSlots: TimeSlot[];
}

const NO_TA_VALUE = '__NO_TA_SELECTED__'; // Sentinel value for "None" TA option

export function AddScheduleEntryForm({
  courses,
  instructors,
  tas,
  rooms,
  timeSlots,
}: AddScheduleEntryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    courseId: '',
    section: '',
    instructorId: '',
    taId: '',
    roomId: '',
    timeSlotId: '',
  });


  // console.log(courses)
  // debugger
  
  const handleChange = (name: string, value: string) => {
    let processedValue = value;
    if (name === 'taId' && value === NO_TA_VALUE) {
      processedValue = ''; // Convert sentinel to empty string for form state
    }
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    setError(null); // Clear error on change
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!formData.courseId || !formData.instructorId || !formData.roomId || !formData.timeSlotId) {
      setError('Please fill in all required fields (Course, Instructor, Room, Time Slot).');
      return;
    }
    
    startTransition(async () => {
      try {
        const result = await addScheduleEntryAction(formData, [AFFECTED_PATHS.dashboard, AFFECTED_PATHS.addSchedule]);
        if (result.success && result.data) {
          toast({
            title: 'Schedule Entry Added',
            description: `${result.data.course.name} has been successfully scheduled.`,
            variant: 'default',
          });
          // Reset form or redirect
          setFormData({ courseId: '', section: '', instructorId: '', taId: '', roomId: '', timeSlotId: ''});
          router.push(AFFECTED_PATHS.dashboard); // Redirect to dashboard to see the updated schedule
        } else if (result.error) {
          setError(result.error);
          toast({
            title: 'Scheduling Conflict',
            description: result.error,
            variant: 'destructive',
          });
        } else {
          setError('An unexpected error occurred.');
           toast({
            title: 'Error',
            description: 'An unexpected error occurred.',
            variant: 'destructive',
          });
        }
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Failed to add schedule entry.';
        setError(errorMsg);
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="courseId">Course *</Label>
        <Select name="courseId" onValueChange={(value) => handleChange('courseId', value)} value={formData.courseId} required>
          <SelectTrigger id="courseId">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.id} - {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="section">Section (Optional)</Label>
        <Input
          id="section"
          name="section"
          value={formData.section}
          onChange={(e) => handleChange('section', e.target.value)}
          placeholder="e.g., A, 001"
        />
      </div>

      <div>
        <Label htmlFor="instructorId">Instructor *</Label>
        <Select name="instructorId" onValueChange={(value) => handleChange('instructorId', value)} value={formData.instructorId} required>
          <SelectTrigger id="instructorId">
            <SelectValue placeholder="Select an instructor" />
          </SelectTrigger>
          <SelectContent>
            {instructors.map((instructor) => (
              <SelectItem key={instructor.id} value={instructor.id}>
                {instructor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="taId">Teaching Assistant (Optional)</Label>
        <Select name="taId" onValueChange={(value) => handleChange('taId', value)} value={formData.taId === '' ? NO_TA_VALUE : formData.taId}>
          <SelectTrigger id="taId">
            <SelectValue placeholder="Select a TA" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_TA_VALUE}>None</SelectItem>
            {tas.map((ta) => (
              <SelectItem key={ta.id} value={ta.id}>
                {ta.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="roomId">Room *</Label>
        <Select name="roomId" onValueChange={(value) => handleChange('roomId', value)} value={formData.roomId} required>
          <SelectTrigger id="roomId">
            <SelectValue placeholder="Select a room" />
          </SelectTrigger>
          <SelectContent>
            {rooms.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                {room.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="timeSlotId">Time Slot *</Label>
        <Select name="timeSlotId" onValueChange={(value) => handleChange('timeSlotId', value)} value={formData.timeSlotId} required>
          <SelectTrigger id="timeSlotId">
            <SelectValue placeholder="Select a time slot" />
          </SelectTrigger>
          <SelectContent className="max-h-60"> {/* Added max-h for long lists */}
            {timeSlots.map((slot) => (
              <SelectItem key={slot.id} value={slot.id}>
                {slot.display}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Add to Table
      </Button>
    </form>
  );
}

