'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';
import ShareNoteModal from '@/components/component/ShareNoteModal';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Chapter {
  _id: string;
  title: string;
  notebookId: string;
}

interface Notebook {
  _id: string;
  title: string;
  chapters: Chapter[];
}

interface EnrolledQuestionBank {
  _id: string;
  bankTitle: string;
  bankUrl: string;
  isEditor: boolean;
  isCreator: boolean;
}

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, toggleSidebar }) => {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [enrolledQuestionBanks, setEnrolledQuestionBanks] = useState<EnrolledQuestionBank[]>([]);
  const [iconSize, setIconSize] = useState(25);
  const { user, isAuthenticated } = useAuth();
  const [plan, setPlan] = useState<'free' | 'premium'>('free');

  const pathname = usePathname();

  useEffect(() => {
    const fetchNotebooksAndChapters = async () => {
      const apiUrl = process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
        : process.env.NEXT_PUBLIC_API_URL_DEV ;

      const token = user?.accessToken;

      if (!token) {
        console.error("No access token found");
        return;
      }
      try {
        const response = await fetch(`${apiUrl}/notebooks`, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error('Failed to fetch notebooks and chapters');
        const result: Notebook[] = await response.json();
        setNotebooks(result || []);
      } catch (error) {
        console.error('Error fetching notebooks and chapters:', (error as Error).message);
        setNotebooks([]);
      }
    };

    const fetchEnrolledQuestionBanks = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:4000/api';
      const token = user?.accessToken;

      if (!token) {
        console.error("No access token found");
        return;
      }
      try {
        const response = await fetch(`${apiUrl}/user/question-banks`, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error('Failed to fetch enrolled question banks');
        const result: EnrolledQuestionBank[] = await response.json();
        setEnrolledQuestionBanks(result || []);
      } catch (error) {
        console.error('Error fetching enrolled question banks:', (error as Error).message);
        setEnrolledQuestionBanks([]);
      }
    };

    if (isAuthenticated) {
      fetchEnrolledQuestionBanks();
      fetchNotebooksAndChapters();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const fetchUserPlan = async () => {
      const apiUrl = process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
        : process.env.NEXT_PUBLIC_API_URL_DEV ;   
        
      const token = user?.accessToken;
  
      if (!token) {
        console.error("No access token found");
        return;
      }
      try {
        const response = await fetch(`${apiUrl}/user/plan`, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error('Failed to fetch user plan');
        const data = await response.json();
        setPlan(data.plan);
      } catch (error) {
        console.error('Error fetching user plan:', (error as Error).message);
        setPlan('free');
      }
    };
  
    if (isAuthenticated) {
      fetchUserPlan();
    }
  }, [isAuthenticated, user]);
  

  useEffect(() => {
    const handleResize = () => {
      const newSize = window.innerHeight < 500 ? 20 : 25;
      setIconSize(newSize);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarWidth = isSidebarOpen ? 'w-1/6' : 'w-0';
  const buttonPosition = isSidebarOpen ? 'left-[17%]' : 'left-0';

  return (
    <>
      <div className={`fixed h-full bg-gray-200 transition-all duration-500 ${sidebarWidth} overflow-hidden z-10`}>
        {isSidebarOpen && (
          <div className="flex items-center justify-between p-5 group">
            <h1 className="text-xl font-bold truncate">Luminous</h1>
            <Link href="/smart" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Image src="https://www.svgrepo.com/show/313873/edit.svg" alt="Create New Note" width={20} height={20} />
            </Link>
          </div>
        )}
        {isSidebarOpen && (
          <div className="absolute top-5 right-5">
            <button className="bg-gray-100 text-gray-900 px-3 py-1 rounded-lg">
              {plan === 'premium' ? 'Premium User' : 'Free User'}
            </button>
          </div>
        )}

        {isSidebarOpen && (
          <div className="overflow-y-auto p-5 h-[80vh]">
            {enrolledQuestionBanks.length > 0 && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Question Banks</h2>
                {enrolledQuestionBanks.map(bank => (
                  <div 
                    key={bank._id} 
                    className={`group flex items-center justify-between px-4 py-2 rounded my-1 cursor-pointer ${
                      pathname === `/bank/${bank.bankUrl}` ? 'bg-blue-600 text-white' : 'hover:bg-blue-200'
                    }`}
                  >
                    <Link href={`/bank/${bank.bankUrl}`} className="flex-grow truncate pl-4">
                      {bank.bankTitle}
                    </Link>
                    {(bank.isEditor || bank.isCreator) && (
                      <Link 
                        href={`/bank/${bank.bankUrl}/editor`} 
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-2"
                      >
                        <Image src="/pencil.svg" alt="Edit" width={20} height={20} />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
            {notebooks.length > 0 && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Classes</h2>
                {notebooks.map(notebook => (
                  <div key={notebook._id}>
                    <Link href={`/notebook/${notebook._id}`}>
                      <div className={`group flex items-center justify-between px-4 py-2 rounded my-1 cursor-pointer ${
                        pathname === `/notebook/${notebook._id}` ? 'bg-blue-600 text-white' : 'hover:bg-gray-300'
                      }`}>
                        <span className="flex-grow truncate pl-4">{notebook.title}</span>
                        <div className={`flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                          pathname === `/notebook/${notebook._id}` ? 'text-white' : ''
                        }`}>
                          <button 
                            className="mx-1 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={(e) => {
                              e.preventDefault();
                              // Your share handler
                            }}
                          >
                            <Image src="/share.svg" alt="Share" width={20} height={20} />
                          </button>
                          <button 
                            className="mx-1 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={(e) => {
                              e.preventDefault();
                              // Your menu handler
                            }}
                          >
                            <Image src="/dots.svg" alt="Menu" width={20} height={20} />
                          </button>
                          <Image src="/chevron.svg" alt="Open" width={20} height={20} className="mx-1" />
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {isSidebarOpen && (
          <div className="absolute bottom-5 w-full px-5">
            <Link href="/new-notebook">
              <button className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600">
                Create New Class
              </button>
            </Link>
          </div>
        )}
      </div>
      <div className={`fixed ${buttonPosition} top-1/2 transform -translate-y-1/2 z-20 bg-transparent w-[4%]`}>
        <button onClick={toggleSidebar} className="bg-transparent p-2 rounded-l focus:outline-none h-full flex items-center justify-center">
          <Image
            src={isSidebarOpen ? 'https://www.svgrepo.com/show/425979/left-arrow.svg' : 'https://www.svgrepo.com/show/425982/right-arrow.svg'}
            alt="Toggle"
            width={iconSize}
            height={iconSize}
          />
        </button>
      </div>
    </>
  );
};

export default Sidebar;
