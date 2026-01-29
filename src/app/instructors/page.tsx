
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Instructor } from '@/lib/types'; // Ensure correct Instructor type is imported

const defaultFormData = {
  email: '',
  name: '',
  jobTitle: '',
  department: '',
  // teachingLoad: 0, // teachingLoad is not part of the add form as per requirements
};

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [isLoadingEmailAll, setIsLoadingEmailAll] = useState(false);
  const [loadingEmailIds, setLoadingEmailIds] = useState<Set<string | number>>(new Set());

  useEffect(() => {
    async function fetchData() {
      try {
        // Assuming your API endpoint for instructors is /api/instructor
        // This uses the Next.js API route at src/app/api/instructor/route.ts
        // which in turn fetches from your Spring Boot backend.
        const res = await fetch('/api/instructor');
        if (!res.ok) {
          console.error('Failed to fetch instructors from Next.js API route:', res.status, res.statusText);
          // Optionally, try fetching directly from Spring Boot as a fallback or for more detailed error
          // const directRes = await fetch('http://54.91.109.189:8080/instructor');
          // if (!directRes.ok) throw new Error(`Direct fetch also failed: ${directRes.statusText}`);
          // const data = await directRes.json();
          // setInstructors(data);
          throw new Error(`Failed to fetch instructors. Status: ${res.status}`);
        }
        const data = await res.json();
        setInstructors(data);
      } catch (err) {
        console.error('Error fetching instructors:', err);
        // Potentially set an error state here to display to the user
      }
    }

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddInstructor = async () => {
    // Create the new instructor object based on formData
    // teachingLoad is not included in the form, so it won't be part of newInstructorFromForm
    const newInstructorFromForm: Omit<Instructor, 'id' | 'teachingLoad'> = {
      ...formData,
    };

    try {
      const response = await fetch('/api/instructor', { // Posting to Next.js API route
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInstructorFromForm),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to add instructor. Status: ${response.status}` }));
        console.error('Error adding instructor:', errorData.message || response.statusText);
        // Optionally, show an error toast to the user
        return;
      }

      const addedInstructor: Instructor = await response.json();
      setInstructors((prev) => [...prev, addedInstructor]);
      setFormData(defaultFormData); // Reset form to default
      setShowDialog(false);
    } catch (error) {
      console.error('Error submitting new instructor:', error);
    }
  };

  const handleSendEmailToAll = async () => {
    if (instructors.length === 0) {
      console.log('No instructors to send email to');
      return;
    }

    setIsLoadingEmailAll(true);
    const allInstructorIds = instructors.map(instructor => instructor.id);

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allInstructorIds),
      });

      if (response.ok) {
        console.log('Email sent successfully to all instructors');
      } else {
        console.error('Failed to send email to all instructors:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error sending email to all instructors:', error);
    } finally {
      setIsLoadingEmailAll(false);
    }
  };

  // Send email to single instructor
  const handleSendEmailToInstructor = async (instructorId: string | number) => {
    setLoadingEmailIds(prev => new Set(prev.add(instructorId)));

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([instructorId]),
      });

      if (response.ok) {
        console.log(`Email sent successfully to instructor ${instructorId}`);
      } else {
        console.error(`Failed to send email to instructor ${instructorId}:`, response.status, response.statusText);
      }
    } catch (error) {
      console.error(`Error sending email to instructor ${instructorId}:`, error);
    } finally {
      setLoadingEmailIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(instructorId);
        return newSet;
      });
    }
  };

  const handleDeleteInstructor = async (instructorId: string | number) => {
    console.log('Attempting to delete instructor:', instructorId);
    // TODO: Implement API call to delete instructor
    // Example:
    // try {
    //   const response = await fetch(`/api/instructor/${instructorId}`, { method: 'DELETE' });
    //   if (!response.ok) throw new Error('Failed to delete instructor');
    //   setInstructors(prev => prev.filter(inst => inst.id !== instructorId));
    // } catch (error) {
    //   console.error('Error deleting instructor:', error);
    // }
  };

  return (
      <div>
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Manage Instructors</CardTitle>
            <Button
                onClick={handleSendEmailToAll}
                disabled={isLoadingEmailAll || instructors.length === 0}
            >
              {isLoadingEmailAll ? 'Sending...' : 'Send Email For All'}
            </Button>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Teaching Load</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instructors.map((instructor) => (
                    <TableRow key={instructor.id}>
                      <TableCell className="font-medium">{instructor.name}</TableCell>
                      <TableCell>{instructor.email}</TableCell>
                      <TableCell>{instructor.department}</TableCell>
                      <TableCell>{instructor.jobTitle}</TableCell>
                      <TableCell>{instructor.teachingLoad ?? 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mr-2 hover:text-accent-foreground disabled:opacity-50"
                            onClick={() => handleSendEmailToInstructor(instructor.id)}
                            disabled={loadingEmailIds.has(instructor.id)}
                        >
                          {loadingEmailIds.has(instructor.id) ? 'Sending...' : 'Send Email'}
                        </Button>
                        {/*<Button variant="ghost" size="sm" onClick={() => handleDeleteInstructor(instructor.id)} className="text-destructive hover:text-destructive/90 disabled:opacity-50" disabled>Delete</Button>*/}
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>

          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Instructor</DialogTitle>
              </DialogHeader>
              <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddInstructor();
                  }}
                  className="space-y-4"
              >
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                    required
                />
                <input
                    type="text"
                    name="department"
                    placeholder="Department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                    required
                />
                <input
                    type="text"
                    name="jobTitle"
                    placeholder="Job Title"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                    required
                />
                {/*<Button type="submit">Add Instructor</Button>*/}
              </form>
            </DialogContent>
          </Dialog>
        </Card>
      </div>
  );
}