import { useState } from "react";
import { useListSubjects, useListChapters } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

export default function ChaptersList() {
  const [subjectId, setSubjectId] = useState<number | undefined>();
  
  const { data: subjects } = useListSubjects();
  const { data: chapters, isLoading } = useListChapters(
    subjectId ? { subjectId } : undefined,
    { query: { enabled: true } }
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chapters</h1>
          <p className="text-muted-foreground mt-1">Manage chapters for subjects.</p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" /> Add Chapter
        </Button>
      </div>

      <div className="max-w-sm">
        <Select value={subjectId?.toString() || "all"} onValueChange={(v) => setSubjectId(v === "all" ? undefined : Number(v))}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects?.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chapters</CardTitle>
          <CardDescription>Configured chapters for the selected subject.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Chapter Name</TableHead>
                <TableHead>Order No</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={3} className="text-center h-24">Loading...</TableCell></TableRow>
              ) : chapters?.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center h-24 text-muted-foreground">No chapters found.</TableCell></TableRow>
              ) : (
                chapters?.map(chap => (
                  <TableRow key={chap.id}>
                    <TableCell className="font-mono text-muted-foreground">{chap.id}</TableCell>
                    <TableCell className="font-medium">{chap.name}</TableCell>
                    <TableCell>{chap.orderNo}</TableCell>
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
