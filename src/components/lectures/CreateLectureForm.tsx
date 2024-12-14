import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { lectureApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Lecture } from '@/types/class';
import { PlusCircle, X, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Form validation schema
const contentBlockSchema = z.object({
  type: z.enum(['text', 'image', 'video', 'code', 'quiz']),
  content: z.string().min(1, 'Content is required'),
  order: z.number(),
  metadata: z.record(z.string()).optional(),
});

const resourceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['pdf', 'link', 'file']),
  url: z.string().url('Must be a valid URL'),
});

const createLectureSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  status: z.enum(['draft', 'published', 'archived']),
  content: z.array(contentBlockSchema),
  resources: z.array(resourceSchema),
  prerequisites: z.array(z.string()).optional(),
});

type CreateLectureFormData = z.infer<typeof createLectureSchema>;

interface CreateLectureFormProps {
  classId: string;
  availableLectures?: Lecture[];
}

export default function CreateLectureForm({
  classId,
  availableLectures = [],
}: CreateLectureFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateLectureFormData>({
    resolver: zodResolver(createLectureSchema),
    defaultValues: {
      status: 'draft',
      content: [],
      resources: [],
      prerequisites: [],
    },
  });

  const { fields: contentFields, append: appendContent, remove: removeContent, move: moveContent } =
    useFieldArray({
      control: form.control,
      name: 'content',
    });

  const { fields: resourceFields, append: appendResource, remove: removeResource } =
    useFieldArray({
      control: form.control,
      name: 'resources',
    });

  const onSubmit = async (data: CreateLectureFormData) => {
    try {
      setLoading(true);
      const newLecture = await lectureApi.createLecture(classId, data);
      router.push(`/classes/${classId}/lectures/${newLecture._id}`);
    } catch (error) {
      console.error('Error creating lecture:', error);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    moveContent(result.source.index, result.destination.index);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Lecture</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter lecture title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter lecture description"
                        className="h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Blocks */}
          <Card>
            <CardHeader>
              <CardTitle>Content Blocks</CardTitle>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="content-blocks">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {contentFields.map((field, index) => (
                        <Draggable
                          key={field.id}
                          draggableId={field.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-start space-x-4 bg-muted p-4 rounded-lg"
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="mt-2 text-gray-400"
                              >
                                <GripVertical className="h-5 w-5" />
                              </div>

                              <div className="flex-grow space-y-4">
                                <FormField
                                  control={form.control}
                                  name={`content.${index}.type`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="text">Text</SelectItem>
                                          <SelectItem value="image">Image</SelectItem>
                                          <SelectItem value="video">Video</SelectItem>
                                          <SelectItem value="code">Code</SelectItem>
                                          <SelectItem value="quiz">Quiz</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`content.${index}.content`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Enter content"
                                          className="h-24"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeContent(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() =>
                  appendContent({
                    type: 'text',
                    content: '',
                    order: contentFields.length + 1,
                  })
                }
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Content Block
              </Button>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
            </CardHeader>
            <CardContent>
              {resourceFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-start space-x-4 bg-muted p-4 rounded-lg mb-4"
                >
                  <div className="flex-grow grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`resources.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Resource title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`resources.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pdf">PDF</SelectItem>
                              <SelectItem value="link">Link</SelectItem>
                              <SelectItem value="file">File</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`resources.${index}.url`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Resource URL" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeResource(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  appendResource({
                    title: '',
                    type: 'link',
                    url: '',
                  })
                }
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Lecture'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 