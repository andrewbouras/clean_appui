import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { classApi, lectureApi } from '@/lib/api';
import LectureViewer from '@/components/lectures/LectureViewer';

interface LecturePageProps {
  params: {
    classId: string;
    lectureId: string;
  };
}

export async function generateMetadata({ params }: LecturePageProps): Promise<Metadata> {
  try {
    const lecture = await lectureApi.getLecture(params.lectureId);
    return {
      title: lecture.title,
      description: lecture.description,
    };
  } catch (error) {
    return {
      title: 'Lecture Not Found',
      description: 'The requested lecture could not be found.',
    };
  }
}

export default async function LecturePage({ params }: LecturePageProps) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/signin');
  }

  try {
    // Get class details to verify access
    const classData = await classApi.getClass(params.classId);
    const lecture = await lectureApi.getLecture(params.lectureId);

    // Check if user is instructor or enrolled
    const isInstructor = classData.instructor._id === session.user.id;
    const isEnrolled = classData.enrolledStudents.some(
      enrollment => enrollment.student._id === session.user.id &&
      enrollment.status === 'active'
    );

    if (!isInstructor && !isEnrolled) {
      redirect(`/classes/${params.classId}`);
    }

    // Get lecture order for navigation
    const sortedLectures = classData.lectures.sort((a, b) => a.order - b.order);
    const currentIndex = sortedLectures.findIndex(l => l._id === params.lectureId);
    
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < sortedLectures.length - 1;

    const handleNavigation = (direction: 'prev' | 'next') => {
      const targetIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex >= 0 && targetIndex < sortedLectures.length) {
        return redirect(`/classes/${params.classId}/lectures/${sortedLectures[targetIndex]._id}`);
      }
    };

    return (
      <div className="container mx-auto py-8">
        <LectureViewer
          lecture={lecture}
          isInstructor={isInstructor}
          onNavigate={handleNavigation}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
        />
      </div>
    );
  } catch (error) {
    redirect(`/classes/${params.classId}`);
  }
} 