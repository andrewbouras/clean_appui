export type Notebook = {
    _id: string
    title: string
    chapters: { _id: string; title: string; notebookId: string }[]
}

export type QuestionBank = {
    _id: string
    bankTitle: string
    bankUrl: string
    isEditor: boolean
    isCreator: boolean
}

export type UserRole = "admin" | "editor" | "viewer"

export interface SidebarProps {
    notebooks: Notebook[]
    questionBanks: QuestionBank[]
    selectedNotebook: Notebook | null
    onNotebookSelect: (notebook: Notebook | null) => void
    onDeleteNotebook: (id: string) => void
    onDeleteChapter: (notebookId: string, chapterId: string) => void
    isPremium: boolean
    userRole: UserRole
    onSettingsClick: () => void
    onShareClick: () => void
    isSidebarOpen?: boolean
    toggleSidebar?: () => void
    onNotebookCreate: (notebook: Notebook) => void
}