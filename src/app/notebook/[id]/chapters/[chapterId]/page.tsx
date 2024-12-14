export default function ChapterPage({ params }: { params: { id: string; chapterId: string } }) {
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [completed, setCompleted] = useState(false);
  
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (chapter && !isEditing) {
      timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
        updateProgress();
      }
    };
  }, [chapter, isEditing]);

  const updateProgress = async () => {
    if (!chapter || !user) return;
    
    try {
      const apiUrl = process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
        : process.env.NEXT_PUBLIC_API_URL_DEV;

      await axios.post(`${apiUrl}/notebooks/${params.id}/chapters/${params.chapterId}/progress`, {
        timeSpent,
        completed
      }, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`
        }
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    if (!notebook) return;
    
    const currentIndex = notebook.chapters.findIndex(ch => ch._id === params.chapterId);
    const targetIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex >= 0 && targetIndex < notebook.chapters.length) {
      router.push(`/notebook/${params.id}/chapters/${notebook.chapters[targetIndex]._id}`);
    }
  };

  const handleMarkAsComplete = async () => {
    setCompleted(true);
    await updateProgress();
  };

  // ... existing fetchNotebookAndChapter and other handlers ...

  if (loading) {
    return <div className="p-8"><div className="animate-pulse">...</div></div>;
  }

  if (error) {
    return <div className="p-8"><div className="text-red-500">{error}</div></div>;
  }

  if (!notebook || !chapter) {
    return <div className="p-8"><div className="text-gray-500">Chapter not found</div></div>;
  }

  const isOwner = user?._id === notebook.owner;
  const currentIndex = notebook.chapters.findIndex(ch => ch._id === params.chapterId);
  const hasNext = currentIndex < notebook.chapters.length - 1;
  const hasPrev = currentIndex > 0;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{chapter.title}</h1>
            <p className="text-gray-600">From notebook: {notebook.title}</p>
          </div>
          {isOwner && (
            <div className="space-x-4">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              >
                Edit Chapter
              </button>
              <button
                onClick={handleDeleteChapter}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
              >
                Delete Chapter
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdateChapter} className="bg-white p-6 rounded shadow">
            {/* ... existing edit form ... */}
          </form>
        ) : (
          <>
            <div className="bg-white p-6 rounded shadow prose max-w-none">
              <ReactMarkdown>{chapter.content}</ReactMarkdown>
            </div>
            
            <div className="mt-8 flex justify-between items-center">
              <div className="flex space-x-4">
                {hasPrev && (
                  <button
                    onClick={() => handleNavigation('prev')}
                    className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                  >
                    ← Previous Chapter
                  </button>
                )}
                {hasNext && (
                  <button
                    onClick={() => handleNavigation('next')}
                    className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                  >
                    Next Chapter →
                  </button>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">
                  Time spent: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
                </span>
                {!completed && (
                  <button
                    onClick={handleMarkAsComplete}
                    className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
                  >
                    Mark as Complete
                  </button>
                )}
                {completed && (
                  <span className="text-green-500 flex items-center">
                    <CheckIcon className="w-5 h-5 mr-1" />
                    Completed
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 