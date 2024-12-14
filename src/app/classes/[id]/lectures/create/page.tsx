import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { classApi } from '@/lib/api';
import CreateLectureForm from '@/components/lectures/CreateLectureForm';

interface CreateLecturePageProps {
  params: {
    id: string; // class id
  };
}

export const metadata: Metadata = {
  title: 'Create Lecture',
  description: 'Create a new lecture for your class',
};

export default async function CreateLecturePage({ params }: CreateLecturePageProps) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/signin');
  }

  try {
    // Get class details to verify instructor access
    const classData = await classApi.getClass(params.id);
    
    // Check if user is the instructor
    if (classData.instructor._id !== session.user.id) {
      redirect(`/classes/${params.id}`);
    }

    return (
      <div className="container mx-auto py-8">
        <CreateLectureForm
          classId={params.id}
          availableLectures={classData.lectures}
        />
      </div>
    );
  } catch (error) {
    redirect('/classes');
  }
} 