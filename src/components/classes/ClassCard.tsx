import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Class } from '@/types/class';
import { classApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface ClassCardProps {
  classItem: Class;
  onRefresh: () => void;
}

const ClassCard = ({ classItem, onRefresh }: ClassCardProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const isInstructor = session?.user?.role === 'instructor';
  const isEnrolled = classItem.enrolledStudents.some(
    enrollment => enrollment.student._id === session?.user?.id && 
    enrollment.status === 'active'
  );

  const handleEnroll = async () => {
    try {
      setLoading(true);
      await classApi.enrollInClass(classItem._id);
      onRefresh();
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
      onRefresh();
    } catch (error) {
      console.error('Error unenrolling from class:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewClass = () => {
    router.push(`/classes/${classItem._id}`);
  };

  const handleEditClass = () => {
    router.push(`/classes/${classItem._id}/edit`);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{classItem.title}</CardTitle>
            <CardDescription className="mt-2">
              by {classItem.instructor.name}
            </CardDescription>
          </div>
          <Badge variant={classItem.isPublic ? 'default' : 'secondary'}>
            {classItem.isPublic ? 'Public' : 'Private'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 line-clamp-2">
            {classItem.description}
          </p>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{classItem.category}</Badge>
            <Badge variant="outline">{classItem.level}</Badge>
            {classItem.lectures.length > 0 && (
              <Badge variant="outline">
                {classItem.lectures.length} Lecture{classItem.lectures.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {(classItem.startDate || classItem.endDate) && (
            <div className="text-sm text-gray-500">
              {classItem.startDate && (
                <div>Starts: {formatDate(classItem.startDate)}</div>
              )}
              {classItem.endDate && (
                <div>Ends: {formatDate(classItem.endDate)}</div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        {isInstructor && classItem.instructor._id === session?.user?.id ? (
          <>
            <Button variant="outline" onClick={handleViewClass}>
              View Class
            </Button>
            <Button onClick={handleEditClass}>Edit Class</Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={handleViewClass}>
              Learn More
            </Button>
            {isEnrolled ? (
              <Button
                variant="destructive"
                onClick={handleUnenroll}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Unenroll'}
              </Button>
            ) : (
              <Button
                onClick={handleEnroll}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Enroll Now'}
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default ClassCard; 