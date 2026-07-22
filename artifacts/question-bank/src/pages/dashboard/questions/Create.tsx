import { useLocation } from "wouter";
import { useCreateQuestion } from "@workspace/api-client-react";
import { QuestionForm } from "@/components/dashboard/QuestionForm";
import { useToast } from "@/hooks/use-toast";

export default function QuestionCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createQuestion = useCreateQuestion();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Question</h1>
        <p className="text-muted-foreground mt-1">Add a new question to the archive.</p>
      </div>

      <QuestionForm 
        isSubmitting={createQuestion.isPending}
        onSubmit={(data) => {
          createQuestion.mutate({ data }, {
            onSuccess: () => {
              toast({ title: "Success", description: "Question created successfully." });
              setLocation("/dashboard/questions");
            },
            onError: (err: any) => {
              toast({ title: "Error", description: err.message || "Failed to create question.", variant: "destructive" });
            }
          });
        }}
      />
    </div>
  );
}
