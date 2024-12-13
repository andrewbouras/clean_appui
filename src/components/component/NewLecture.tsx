'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

interface NewLectureProps {
  classId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function NewLecture({ classId, onCancel, onSuccess }: NewLectureProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a lecture title",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
        : process.env.NEXT_PUBLIC_API_URL_DEV;

      await axios.post(
        `${apiUrl}/classes/${classId}/lectures`,
        { title, content },
        {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      toast({
        title: "Success",
        description: "Lecture created successfully",
      });
      
      onSuccess();
      router.refresh();
    } catch (error) {
      console.error('Failed to create lecture:', error);
      toast({
        title: "Error",
        description: "Failed to create lecture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Lecture Title
        </label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter lecture title"
          className="w-full"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Content (Optional)
        </label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter lecture content or notes"
          className="w-full min-h-[200px]"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {isSubmitting ? 'Creating...' : 'Create Lecture'}
        </Button>
      </div>
    </form>
  );
} 