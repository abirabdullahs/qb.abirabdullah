import { useState } from "react";
import { useListSubjects, useListChapters, useListTopics } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

export default function TopicsList() {
  const [subjectId, setSubjectId] = useState<number | undefined>();
  const [chapterId, setChapterId] = useState<number | undefined>();
  
  const { data: subjects } = useListSubjects();
  const { data: chapters } = useListChapters(
    subjectId ? { subjectId } : undefined,
    { query: { enabled: !!subjectId } }
  );
  const { data: topics, isLoading } = useListTopics(
    chapterId ? { chapterId } : undefined,
    { query: { enabled: true } }
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Topics</h1>
          <p className="text-muted-foreground mt-1">Manage topics under chapters.</p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" /> Add Topic
        </Button>
      </div>

      <div className="flex gap-4 max-w-2xl">
        <Select value={subjectId?.toString() || "none"} onValueChange={(v) => {
          setSubjectId(v === "none" ? undefined : Number(v));
          setChapterId(undefined);
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Select Subject First" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Select Subject</SelectItem>
            {subjects?.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={chapterId?.toString() || "all"} onValueChange={(v) => setChapterId(v === "all" ? undefined : Number(v))} disabled={!subjectId}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Chapter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Chapters</SelectItem>
            {chapters?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Topics</CardTitle>
          <CardDescription>Configured topics for the selected chapter.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Topic Name</TableHead>
                <TableHead>Order No</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={3} className="text-center h-24">Loading...</TableCell></TableRow>
              ) : topics?.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center h-24 text-muted-foreground">No topics found.</TableCell></TableRow>
              ) : (
                topics?.map(topic => (
                  <TableRow key={topic.id}>
                    <TableCell className="font-mono text-muted-foreground">{topic.id}</TableCell>
                    <TableCell className="font-medium">{topic.name}</TableCell>
                    <TableCell>{topic.orderNo}</TableCell>
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
