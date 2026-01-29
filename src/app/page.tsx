
import { SummaryCard } from '@/components/dashboard/summary-card';
import { WeeklyTimetableView } from '@/components/dashboard/weekly-timetable-view';
import { getCourses, getInstructors, getRooms, getFullScheduledEntries } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BookOpen, Users, Home, CalendarDays } from 'lucide-react';

export default async function DashboardPage() {
  const coursesData = await getCourses();
  const instructorsData = await getInstructors();
  const roomsData = getRooms();
  const scheduledEntriesData = await getFullScheduledEntries();

  // Defensive checks to ensure we are working with arrays
  const coursesCount = Array.isArray(coursesData) ? coursesData.length : 0;
  const instructorsCount = Array.isArray(instructorsData) ? instructorsData.length : 0;
  const roomsCount = Array.isArray(roomsData) ? roomsData.length : 0;
  const scheduledEntriesCount = Array.isArray(scheduledEntriesData) ? scheduledEntriesData.length : 0;

  const summaryData = [
    { title: 'Total Courses', value: coursesCount, icon: BookOpen, color: 'text-blue-500' },
    { title: 'Total Instructors', value: instructorsCount, icon: Users, color: 'text-green-500' },
    { title: 'Total Rooms', value: roomsCount, icon: Home, color: 'text-purple-500' },
    { title: 'Scheduled Classes', value: scheduledEntriesCount, icon: CalendarDays, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-8">
      <section aria-labelledby="dashboard-summary">
        <h2 id="dashboard-summary" className="text-2xl font-semibold tracking-tight mb-4">
          Dashboard Overview
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {summaryData.map((item) => (
            <SummaryCard
              key={item.title}
              title={item.title}
              value={item.value.toString()} // item.value is now guaranteed to be a number
              icon={<item.icon className={`h-6 w-6 ${item.color}`} />}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="weekly-timetable">
        <Card>
          <CardHeader>
            <CardTitle id="weekly-timetable">Weekly Timetable</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Ensure scheduledEntriesData passed to WeeklyTimetableView is an array */}
            <WeeklyTimetableView scheduledEntries={Array.isArray(scheduledEntriesData) ? scheduledEntriesData : []} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
