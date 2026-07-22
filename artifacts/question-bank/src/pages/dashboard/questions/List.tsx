import { useState } from "react";
import { Link } from "wouter";
import { useListQuestions } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Search, Edit2 } from "lucide-react";
import { format } from "date-fns";

export default function QuestionsAdminList() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | undefined>();
  const [type, setType] = useState<string | undefined>();

  const { data: response, isLoading } = useListQuestions({
    page,
    limit: 20,
    status: status as any,
    questionType: type as any
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Questions</h1>
          <p className="text-muted-foreground mt-1">Manage the question archive.</p>
        </div>
        <Button asChild className="shrink-0 gap-2">
          <Link href="/dashboard/questions/new">
            <PlusCircle className="h-4 w-4" /> Add Question
          </Link>
        </Button>
      </div>

      <div className="flex gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex-1 max-w-sm">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Status</div>
          <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? undefined : v)}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 max-w-sm">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Type</div>
          <Select value={type || "all"} onValueChange={(v) => setType(v === "all" ? undefined : v)}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="MCQ">MCQ</SelectItem>
              <SelectItem value="CQ">Creative (CQ)</SelectItem>
              <SelectItem value="WRITTEN">Written</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead className="w-1/2">Question</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell>
              </TableRow>
            ) : response?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No questions found.</TableCell>
              </TableRow>
            ) : (
              response?.data.map((q) => (
                <TableRow key={q.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">{q.questionType}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="line-clamp-2" title={q.questionText}>{q.questionText}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {q.subjectName || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      q.status === 'approved' ? 'default' :
                      q.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {q.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(q.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/questions/${q.id}/edit`}>
                        <Edit2 className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {response && response.total > response.limit && (
        <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
          <div className="text-sm text-muted-foreground">
            Showing {((page - 1) * response.limit) + 1} to Math.min(page * response.limit, response.total) of {response.total} results
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
