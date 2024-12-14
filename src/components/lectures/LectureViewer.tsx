import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Lecture, ContentBlock, StudentProgress } from '@/types/class';
import { lectureApi } from '@/lib/api';
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDuration } from '@/lib/utils';
import { ChevronLeft, ChevronRight, FileText, Link, Download } from 'lucide-react';
import ContentBlockRenderer from './ContentBlockRenderer';

interface LectureViewerProps {
  lecture: Lecture;
  isInstructor: boolean;
  onNavigate?: (direction: 'prev' | 'next') => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export default function LectureViewer({
  lecture,
  isInstructor,
  onNavigate,
  hasPrevious = false,
  hasNext = false,
}: LectureViewerProps) {
  const router = useRouter();
  const [activeBlock, setActiveBlock] = useState(0);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    if (!isInstructor) {
      loadProgress();
    }
  }, [lecture._id]);

  const loadProgress = async () => {
    try {
      const data = await lectureApi.getProgress(lecture._id);
      setProgress(data);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const updateProgress = async () => {
    if (isInstructor) return;

    try {
      setLoading(true);
      const updatedProgress = {
        completed: activeBlock === lecture.content.length - 1,
        timeSpent: progress?.timeSpent || 0,
        quizScores: progress?.quizScores || [],
      };

      await lectureApi.updateProgress(lecture._id, updatedProgress);
      await loadProgress();
    } catch (error) {
      console.error('Error updating progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockComplete = async (blockIndex: number) => {
    if (blockIndex === activeBlock) {
      const nextBlock = activeBlock + 1;
      if (nextBlock < lecture.content.length) {
        setActiveBlock(nextBlock);
        await updateProgress();
      } else {
        await updateProgress();
        if (hasNext && onNavigate) {
          onNavigate('next');
        }
      }
    }
  };

  const handleQuizSubmit = async (blockIndex: number, score: number) => {
    if (isInstructor) return;

    try {
      setLoading(true);
      const updatedProgress = {
        ...progress,
        quizScores: [
          ...(progress?.quizScores || []),
          {
            questionId: lecture.content[blockIndex].content,
            score,
            attempts: 1,
          },
        ],
      };

      await lectureApi.updateProgress(lecture._id, updatedProgress);
      await loadProgress();
      handleBlockComplete(blockIndex);
    } catch (error) {
      console.error('Error updating quiz progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    if (!lecture.content.length) return 0;
    return Math.round((activeBlock / lecture.content.length) * 100);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">{lecture.title}</h1>
            <p className="text-gray-600 mt-1">
              Duration: {formatDuration(lecture.duration)}
            </p>
          </div>
          <Badge variant={
            lecture.status === 'published' ? 'default' :
            lecture.status === 'draft' ? 'secondary' : 'outline'
          }>
            {lecture.status.charAt(0).toUpperCase() + lecture.status.slice(1)}
          </Badge>
        </div>

        {!isInstructor && (
          <Progress value={getProgressPercentage()} className="h-2" />
        )}
      </div>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          {lecture.content.map((block, index) => (
            <Card
              key={index}
              className={`transition-opacity ${
                index === activeBlock || isInstructor
                  ? 'opacity-100'
                  : 'opacity-50'
              }`}
            >
              <CardHeader>
                <CardTitle className="text-lg">
                  Section {index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ContentBlockRenderer
                  block={block}
                  onComplete={() => handleBlockComplete(index)}
                  onQuizSubmit={(score) => handleQuizSubmit(index, score)}
                  isEnabled={index === activeBlock || isInstructor}
                />
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => onNavigate?.('prev')}
              disabled={!hasPrevious || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous Lecture
            </Button>
            <Button
              onClick={() => onNavigate?.('next')}
              disabled={
                !hasNext ||
                loading ||
                (!isInstructor && activeBlock < lecture.content.length - 1)
              }
            >
              Next Lecture
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
              <CardDescription>
                Additional materials for this lecture
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lecture.resources.length === 0 ? (
                <p className="text-gray-500">No resources available</p>
              ) : (
                <div className="space-y-4">
                  {lecture.resources.map((resource, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        {resource.type === 'pdf' ? (
                          <FileText className="h-5 w-5 text-red-500" />
                        ) : resource.type === 'link' ? (
                          <Link className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Download className="h-5 w-5 text-green-500" />
                        )}
                        <div>
                          <p className="font-medium">{resource.title}</p>
                          <p className="text-sm text-gray-500">
                            {resource.type.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(resource.url, '_blank')}
                      >
                        {resource.type === 'link' ? 'Visit' : 'Download'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 