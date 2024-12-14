import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import CreateClassForm from '@/components/classes/CreateClassForm';

export const metadata: Metadata = {
  title: 'Create Class',
  description: 'Create a new class for your students',
};

export default async function CreateClassPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/signin');
  }

  return (
    <div className="container mx-auto py-8">
      <CreateClassForm />
    </div>
  );
} 