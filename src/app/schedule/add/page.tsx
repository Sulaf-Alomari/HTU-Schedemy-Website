import { getFullScheduledEntries, getCourses, getInstructors, getTAs } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EditableScheduledClassesTable } from '@/components/schedule/editable-scheduled-classes-table';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Scheduled Classes - Sci-Ed Schedule',
  description: 'Edit scheduled classes with their details.',
};

export default async function EditSchedulePage() {
  const scheduledEntries = await getFullScheduledEntries();

  const courses = await getCourses();
  const instructors = await getInstructors();
  const tas = await getTAs();

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">Edit Scheduled Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <EditableScheduledClassesTable 
            scheduledEntries={scheduledEntries}
            courses={courses}
            instructors={instructors}
            tas={tas}
          />
        </CardContent>
      </Card>
    </div>
  );
}
