import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetQuestionSet, useAddQuestionToSet, useRemoveQuestionFromSet, useListQuestions, getGetQuestionSetQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function QuestionSetDetail() {
  const params = useParams();
  const id = Number(params.id);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: set, isLoading } = useGetQuestionSet(id, { query: { enabled: !!id } });
  const addQuestion = useAddQuestionToSet();
  const removeQuestion = useRemoveQuestionFromSet();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [page, setPage] = useState(1);
  const { data: availableQs, isLoading: isLoadingQs } = useListQuestions({
    page,
    limit: 10,
    status: 'approved'
  }, { query: { enabled: isAddOpen } });

  if (isLoading) return <div>Loading set...</div>;
  if (!set) return <div>Question set not found.</div>;

  const handleAdd = (questionId: number) => {
    addQuestion.mutate({ setId: id, data: { questionId, orderNo: set.items.length + 1 } }, {
      onSuccess: () => {
        toast({ title: "Added", description: "Question added to set." });
        queryClient.invalidateQueries({ queryKey: getGetQuestionSetQueryKey(id) });
      }
    });
  };

  const handleRemove = (questionId: number) => {
    removeQuestion.mutate({ setId: id, questionId }, {
      onSuccess: () => {
        toast({ title: "Removed", description: "Question removed from set." });
        queryClient.invalidateQueries({ queryKey: getGetQuestionSetQueryKey(id) });
      }
    });
  };

  const existingIds = new Set(set.items.map(i => i.questionId));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <Button variant="ghost" size="sm" asChild className="-ml-4 mb-2">
        <Link href="/dashboard/question-sets">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sets
        </Link>
      </Button>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{set.name}</h1>
          <p className="text-muted-foreground mt-1">
            Negative Marking: {set.negativeMarking} • {set.items.length} questions
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Questions
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Add Questions to Set</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-auto mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingQs ? (
                    <TableRow><TableCell colSpan={4} className="text-center h-24">Loading...</TableCell></TableRow>
                  ) : availableQs?.data.map(q => (
                    <TableRow key={q.id}>
                      <TableCell><Badge variant="outline">{q.questionType}</Badge></TableCell>
                      <TableCell className="max-w-[300px] truncate" title={q.questionText}>{q.questionText}</TableCell>
                      <TableCell>{q.subjectName}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant={existingIds.has(q.id) ? "secondary" : "default"}
                          disabled={existingIds.has(q.id) || addQuestion.isPending}
                          onClick={() => handleAdd(q.id)}
                        >
                          {existingIds.has(q.id) ? "Added" : "Add"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {availableQs && availableQs.total > availableQs.limit && (
              <div className="flex justify-between items-center pt-4 border-t mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {page}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                  <Button variant="outline" size="sm" disabled={page * availableQs.limit >= availableQs.total} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Questions in Set</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {set.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    This set is empty. Add questions to get started.
                  </TableCell>
                </TableRow>
              ) : (
                set.items.sort((a,b) => a.orderNo - b.orderNo).map((item, idx) => (
                  <TableRow key={`${item.setId}-${item.questionId}`}>
                    <TableCell className="font-medium text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell><Badge variant="outline" className="font-mono text-xs">{item.question?.questionType}</Badge></TableCell>
                    <TableCell>
                      <Link href={`/dashboard/questions/${item.questionId}/edit`} className="hover:underline font-medium">
                        {item.question?.questionText || `Question ID: ${item.questionId}`}
                      </Link>
                    </TableCell>
                    <TableCell>{item.marksOverride || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive"
                        onClick={() => handleRemove(item.questionId)}
                        disabled={removeQuestion.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
