'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

interface Chapter {
  _id: string;
  title: string;
  order: number;
}

interface Notebook {
  _id: string;
  title: string;
  description: string;
  chapters: Chapter[];
}

export default function Sidebar() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNotebooks, setExpandedNotebooks] = useState<Set<string>>(new Set());
  
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotebooks();
    }
  }, [user]);

  const fetchNotebooks = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/notebooks`, {
        withCredentials: true
      });
      setNotebooks(response.data);
    } catch (err) {
      setError('Failed to fetch notebooks');
    } finally {
      setLoading(false);
    }
  };

  const toggleNotebook = (notebookId: string) => {
    setExpandedNotebooks(prev => {
      const next = new Set(prev);
      if (next.has(notebookId)) {
        next.delete(notebookId);
      } else {
        next.add(notebookId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="w-64 h-screen bg-gray-100 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-64 h-screen bg-gray-100 p-4">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-64 h-screen bg-gray-100 p-4 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Your Notebooks</h2>
        <button
          onClick={() => router.push('/notebooks/new')}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          New Notebook
        </button>
      </div>
      
      <div className="space-y-2">
        {notebooks.map(notebook => (
          <div key={notebook._id} className="border rounded bg-white">
            <button
              onClick={() => toggleNotebook(notebook._id)}
              className="w-full text-left p-3 hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <span className="font-medium">{notebook.title}</span>
              <span className="text-gray-500">
                {expandedNotebooks.has(notebook._id) ? '▼' : '▶'}
              </span>
            </button>
            
            {expandedNotebooks.has(notebook._id) && notebook.chapters.length > 0 && (
              <div className="pl-4 pb-2">
                {notebook.chapters
                  .sort((a, b) => a.order - b.order)
                  .map(chapter => (
                    <Link
                      key={chapter._id}
                      href={`/notebooks/${notebook._id}/chapters/${chapter._id}`}
                      className="block py-1 px-3 text-sm text-gray-600 hover:text-blue-500 hover:bg-gray-50 rounded transition-colors"
                    >
                      {chapter.title}
                    </Link>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
