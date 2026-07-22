import { Link } from "wouter";
import { useListQuestionSets, useDeleteQuestionSet } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListQuestionSetsQueryKey } from "@workspace/api-client-react";

export default function QuestionSetsList() {
  const { data: sets, isLoading } = useListQuestionSets();
  const deleteSet = useDeleteQuestionSet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this question set?")) {
      deleteSet.mutate({ setId: id }, {
        onSuccess: () => {
          toast({ title: "Deleted", description: "Question set removed." });
          queryClient.invalidateQueries({ queryKey: getListQuestionSetsQueryKey() });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Question Sets</h1>
          <p className="text-muted-foreground mt-1">Manage mock tests, exams, and bundled sets.</p>
        </div>
        <Button asChild className="shrink-0 gap-2">
          <Link href="/dashboard/question-sets/new">
            <PlusCircle className="h-4 w-4" /> Create Set
          </Link>
        </Button>
      </div>

      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Item Count</TableHead>
              <TableHead>Negative Marking</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell>
              </TableRow>
            ) : sets?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No question sets found.</TableCell>
              </TableRow>
            ) : (
              sets?.map((set) => (
                <TableRow key={set.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/question-sets/${set.id}`} className="hover:underline text-primary">
                      {set.name}
                    </Link>
                  </TableCell>
                  <TableCell>{set.itemCount} items</TableCell>
                  <TableCell>{set.negativeMarking}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(set.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/question-sets/${set.id}`}>
                          <Edit2 className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(set.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
