'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import Sidebar from '@/components/component/Sidebar';
import { DisplayNotes } from '@/components/component/display-notes';
import { Button } from '@/components/ui/button';
import { Qload } from '@/components/component/qload';
import NewChapter from '@/components/component/new';
import { useAuth } from '@/contexts/AuthContext';
import ShareButton from '@/components/component/ShareButton';

interface Chapter {
  _id: string;
  title: string;
  content: string;
}

interface Notebook {
  title: string;
  chapters: Chapter[];
}

export default function NotebookPage() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  const [loading, setLoading] = useState(false);
  const notebookId = pathname?.split('/').pop();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && isAuthenticated && notebookId) {
      fetchNotebook(notebookId);
    }
  }, [notebookId, status, isAuthenticated]);

  const fetchNotebook = async (notebookId: string) => {
    if (!user?.accessToken) {
      console.error("User token not available");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
        : process.env.NEXT_PUBLIC_API_URL_DEV;

      const response = await axios.get(`${apiUrl}/notebooks/${notebookId}`, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });
      setNotebook(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Failed to load notebook:', error.message);
      } else {
        console.error('An unknown error occurred:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChapterClick = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    router.push(`/notebook/${notebookId}/chapters/${chapter._id}`);
  };

  if (status === 'loading' || loading) {
    return <Qload />;
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>
          <h1 className="text-2xl">Access Denied</h1>
          <button className="mt-4 p-2 bg-blue-500 text-white rounded" onClick={() => signIn('google')}>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className={`flex-grow transition-all duration-300 ${isSidebarOpen ? 'ml-80' : 'ml-0'} flex flex-col items-center p-6`}>
        {notebook ? (
          <>
            <div className="w-full max-w-4xl">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{notebook.title}</h1>
                <ShareButton type="notebook" id={notebookId!} />
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Chapters</h2>
                  <Button 
                    onClick={() => setIsCreatingChapter(true)}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Add New Chapter
                  </Button>
                </div>

                {notebook.chapters.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No chapters yet. Click "Add New Chapter" to create your first chapter.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {notebook.chapters.map((chapter) => (
                      <div
                        key={chapter._id}
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => handleChapterClick(chapter)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-medium">{chapter.title}</h3>
                            {chapter.content && (
                              <p className="text-gray-600 text-sm mt-1">
                                {chapter.content.substring(0, 100)}...
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            className="text-blue-500 hover:text-blue-600"
                          >
                            View Chapter →
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {isCreatingChapter && (
              <NewChapter
                notebookId={notebookId!}
                onSuccess={() => {
                  setIsCreatingChapter(false);
                  fetchNotebook(notebookId!);
                }}
                onCancel={() => setIsCreatingChapter(false)}
              />
            )}
          </>
        ) : (
          <div>Loading notebook...</div>
        )}
      </div>
    </div>
  );
}
