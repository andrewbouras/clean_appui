"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Brain, FileText, Info, Blocks, ChevronRight, Pencil, Trash2, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { QuestionStyleExamples } from "./question-style-examples"

const questionStyles = [
  { id: "basic", icon: BookOpen, label: "Basic" },
  { id: "intermediate", icon: Blocks, label: "Intermediate" },
  { id: "advanced", icon: Brain, label: "Advanced" },
  { id: "vignette", icon: FileText, label: "Vignette" },
]

export function QuestionConfigDialog() {
  const [numQuestions, setNumQuestions] = React.useState<number>(1)
  const [questionStyle, setQuestionStyle] = React.useState<string>("intermediate")
  const [selectedClass, setSelectedClass] = React.useState<string>("")
  const [isNewClass, setIsNewClass] = React.useState<boolean>(false)
  const [newClassName, setNewClassName] = React.useState<string>("")
  const [lectureTitle, setLectureTitle] = React.useState<string>("")
  const [boldingOptions, setBoldingOptions] = React.useState<boolean>(false)
  const [introQuestions, setIntroQuestions] = React.useState<boolean>(false)
  const [uploadedStatements, setUploadedStatements] = React.useState<string[]>([
    "A common first-line treatment for restless legs syndrome is Gabapentin.",
    "Orexin is part of the waking system, while Acetylcholine (ACh) is involved in sleep induction.",
    "Paraneoplastic encephalomyelitis has antibodies against presynaptic (P/Q type) calcium channels in the neuromuscular junction (NMJ).",
    "Severe hypotonia in a 1-year-old boy, along with liver enlargement and elevated transaminases, suggests a possible mitochondrial disorder."
  ])
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null)
  const [editingValue, setEditingValue] = React.useState("")
  const [open, setOpen] = React.useState(true)

  const maxQuestions = 50

  const handleDeleteStatement = (index: number) => {
    setUploadedStatements(prev => prev.filter((_, i) => i !== index))
  }

  const handleEditStatement = (index: number, value: string) => {
    setUploadedStatements(prev => prev.map((statement, i) => 
      i === index ? value : statement
    ))
    setEditingIndex(null)
  }

  const isFormValid = 
    lectureTitle.trim() !== "" && 
    (isNewClass ? newClassName.trim() !== "" : selectedClass.trim() !== "");

  const handleNumQuestionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value)) {
      setNumQuestions(1);
    } else if (value > maxQuestions) {
      setNumQuestions(maxQuestions);
    } else if (value < 1) {
      setNumQuestions(1);
    } else {
      setNumQuestions(value);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle>Configure Question Generation</DialogTitle>
          <DialogDescription>
            Customize how your questions will be generated from the uploaded content.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-200px)] px-6 py-4">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">
                  Class <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <select
                      value={selectedClass}
                      onChange={(e) => {
                        setSelectedClass(e.target.value);
                        setIsNewClass(e.target.value === "new");
                        if (e.target.value !== "new") {
                          setNewClassName("");
                        }
                      }}
                      className="w-full px-3 py-2 bg-background text-foreground border rounded-lg focus:ring-2 focus:ring-primary transition-all duration-200"
                      required
                    >
                      <option value="">Select a class</option>
                      <option value="new">+ Add New Class</option>
                      <option value="class1">Neurology 101</option>
                      <option value="class2">Advanced Pathology</option>
                    </select>
                  </div>
                  {isNewClass && (
                    <div className="flex-1">
                      <Input
                        placeholder="Enter new class name"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        className="w-full px-3 py-2 bg-background text-foreground border rounded-lg focus:ring-2 focus:ring-primary transition-all duration-200"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">
                  Lecture Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                  placeholder="Enter lecture title"
                  className="w-full px-3 py-2 bg-background text-foreground border rounded-lg focus:ring-2 focus:ring-primary transition-all duration-200"
                  required
                />
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <Label htmlFor="num-questions" className="text-base font-medium">Number of Questions</Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="num-questions"
                  type="number"
                  min={1}
                  max={maxQuestions}
                  value={numQuestions}
                  onChange={handleNumQuestionsChange}
                  className="w-20 text-lg"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNumQuestions(maxQuestions)}
                  className="text-sm"
                >
                  Max ({maxQuestions})
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Question Style</Label>
                <QuestionStyleExamples />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {questionStyles.map((style) => {
                  const Icon = style.icon
                  return (
                    <Button
                      key={style.id}
                      variant={questionStyle === style.id ? "default" : "outline"}
                      className={cn(
                        "flex items-center justify-start space-x-3 h-16 px-4",
                        questionStyle === style.id && "ring-2 ring-primary"
                      )}
                      onClick={() => setQuestionStyle(style.id)}
                    >
                      <Icon className="h-6 w-6 flex-shrink-0" />
                      <span className="text-sm font-medium">{style.label}</span>
                    </Button>
                  )
                })}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="bolding-options" className="text-base font-medium">Bolding Options</Label>
                  <p className="text-sm text-muted-foreground">
                    {boldingOptions ? (
                      <span>Highlight <strong>key terms</strong> in questions</span>
                    ) : (
                      "Display questions without emphasis"
                    )}
                  </p>
                </div>
                <Switch
                  id="bolding-options"
                  checked={boldingOptions}
                  onCheckedChange={setBoldingOptions}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="intro-questions" className="text-base font-medium">Include Intro Questions</Label>
                  <p className="text-sm text-muted-foreground">
                    Add foundational questions for beginners
                  </p>
                </div>
                <Switch
                  id="intro-questions"
                  checked={introQuestions}
                  onCheckedChange={setIntroQuestions}
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Statements of Information</h3>
              <p className="text-sm text-muted-foreground">
                Review and edit the key concepts extracted from your PDF.
              </p>
              <div className="space-y-4">
                <AnimatePresence>
                  {uploadedStatements.map((statement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      className="group relative p-4 rounded-lg bg-background border shadow-sm 
                                hover:shadow-md hover:border-primary/20 transition-all duration-200"
                    >
                      {editingIndex === index ? (
                        <div className="flex gap-2">
                          <Textarea
                            autoFocus
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.metaKey) {
                                handleEditStatement(index, editingValue);
                              } else if (e.key === 'Escape') {
                                setEditingIndex(null);
                              }
                            }}
                            className="flex-1 text-sm min-h-[100px] resize-none"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="font-medium"
                              onClick={() => handleEditStatement(index, editingValue)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingIndex(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-4">
                            <p className="text-sm leading-relaxed text-foreground/90 pr-16">
                              {statement}
                            </p>
                            <div 
                              className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 
                                       transition-all duration-200 flex gap-1.5 bg-background/50 
                                       backdrop-blur-sm rounded-full p-1 shadow-sm border"
                            >
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                      onClick={() => {
                                        setEditingValue(statement);
                                        setEditingIndex(index);
                                      }}
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit statement (⌘/Ctrl + Enter to save)</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                      onClick={() => handleDeleteStatement(index)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete statement</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Statement {index + 1}</span>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {uploadedStatements.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-base font-medium">No statements available</p>
                    <p className="text-sm">Upload a PDF to extract key information</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="p-6 pt-4">
          <Button 
            type="submit" 
            size="lg" 
            className="w-full"
            disabled={!isFormValid}
          >
            {!isFormValid ? "Please fill required fields" : "Generate Questions"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 