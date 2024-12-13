import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, Plus, Settings, Share2, MoreVertical, Trash2, Database, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import NotebookCreationComponent from "@/components/NotebookCreationComponent";
import { notebookService, type Notebook, type Chapter } from '@/services/api';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

type QuestionBank = {
  _id: string;
  bankTitle: string;
  bankUrl: string;
  isEditor: boolean;
  isCreator: boolean;
};

type UserRole = "admin" | "editor" | "viewer";

interface SidebarComponentProps {
  questionBanks: QuestionBank[];
  selectedNotebook: Notebook | null;
  setSelectedNotebook: (notebook: Notebook | null) => void;
  isPremium: boolean;
  setIsPremium: (isPremium: boolean) => void;
  gradientEffect: boolean;
  userRole: UserRole;
  shareAccess: "admin" | "editor" | "view-only";
  setShareAccess: (access: "admin" | "editor" | "view-only") => void;
  generateShareLink: () => void;
  shareLink: string;
  setShowShareModal: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  handleChapterClick: (notebookId: string, chapterId: string) => void;
}

const SidebarComponent = ({
  questionBanks,
  selectedNotebook,
  setSelectedNotebook,
  isPremium,
  setIsPremium,
  gradientEffect,
  userRole,
  shareAccess,
  setShareAccess,
  generateShareLink,
  shareLink,
  setShowShareModal,
  setShowSettings,
  handleChapterClick,
}: SidebarComponentProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [showAddNotebook, setShowAddNotebook] = useState(false);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notebooks on component mount
  useEffect(() => {
    fetchNotebooks();
  }, []);

  const fetchNotebooks = async () => {
    try {
      const fetchedNotebooks = await notebookService.getNotebooks();
      setNotebooks(fetchedNotebooks);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionBankClick = (bankUrl: string) => {
    router.push(`/bank/${bankUrl}`);
  };

  const handleDeleteNotebook = async (notebookId: string) => {
    try {
      await notebookService.deleteNotebook(notebookId);
      setNotebooks(notebooks.filter(notebook => notebook._id !== notebookId));
      if (selectedNotebook?._id === notebookId) {
        setSelectedNotebook(null);
      }
      toast({
        title: "Success",
        description: "Class deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete class",
        variant: "destructive",
      });
    }
  };

  const handleNotebookCreate = async (newNotebook: Notebook) => {
    setNotebooks(prev => [...prev, newNotebook]);
  };

  return (
    <div className="w-full md:w-64 bg-background border-r h-screen flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-primary flex items-center">
          Smartify
          {isPremium && <Sparkles className="ml-2 h-5 w-5 text-yellow-500" />}
        </h1>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="py-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-muted-foreground">Question Banks</h2>
            <Database className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            {questionBanks.map((bank) => (
              <Button
                key={bank._id}
                variant="ghost"
                className="w-full justify-start text-left font-normal"
                onClick={() => handleQuestionBankClick(bank.bankUrl)}
              >
                {bank.bankTitle}
              </Button>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        <div className="py-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-muted-foreground">Classes</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setShowAddNotebook(true)} className="h-8 w-8 p-0">
                    <span className="sr-only">Add class</span>
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add new class</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-1">
            {notebooks.slice().reverse().map((notebook) => (
              <div key={notebook._id} className="group relative flex items-center gap-1 hover:bg-secondary/80 rounded-md">
                <Button
                  variant={selectedNotebook?._id === notebook._id ? "secondary" : "ghost"}
                  className="w-[85%] justify-start text-left font-normal relative hover:bg-transparent"
                  onClick={() => setSelectedNotebook(notebook)}
                >
                  {notebook.title}
                </Button>
                <div className="absolute right-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setShowShareModal(true)}>
                        <Share2 className="mr-2 h-4 w-4" />
                        <span>Share</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteNotebook(notebook._id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(true)}
                className="w-full h-10 hover:bg-secondary/80 transition-colors"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {showAddNotebook && (
        <NotebookCreationComponent
          setShowAddNotebook={setShowAddNotebook}
          onNotebookCreate={handleNotebookCreate}
        />
      )}
    </div>
  );
};

export default SidebarComponent; 