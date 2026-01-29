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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { MultiSelect } from '@/components/ui/multi-select';

interface Course {
    id: string | number;
    name: string;
}

// Define a type for subject configuration
interface SubjectConfig {
  id: string | number;
  name: string;
  sections: number;
  conflictingSubjects: (string | number)[]; // Store conflicting subject IDs
}

const getCourses = async (): Promise<Course[]> => {
    return [
        { id: 'CS101', name: 'Introduction to Programming' },
        { id: 'MATH201', name: 'Calculus II' },
        { id: 'PHYS101', name: 'General Physics I' },
        { id: 'CHEM101', name: 'General Chemistry I' },
        { id: 'BIO101', name: 'General Biology I' },
    ];
};


export default function ConfigureSubjectsPage() {
  const [subjectConfigs, setSubjectConfigs] = useState<SubjectConfig[]>([]);
  const [courses, setCourses] = useState<Course[]>([]); // To populate the multi-select options

  useEffect(() => {
    const fetchCourses = async () => {
      const fetchedCourses = await getCourses();
      setCourses(fetchedCourses);
      setSubjectConfigs(
        fetchedCourses.map(course => ({
          id: course.id,
          name: course.name,
          sections: 1, // Default to 1 section
          conflictingSubjects: [],
        }))
      );
    };

    fetchCourses();
  }, []);

  const handleSectionChange = (id: string | number, value: string) => {
    setSubjectConfigs(subjectConfigs.map(config =>
      config.id === id ? { ...config, sections: parseInt(value) || 0 } : config
    ));
  };

  const handleConflictingSubjectsChange = (id: string | number, selectedConflictIds: (string | number)[]) => {
    setSubjectConfigs(subjectConfigs.map(config =>
      config.id === id ? { ...config, conflictingSubjects: selectedConflictIds } : config
    ));
  };

  const handleSave = () => {
    // Send subjectConfigs to backend API
    console.log("Saving configurations:", subjectConfigs);
    // Example fetch:
    // fetch('/api/configure-subjects', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(subjectConfigs),
    // });
  };

  // Prepare options for the multi-select (excluding the current subject)
  const getConflictOptions = (currentSubjectId: string | number) => {
      return courses
        .filter(course => course.id !== currentSubjectId)
        .map(course => ({
          value: course.id.toString(),
          label: `${course.id} - ${course.name}`,
        }));
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Configure Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Number of Sections</TableHead>
                <TableHead>Conflicting Subjects</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjectConfigs.map(config => (
                <TableRow key={config.id}>
                  <TableCell className="font-medium">{config.id}</TableCell>
                  <TableCell>{config.name}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={config.sections}
                      onChange={(e) => handleSectionChange(config.id, e.target.value)}
                      min="0"
                    />
                  </TableCell>
                  <TableCell className="w-[400px]">
                    
                  <select
                      multiple
                      className="w-full border rounded px-2 py-1"
                      value={config.conflictingSubjects.map(String)}
                      onChange={(e) => {
                        const selectedOptions = Array.from(e.target.selectedOptions).map(opt => opt.value);
                        handleConflictingSubjectsChange(config.id, selectedOptions);
                      }}
                    >
                      {getConflictOptions(config.id).map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>


                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button className="mt-4" onClick={handleSave}>Save Configuration</Button>
        </CardContent>
      </Card>
    </div>
  );
}