import { useState } from "react";
import { Link } from "wouter";
import { 
  useListQuestions, 
  useListSegments,
  useListSubjects,
  useListChapters 
} from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Search, Filter, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuestionsList() {
  const [page, setPage] = useState(1);
  const [segmentId, setSegmentId] = useState<number | undefined>();
  const [subjectId, setSubjectId] = useState<number | undefined>();
  const [chapterId, setChapterId] = useState<number | undefined>();
  const [difficulty, setDifficulty] = useState<string | undefined>();
  const [type, setType] = useState<string | undefined>();

  const { data: segments } = useListSegments();
  const { data: subjects } = useListSubjects();
  const { data: chapters } = useListChapters(subjectId ? { subjectId } : undefined, { query: { enabled: !!subjectId } });
  
  const { data: response, isLoading } = useListQuestions({
    page,
    limit: 20,
    segmentId,
    subjectId,
    chapterId,
    difficulty: difficulty as any,
    questionType: type as any,
    status: 'approved'
  });

  return (
    <div className="container mx-auto px-6 max-w-6xl py-12 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif italic tracking-tight text-primary">Browse Archive</h1>
          <p className="text-muted-foreground text-lg">Explore thousands of verified academic questions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-5 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 font-medium border-b pb-4">
              <Filter className="h-4 w-4" />
              <h3>Filters</h3>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Segment</label>
              <Select value={segmentId?.toString() || "all"} onValueChange={(v) => setSegmentId(v === "all" ? undefined : Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Segments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Segments</SelectItem>
                  {segments?.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject</label>
              <Select value={subjectId?.toString() || "all"} onValueChange={(v) => {
                setSubjectId(v === "all" ? undefined : Number(v));
                setChapterId(undefined);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects?.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {subjectId && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chapter</label>
                <Select value={chapterId?.toString() || "all"} onValueChange={(v) => setChapterId(v === "all" ? undefined : Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Chapters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Chapters</SelectItem>
                    {chapters?.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Difficulty</label>
              <Select value={difficulty || "all"} onValueChange={(v) => setDifficulty(v === "all" ? undefined : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</label>
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
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center bg-card p-3 rounded-xl border shadow-sm">
            <span className="text-sm font-medium text-muted-foreground">
              {response ? `${response.total} results found` : "Loading..."}
            </span>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="h-32 mt-4 bg-muted rounded-md" />
                </Card>
              ))
            ) : response?.data.length === 0 ? (
              <div className="text-center py-24 bg-card rounded-xl border border-dashed">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground">No questions found</h3>
                <p className="text-muted-foreground">Try adjusting your filters.</p>
              </div>
            ) : (
              response?.data.map((q) => (
                <Card key={q.id} className="hover:border-primary/50 transition-colors group cursor-pointer">
                  <Link href={`/questions/${q.id}`} className="block">
                    <CardHeader className="pb-3 flex flex-row justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="outline" className="bg-primary/5">{q.segmentName || "No Segment"}</Badge>
                          <Badge variant="outline">{q.subjectName || "No Subject"}</Badge>
                          <Badge className={
                            q.difficulty === 'hard' ? 'bg-destructive text-destructive-foreground' :
                            q.difficulty === 'medium' ? 'bg-secondary text-secondary-foreground' :
                            'bg-accent text-accent-foreground'
                          }>
                            {q.difficulty}
                          </Badge>
                          <Badge variant="secondary" className="font-mono text-xs">{q.questionType}</Badge>
                        </div>
                        <h3 className="font-medium text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {q.questionText}
                        </h3>
                      </div>
                    </CardHeader>
                  </Link>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {response && response.total > response.limit && (
            <div className="flex justify-center gap-2 pt-8">
              <Button 
                variant="outline" 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                disabled={page * response.limit >= response.total}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
