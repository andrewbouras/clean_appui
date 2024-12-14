import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import ReactMarkdown from 'react-markdown';

interface Chapter {
  _id: string;
  title: string;
  content: string;
  order: number;
}

interface Notebook {
  _id: string;
  title: string;
  owner: string;
  chapters: Chapter[];
}

export default function ChapterPage({ params }: { params: { id: string; chapterId: string } }) {
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (params.id && params.chapterId) {
      fetchNotebookAndChapter();
    }
  }, [params.id, params.chapterId]);

  const fetchNotebookAndChapter = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/notebooks/${params.id}`, {
        withCredentials: true
      });
      setNotebook(response.data);
      
      const foundChapter = response.data.chapters.find(
        (ch: Chapter) => ch._id === params.chapterId
      );
      
      if (foundChapter) {
        setChapter(foundChapter);
        setEditTitle(foundChapter.title);
        setEditContent(foundChapter.content);
      }
    } catch (err) {
      setError('Failed to fetch chapter');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notebooks/${params.id}/chapters/${params.chapterId}`,
        {
          title: editTitle,
          content: editContent
        },
        { withCredentials: true }
      );
      setIsEditing(false);
      fetchNotebookAndChapter();
    } catch (err) {
      setError('Failed to update chapter');
    }
  };

  const handleDeleteChapter = async () => {
    if (!confirm('Are you sure you want to delete this chapter?')) {
      return;
    }

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notebooks/${params.id}/chapters/${params.chapterId}`,
        { withCredentials: true }
      );
      router.push(`/notebooks/${params.id}`);
    } catch (err) {
      setError('Failed to delete chapter');
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

  if (!notebook || !chapter) {
    return (
      <div className="p-8">
        <div className="text-gray-500">Chapter not found</div>
      </div>
    );
  }

  const isOwner = user?._id === notebook.owner;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{chapter.title}</h1>
            <p className="text-gray-600">From notebook: {notebook.title}</p>
          </div>
          {isOwner && (
            <div className="space-x-4">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              >
                Edit Chapter
              </button>
              <button
                onClick={handleDeleteChapter}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
              >
                Delete Chapter
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdateChapter} className="bg-white p-6 rounded shadow">
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Chapter Title
              </label>
              <input
                type="text"
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content (Markdown supported)
              </label>
              <textarea
                id="content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-64 font-mono"
                required
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white p-6 rounded shadow prose max-w-none">
            <ReactMarkdown>{chapter.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
} 