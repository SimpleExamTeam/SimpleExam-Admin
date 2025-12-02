import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { IconAlertTriangle } from "@tabler/icons-react"
import { Question } from "../data/schema"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface QuestionsBatchDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedRows: Question[]
  onConfirm: () => void
  isLoading?: boolean
}

export function QuestionsBatchDeleteDialog({
  open,
  onOpenChange,
  selectedRows,
  onConfirm,
  isLoading = false
}: QuestionsBatchDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[550px] w-[90vw]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center text-destructive">
            <IconAlertTriangle className="mr-2 h-5 w-5 shrink-0" />
            确认批量删除题目
          </AlertDialogTitle>
          
          <AlertDialogDescription>
            您确定要删除选中的 <span className="font-bold">{selectedRows.length}</span> 道题目吗？此操作不可逆。
          </AlertDialogDescription>
          
          {selectedRows.length > 0 && (
            <div className="mt-3 border rounded-md overflow-hidden">
              <div className="font-medium p-2 border-b bg-muted/50">选中的题目:</div>
              <ScrollArea className="max-h-[250px] overflow-y-auto">
                <ul className="text-sm divide-y">
                  {selectedRows.map((question) => (
                    <li 
                      key={question.id} 
                      className="flex items-start p-2 hover:bg-muted/30"
                    >
                      <div className="flex-shrink-0 min-w-[36px] text-right mr-2 font-medium text-muted-foreground">
                        {question.id}:
                      </div>
                      <div className="overflow-hidden flex-1">
                        <p 
                          className="line-clamp-2 text-sm break-words"
                          title={question.question}
                        >
                          {question.question}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="h-9" 
            disabled={isLoading}
          >
            取消
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className={cn(
              "bg-destructive hover:bg-destructive/90 text-white h-9",
              isLoading && "opacity-80 pointer-events-none"
            )}
            disabled={isLoading}
          >
            {isLoading ? "删除中..." : "删除"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 