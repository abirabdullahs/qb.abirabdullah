import { useParams, useLocation } from "wouter";
import { useGetQuestion, useUpdateQuestion, useDeleteQuestion } from "@workspace/api-client-react";
import { QuestionForm } from "@/components/dashboard/QuestionForm";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

export default function QuestionEdit() {
  const params = useParams();
  const id = Number(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: q, isLoading } = useGetQuestion(id, { query: { enabled: !!id } });
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();

  if (isLoading) return <div>Loading question...</div>;
  if (!q) return <div>Question not found.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Question</h1>
          <p className="text-muted-foreground mt-1">Update details or change metadata.</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-2">
              <Trash2 className="h-4 w-4" /> Delete Question
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the question
                and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  deleteQuestion.mutate({ questionId: id }, {
                    onSuccess: () => {
                      toast({ title: "Deleted", description: "Question removed successfully." });
                      setLocation("/dashboard/questions");
                    }
                  });
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <QuestionForm 
        initialValues={q as any} // we cast to any because q has output fields not in input, but hook-form ignores them
        isSubmitting={updateQuestion.isPending}
        onSubmit={(data) => {
          updateQuestion.mutate({ questionId: id, data }, {
            onSuccess: () => {
              toast({ title: "Success", description: "Question updated successfully." });
              setLocation("/dashboard/questions");
            },
            onError: (err: any) => {
              toast({ title: "Error", description: err.message || "Failed to update question.", variant: "destructive" });
            }
          });
        }}
      />
    </div>
  );
}
