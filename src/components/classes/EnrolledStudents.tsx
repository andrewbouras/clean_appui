import { useState, useEffect } from 'react';
import { classApi } from '@/lib/api';
import { EnrolledStudent } from '@/types/class';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface EnrolledStudentsProps {
  classId: string;
  isInstructor: boolean;
}

export default function EnrolledStudents({
  classId,
  isInstructor,
}: EnrolledStudentsProps) {
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, [classId]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await classApi.getEnrolledStudents(classId);
      setStudents(data);
    } catch (error) {
      console.error('Error loading enrolled students:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading students...</div>;
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No students enrolled yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Enrolled Students ({students.length})
        </h2>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Enrollment Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((enrollment) => (
            <TableRow key={enrollment.student._id}>
              <TableCell className="font-medium">
                {enrollment.student.name}
              </TableCell>
              <TableCell>{enrollment.student.email}</TableCell>
              <TableCell>{formatDate(enrollment.enrollmentDate)}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    enrollment.status === 'active'
                      ? 'default'
                      : enrollment.status === 'completed'
                      ? 'success'
                      : 'secondary'
                  }
                >
                  {enrollment.status.charAt(0).toUpperCase() +
                    enrollment.status.slice(1)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 