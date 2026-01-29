
import { CourseManagementTable } from '@/components/courses/course-management-table';
import { getCourses } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { Course } from '@/lib/types'; // Ensure Course type is imported

export default async function CoursesPage() {

  const courses: Course[] = await getCourses();

  if (!courses) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">Manage Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Pass the fetched courses to the client component */}
          <CourseManagementTable initialCourses={courses} />
        </CardContent>
      </Card>
    </div>
  );
}
