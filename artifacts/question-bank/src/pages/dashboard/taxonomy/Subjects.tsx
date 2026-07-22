import { useListSubjects } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function SubjectsList() {
  const { data: subjects, isLoading } = useListSubjects();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
          <p className="text-muted-foreground mt-1">Manage academic subjects.</p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" /> Add Subject
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Subjects</CardTitle>
          <CardDescription>A list of all configured subjects in the system.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={3} className="text-center h-24">Loading...</TableCell></TableRow>
              ) : subjects?.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center h-24 text-muted-foreground">No subjects found.</TableCell></TableRow>
              ) : (
                subjects?.map(sub => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-mono text-muted-foreground">{sub.id}</TableCell>
                    <TableCell className="font-medium">{sub.name}</TableCell>
                    <TableCell>{sub.code || '-'}</TableCell>
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
