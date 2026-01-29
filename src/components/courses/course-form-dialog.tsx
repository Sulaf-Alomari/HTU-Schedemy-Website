'use client';

import type { Course } from '@/lib/types';
import { useState, useEffect, FormEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface CourseFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: Omit<Course, 'id'> | Course) => Promise<void>;
  initialData?: Course | null;
  isPending?: boolean;
}

const defaultFormValues: Omit<Course, 'id'> = {
  code: '',
  name: '',
  creditHours: 0,
  group: '',
};

export function CourseFormDialog({ isOpen, onClose, onSubmit, initialData, isPending }: CourseFormDialogProps) {
  const [formData, setFormData] = useState<Omit<Course, 'id'> | Course>(defaultFormValues);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(defaultFormValues);
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!formData.code || !formData.name || formData.creditHours <= 0) {
      // In a real app, use a form library like react-hook-form for better validation UX
      alert("Please fill in all required fields (Code, Name, Credit Hours > 0).");
      return;
    }
    await onSubmit(formData);
  };
  
  // Ensure onClose is called if DialogPrimitive.Close is used or overlay is clicked
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Course' : 'Add New Course'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update the details of the course.' : 'Enter the details for the new course.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">
              Code *
            </Label>
            <Input
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="creditHours" className="text-right">
              Credits *
            </Label>
            <Input
              id="creditHours"
              name="creditHours"
              type="number"
              value={formData.creditHours.toString()} // Input type number expects string value
              onChange={handleChange}
              className="col-span-3"
              required
              min="1"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="group" className="text-right">
              Group
            </Label>
            <Input
              id="group"
              name="group"
              value={formData.group || ''}
              onChange={handleChange}
              className="col-span-3"
              placeholder="e.g., Core, Elective"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {initialData ? 'Save Changes' : 'Add Course'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
