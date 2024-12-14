import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import PortalLayout from '@/components/layout/PortalLayout';
import ClassList from '@/components/classes/ClassList';

export const metadata: Metadata = {
  title: 'Classes | Smartify',
  description: 'View and manage your classes',
};

export default async function ClassesPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/signin');
  }

  return (
    <PortalLayout>
      <div className="container mx-auto p-4 lg:p-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">My Classes</h1>
          </div>
          
          <ClassList
            view={session.user.role === 'instructor' ? 'teaching' : 'enrolled'}
          />
        </div>
      </div>
    </PortalLayout>
  );
} 