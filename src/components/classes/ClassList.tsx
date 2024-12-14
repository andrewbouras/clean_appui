import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Class, ClassFilters } from '@/types/class';
import { classApi } from '@/lib/api';
import ClassCard from './ClassCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useSession } from 'next-auth/react';

const ClassList = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ClassFilters>({});
  const [view, setView] = useState<'all' | 'enrolled' | 'teaching'>('all');

  useEffect(() => {
    loadClasses();
  }, [view, filters]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      let response;

      switch (view) {
        case 'enrolled':
          response = await classApi.getEnrolledClasses();
          break;
        case 'teaching':
          response = await classApi.getTeachingClasses();
          break;
        default:
          response = await classApi.getClasses(filters);
      }

      setClasses(response);
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = () => {
    router.push('/classes/create');
  };

  const handleFilterChange = (key: keyof ClassFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Classes</h1>
        {session?.user?.role === 'instructor' && (
          <Button onClick={handleCreateClass}>Create Class</Button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Select
          value={view}
          onValueChange={(value: 'all' | 'enrolled' | 'teaching') => setView(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            <SelectItem value="enrolled">My Enrolled Classes</SelectItem>
            {session?.user?.role === 'instructor' && (
              <SelectItem value="teaching">My Teaching Classes</SelectItem>
            )}
          </SelectContent>
        </Select>

        <Select
          value={filters.category}
          onValueChange={(value) => handleFilterChange('category', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            <SelectItem value="Mathematics">Mathematics</SelectItem>
            <SelectItem value="Science">Science</SelectItem>
            <SelectItem value="History">History</SelectItem>
            <SelectItem value="Literature">Literature</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.level}
          onValueChange={(value) => handleFilterChange('level', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Levels</SelectItem>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Search classes..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full"
        />
      </div>

      {/* Class Grid */}
      {classes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No classes found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <ClassCard
              key={classItem._id}
              classItem={classItem}
              onRefresh={loadClasses}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassList; 