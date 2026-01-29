
import { getFullScheduledEntries } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScheduledClassesTable } from '@/components/schedule/scheduled-classes-table';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'View Scheduled Classes - Sci-Ed Schedule',
  description: 'View all scheduled classes with their details.',
};

export default async function ViewSchedulePage() {
  const scheduledEntries = await getFullScheduledEntries();

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">Scheduled Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduledClassesTable scheduledEntries={scheduledEntries} />
        </CardContent>
      </Card>
    </div>
  );
}
