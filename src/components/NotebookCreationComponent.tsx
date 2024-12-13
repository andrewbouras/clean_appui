import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notebookService } from '@/services/api';
import type { Notebook } from '@/services/api';
import { useToast } from "@/components/ui/use-toast";

interface NotebookCreationComponentProps {
  setShowAddNotebook: (show: boolean) => void;
  onNotebookCreate: (notebook: Notebook) => void;
}

export function NotebookCreationComponent({ 
  setShowAddNotebook, 
  onNotebookCreate 
}: NotebookCreationComponentProps) {
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your notebook",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const newNotebook = await notebookService.createNotebook(title);
      onNotebookCreate(newNotebook);
      setShowAddNotebook(false);
      toast({
        title: "Success",
        description: "Notebook created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create notebook",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => setShowAddNotebook(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Class</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Class Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter class title"
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddNotebook(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Class"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 