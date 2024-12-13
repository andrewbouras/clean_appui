'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import ShareButton from '@/components/component/ShareButton';
import NewLecture from '@/components/component/NewLecture';

interface Lecture {
  _id: string;
  title: string;
  content: string;
}

interface Class {
  title: string;
  lectures: Lecture[];
}

export default function ClassPage() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [classData, setClassData] = useState<Class | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [isCreatingLecture, setIsCreatingLecture] = useState(false);
  const [loading, setLoading] = useState(false);
  const classId = pathname?.split('/').pop();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && classId) {
      fetchClass(classId);
    }
  }, [classId, status]);

  const fetchClass = async (classId: string) => {
    if (!session?.user?.accessToken) {
      console.error("User token not available");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
        : process.env.NEXT_PUBLIC_API_URL_DEV;

      const response = await axios.get(`${apiUrl}/classes/${classId}`, {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
        },
      });
      setClassData(response.data);
      console.log("Response data", response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Failed to load class:', error.message);
      } else {
        console.error('An unknown error occurred:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLectureClick = (lecture: Lecture) => {
    setSelectedLecture(lecture);
    router.push(`/class/${classId}/lectures/${lecture._id}`);
  };

  const handleLectureCreated = () => {
    setIsCreatingLecture(false);
    fetchClass(classId!);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>
          <h1 className="text-2xl">Access Denied</h1>
          <button 
            className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" 
            onClick={() => signIn('google')}
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {classData ? (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">{classData.title}</h1>
            <ShareButton type="class" id={classId!} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Lectures</h2>
                <Button 
                  onClick={() => setIsCreatingLecture(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  New Lecture
                </Button>
              </div>
              
              <div className="space-y-2">
                {classData.lectures.map((lecture) => (
                  <div
                    key={lecture._id}
                    onClick={() => handleLectureClick(lecture)}
                    className="p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium">{lecture.title}</h3>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-lg">
              {selectedLecture ? (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">{selectedLecture.title}</h2>
                  <div className="prose max-w-none">
                    {selectedLecture.content}
                  </div>
                </div>
              ) : isCreatingLecture ? (
                <NewLecture
                  classId={classId!}
                  onCancel={() => setIsCreatingLecture(false)}
                  onSuccess={handleLectureCreated}
                />
              ) : (
                <div className="text-center text-gray-500">
                  Select a lecture to view its content or create a new one
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500">Loading class data...</div>
      )}
    </div>
  );
} 