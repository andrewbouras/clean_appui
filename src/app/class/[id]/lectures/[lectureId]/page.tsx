'use client';

import { useSession, signIn } from "next-auth/react";
import React, { useState, useEffect } from "react";
import axios from 'axios';
import { usePathname } from "next/navigation";
import ShareButton from '@/components/component/ShareButton';
import QuestionComponent from '@/components/component/QuestionComponent';

export default function LecturePage() {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState('');
  const pathname = usePathname();
  const pathParts = pathname?.split("/").filter(Boolean) || [];
  const isLecture = pathParts.includes("lectures");
  const id = pathParts[pathParts.length - 1];

  const apiUrl = process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
    : process.env.NEXT_PUBLIC_API_URL_DEV;

  const fetchUrl = isLecture 
    ? `${apiUrl}/lecture/${id}/questions`
    : `${apiUrl}/qbank/${id}`;

  const postUrl = isLecture 
    ? `${apiUrl}/questions/${id}/responses`
    : `${apiUrl}/qbank/${id}/response`;

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      signIn();
      return;
    }

    // Fetch lecture title from API
    axios.get(fetchUrl, {
      headers: {
        Authorization: `Bearer ${session?.user?.accessToken}`,
      },
    })
      .then((response: { data: { lectureTitle: string } }) => {
        const lectureTitle = response.data.lectureTitle;
        setTitle(lectureTitle || `Lecture ${id}`);
      })
      .catch((error: any) => {
        console.error("Failed to load title:", error);
      });
  }, [session, status, fetchUrl]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return signIn();
  }

  return (
    <div className="flex">
      <div className="flex-grow transition-all duration-300">
        <ShareButton type="lecture" id={id} />
        <QuestionComponent 
          fetchUrl={fetchUrl}
          postUrl={postUrl}
          title={title}
        />
      </div>
    </div>
  );
} 