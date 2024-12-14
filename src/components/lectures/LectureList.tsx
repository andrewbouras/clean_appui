import { useState } from 'react';
import { useRouter } from 'next/router';
import { Lecture } from '@/types/class';
import { lectureApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDuration } from '@/lib/utils';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, PlayCircle, Lock } from 'lucide-react';

interface LectureListProps {
  classId: string;
  lectures: Lecture[];
  isInstructor: boolean;
  isEnrolled: boolean;
}

export default function LectureList({
  classId,
  lectures: initialLectures,
  isInstructor,
  isEnrolled,
}: LectureListProps) {
  const router = useRouter();
  const [lectures, setLectures] = useState<Lecture[]>(initialLectures);
  const [loading, setLoading] = useState(false);
  const [reordering, setReordering] = useState(false);

  const handleCreateLecture = () => {
    router.push(`/classes/${classId}/lectures/create`);
  };

  const handleEditLecture = (lectureId: string) => {
    router.push(`/classes/${classId}/lectures/${lectureId}/edit`);
  };

  const handleViewLecture = (lectureId: string) => {
    router.push(`/classes/${classId}/lectures/${lectureId}`);
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(lectures);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    setLectures(updatedItems);
    setReordering(true);

    try {
      await lectureApi.reorderLectures(classId, 
        updatedItems.map(item => ({
          lectureId: item._id,
          order: item.order,
        }))
      );
    } catch (error) {
      console.error('Error reordering lectures:', error);
    } finally {
      setReordering(false);
    }
  };

  const canAccessLecture = (lecture: Lecture) => {
    if (isInstructor) return true;
    if (!isEnrolled) return false;
    
    // Check prerequisites if any
    if (lecture.prerequisites.length > 0) {
      // In a real app, you'd check if the user has completed all prerequisites
      // For now, we'll just allow access if enrolled
      return true;
    }
    
    return lecture.status === 'published';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Lectures ({lectures.length})
        </h2>
        {isInstructor && (
          <Button
            onClick={handleCreateLecture}
            disabled={loading || reordering}
          >
            Add Lecture
          </Button>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="lectures">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {lectures.map((lecture, index) => (
                <Draggable
                  key={lecture._id}
                  draggableId={lecture._id}
                  index={index}
                  isDragDisabled={!isInstructor || reordering}
                >
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="relative"
                    >
                      {isInstructor && (
                        <div
                          {...provided.dragHandleProps}
                          className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="h-5 w-5" />
                        </div>
                      )}

                      <CardHeader className="pl-10">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              {lecture.title}
                            </CardTitle>
                            <CardDescription>
                              {formatDuration(lecture.duration)}
                            </CardDescription>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={
                              lecture.status === 'published' ? 'default' :
                              lecture.status === 'draft' ? 'secondary' : 'outline'
                            }>
                              {lecture.status.charAt(0).toUpperCase() + lecture.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pl-10">
                        <p className="text-sm text-gray-600 mb-4">
                          {lecture.description}
                        </p>

                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            {lecture.prerequisites.length > 0 && (
                              <Badge variant="outline">
                                {lecture.prerequisites.length} Prerequisite{lecture.prerequisites.length !== 1 ? 's' : ''}
                              </Badge>
                            )}
                            {lecture.resources.length > 0 && (
                              <Badge variant="outline">
                                {lecture.resources.length} Resource{lecture.resources.length !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {isInstructor ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditLecture(lecture._id)}
                              >
                                Edit
                              </Button>
                            ) : !canAccessLecture(lecture) ? (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                              >
                                <Lock className="h-4 w-4 mr-2" />
                                Locked
                              </Button>
                            ) : null}
                            
                            <Button
                              size="sm"
                              onClick={() => handleViewLecture(lecture._id)}
                              disabled={!canAccessLecture(lecture)}
                            >
                              <PlayCircle className="h-4 w-4 mr-2" />
                              {isInstructor ? 'Preview' : 'Start'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {lectures.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {isInstructor
              ? 'No lectures yet. Click "Add Lecture" to create your first lecture.'
              : 'No lectures available in this class yet.'}
          </p>
        </div>
      )}
    </div>
  );
} 