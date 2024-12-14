import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import ClassDetails from '@/components/classes/ClassDetails';
import { classApi } from '@/lib/api';

interface ClassPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ClassPageProps): Promise<Metadata> {
  try {
    const classData = await classApi.getClass(params.id);
    return {
      title: classData.title,
      description: classData.description,
    };
  } catch (error) {
    return {
      title: 'Class Not Found',
      description: 'The requested class could not be found.',
    };
  }
}

export default async function ClassPage({ params }: ClassPageProps) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/signin');
  }

  try {
    const classData = await classApi.getClass(params.id);
    return <ClassDetails classItem={classData} />;
  } catch (error) {
    notFound();
  }
} 