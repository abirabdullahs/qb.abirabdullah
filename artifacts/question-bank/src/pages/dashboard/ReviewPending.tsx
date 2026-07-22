import { useState } from "react";
import { Link } from "wouter";
import { useListQuestions, useUpdateQuestionStatus } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListQuestionsQueryKey } from "@workspace/api-client-react";
import { Check, X, Edit2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function ReviewPending() {
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useListQuestions({
    page,
    limit: 10,
    status: 'pending'
  });

  const updateStatus = useUpdateQuestionStatus();

  const handleStatusUpdate = (id: number, status: 'approved' | 'rejected') => {
    updateStatus.mutate({ questionId: id, data: { status } }, {
      onSuccess: () => {
        toast({
          title: `Question ${status}`,
          description: `Question has been ${status} successfully.`
        });
        queryClient.invalidateQueries({ queryKey: getListQuestionsQueryKey() });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to update question status.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Review Pending</h1>
        <p className="text-muted-foreground mt-1">Review and approve new questions submitted by contributors.</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading pending questions...</div>
        ) : response?.data.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-xl border border-dashed">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No pending questions</h3>
            <p className="text-muted-foreground">The review queue is empty.</p>
          </div>
        ) : (
          response?.data.map((q) => (
            <Card key={q.id}>
              <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <Badge variant="outline" className="font-mono">{q.questionType}</Badge>
                      <Badge variant="outline">{q.subjectName}</Badge>
                      <Badge variant="secondary">{q.difficulty}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground pt-1">
                      Submitted on {format(new Date(q.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/questions/${q.id}/edit`}>
                      <Edit2 className="h-4 w-4 mr-2" /> Edit Details
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="font-medium whitespace-pre-wrap">{q.questionText}</p>
                {/* Normally we'd want to fetch the full question here to see options/subparts 
                    if the user needs to review them. In a real app we might fetch the full question
                    or use an expander. For this list we show the summary and let them edit to see more. */}
              </CardContent>
              <CardFooter className="bg-muted/10 border-t flex justify-end gap-3 py-3">
                <Button 
                  variant="outline" 
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleStatusUpdate(q.id, 'rejected')}
                  disabled={updateStatus.isPending}
                >
                  <X className="mr-2 h-4 w-4" /> Reject
                </Button>
                <Button 
                  onClick={() => handleStatusUpdate(q.id, 'approved')}
                  disabled={updateStatus.isPending}
                >
                  <Check className="mr-2 h-4 w-4" /> Approve
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {response && response.total > response.limit && (
        <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
           <div className="text-sm text-muted-foreground">
            Showing {((page - 1) * response.limit) + 1} to Math.min(page * response.limit, response.total) of {response.total} pending
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" disabled={page * response.limit >= response.total} onClick={() => setPage(p => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
