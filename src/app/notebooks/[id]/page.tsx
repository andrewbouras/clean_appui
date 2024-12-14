import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

interface Chapter {
  _id: string;
  title: string;
  content: string;
  order: number;
}

interface Notebook {
  _id: string;
  title: string;
  description: string;
  chapters: Chapter[];
  owner: string;
  sharedWith: string[];
  isPublic: boolean;
}

export default function NotebookPage({ params }: { params: { id: string } }) {
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterContent, setNewChapterContent] = useState('');
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (params.id) {
      fetchNotebook();
    }
  }, [params.id]);

  const fetchNotebook = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/notebooks/${params.id}`, {
        withCredentials: true
      });
      setNotebook(response.data);
    } catch (err) {
      setError('Failed to fetch notebook');
    } finally {
      setLoading(false);
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notebooks/${params.id}/chapters`,
        {
          title: newChapterTitle,
          content: newChapterContent
        },
        { withCredentials: true }
      );
      setNewChapterTitle('');
      setNewChapterContent('');
      setIsAddingChapter(false);
      fetchNotebook();
    } catch (err) {
      setError('Failed to add chapter');
    }
  };

  const handleDeleteNotebook = async () => {
    if (!confirm('Are you sure you want to delete this notebook?')) {
      return;
    }

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/notebooks/${params.id}`, {
        withCredentials: true
      });
      router.push('/notebooks');
    } catch (err) {
      setError('Failed to delete notebook');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!notebook) {
    return (
      <div className="p-8">
        <div className="text-gray-500">Notebook not found</div>
      </div>
    );
  }

  const isOwner = user?._id === notebook.owner;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{notebook.title}</h1>
          <p className="text-gray-600">{notebook.description}</p>
        </div>
        {isOwner && (
          <div className="space-x-4">
            <button
              onClick={() => router.push(`/notebooks/${params.id}/edit`)}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              Edit Notebook
            </button>
            <button
              onClick={handleDeleteNotebook}
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
            >
              Delete Notebook
            </button>
          </div>
        )}
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Chapters</h2>
          {isOwner && (
            <button
              onClick={() => setIsAddingChapter(true)}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
            >
              Add Chapter
            </button>
          )}
        </div>

        {isAddingChapter && (
          <form onSubmit={handleAddChapter} className="mb-6 bg-white p-4 rounded shadow">
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Chapter Title
              </label>
              <input
                type="text"
                id="title"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                id="content"
                value={newChapterContent}
                onChange={(e) => setNewChapterContent(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                required
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsAddingChapter(false)}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              >
                Add Chapter
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {notebook.chapters
            .sort((a, b) => a.order - b.order)
            .map(chapter => (
              <div
                key={chapter._id}
                className="bg-white p-4 rounded shadow hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{chapter.title}</h3>
                  <button
                    onClick={() => router.push(`/notebooks/${params.id}/chapters/${chapter._id}`)}
                    className="text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    View Chapter →
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
} 