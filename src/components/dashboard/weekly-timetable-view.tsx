import type { FullScheduleEntry, DayOfWeek } from '@/lib/types';
import { daysOfWeek, timeSlotPeriods } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WeeklyTimetableViewProps {
  scheduledEntries: FullScheduleEntry[];
}

// Helper to format time for display in headers
const formatTimeForHeader = (time: string) => {
  const [hour, minute] = time.split(':');
  const date = new Date();
  date.setHours(parseInt(hour, 10));
  date.setMinutes(parseInt(minute, 10));
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

export function WeeklyTimetableView({ scheduledEntries }: WeeklyTimetableViewProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y divide-border bg-card">
        <thead className="bg-muted/50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground w-24">
              Time
            </th>
            {daysOfWeek.map((day) => (
              <th
                key={day}
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {timeSlotPeriods.map((period, periodIndex) => (
            <tr key={periodIndex} className="hover:bg-muted/20 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground align-top">
                {formatTimeForHeader(period.startTime)} - {formatTimeForHeader(period.endTime)}
              </td>
              {daysOfWeek.map((day) => {
                const entriesInSlot = scheduledEntries.filter(
                  (entry) =>
                    entry.timeSlot.day === day &&
                    entry.timeSlot.startTime === period.startTime &&
                    entry.timeSlot.endTime === period.endTime
                );
                return (
                  <td key={day} className="px-4 py-3 whitespace-normal align-top text-sm text-muted-foreground min-w-[150px]">
                    {entriesInSlot.length > 0 ? (
                      <div className="space-y-2">
                        {entriesInSlot.map((entry) => (
                          <Card key={entry.id} className="shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="p-2">
                              <CardTitle className="text-xs font-semibold">{entry.course.id} - {entry.course.name}</CardTitle>
                              {entry.section && <CardDescription className="text-xs">Sec: {entry.section}</CardDescription>}
                            </CardHeader>
                            <CardContent className="p-2 text-xs space-y-0.5">
                              <p><strong>Instr:</strong> {entry.instructor.name}</p>
                              {entry.ta && <p><strong>TA:</strong> {entry.ta.name}</p>}
                              <p><strong>Room:</strong> {entry.room.name}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <span className="italic text-muted-foreground/70">Available</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {scheduledEntries.length === 0 && (
        <p className="p-4 text-center text-muted-foreground">No classes scheduled yet.</p>
      )}
    </div>
  );
}
