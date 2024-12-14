import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Class } from '@/types/class';
import { classApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/utils';
import LectureList from '../lectures/LectureList';
import EnrolledStudents from './EnrolledStudents';

interface ClassDetailsProps {
  classItem: Class;
}

export default function ClassDetails({ classItem }: ClassDetailsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const isInstructor = session?.user?.role === 'instructor';
  const isOwner = isInstructor && classItem.instructor._id === session?.user?.id;
  const isEnrolled = classItem.enrolledStudents.some(
    enrollment => enrollment.student._id === session?.user?.id &&
    enrollment.status === 'active'
  );

  const handleEnroll = async () => {
    try {
      setLoading(true);
      await classApi.enrollInClass(classItem._id);
      router.reload();
    } catch (error) {
      console.error('Error enrolling in class:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async () => {
    try {
      setLoading(true);
      await classApi.unenrollFromClass(classItem._id);
      router.reload();
    } catch (error) {
      console.error('Error unenrolling from class:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/classes/${classItem._id}/edit`);
  };

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{classItem.title}</h1>
            <p className="text-gray-600 mt-2">
              by {classItem.instructor.name}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {isOwner ? (
              <Button onClick={handleEdit}>Edit Class</Button>
            ) : (
              !isInstructor && (
                <Button
                  onClick={isEnrolled ? handleUnenroll : handleEnroll}
                  variant={isEnrolled ? 'destructive' : 'default'}
                  disabled={loading}
                >
                  {loading
                    ? 'Processing...'
                    : isEnrolled
                    ? 'Unenroll'
                    : 'Enroll Now'}
                </Button>
              )
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="outline">{classItem.category}</Badge>
          <Badge variant="outline">{classItem.level}</Badge>
          <Badge variant={classItem.isPublic ? 'default' : 'secondary'}>
            {classItem.isPublic ? 'Public' : 'Private'}
          </Badge>
          {classItem.lectures.length > 0 && (
            <Badge variant="outline">
              {classItem.lectures.length} Lecture{classItem.lectures.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lectures">Lectures</TabsTrigger>
          {(isOwner || isEnrolled) && (
            <TabsTrigger value="students">Students</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="prose max-w-none">
            <h2>About this Class</h2>
            <p>{classItem.description}</p>
          </div>

          {(classItem.startDate || classItem.endDate) && (
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Class Schedule</h3>
              {classItem.startDate && (
                <p>Starts: {formatDate(classItem.startDate)}</p>
              )}
              {classItem.endDate && (
                <p>Ends: {formatDate(classItem.endDate)}</p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lectures">
          <LectureList
            classId={classItem._id}
            lectures={classItem.lectures}
            isInstructor={isOwner}
            isEnrolled={isEnrolled}
          />
        </TabsContent>

        {(isOwner || isEnrolled) && (
          <TabsContent value="students">
            <EnrolledStudents
              classId={classItem._id}
              isInstructor={isOwner}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
} 