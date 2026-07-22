import { useParams, Link } from "wouter";
import { useGetQuestion } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, ChevronRight, AlertCircle, PlayCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function QuestionDetail() {
  const params = useParams();
  const id = Number(params.id);

  const { data: q, isLoading, isError } = useGetQuestion(id, {
    query: { enabled: !!id }
  });

  if (isLoading) {
    return <div className="container mx-auto px-6 py-24 text-center">Loading...</div>;
  }

  if (isError || !q) {
    return <div className="container mx-auto px-6 py-24 text-center">Question not found.</div>;
  }

  return (
    <div className="container mx-auto px-6 max-w-4xl py-12 space-y-8">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-8 -ml-4">
          <Link href="/questions">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Browse
          </Link>
        </Button>

        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="outline" className="bg-primary/5">{q.segmentName}</Badge>
          <ChevronRight className="h-4 w-4 text-muted-foreground my-auto" />
          <Badge variant="outline">{q.subjectName}</Badge>
          {q.chapterName && (
            <>
              <ChevronRight className="h-4 w-4 text-muted-foreground my-auto" />
              <Badge variant="outline">{q.chapterName}</Badge>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 mb-4">
          <Badge className="font-mono text-sm">{q.questionType}</Badge>
          <Badge variant={
            q.difficulty === 'hard' ? 'destructive' :
            q.difficulty === 'medium' ? 'secondary' : 'default'
          }>
            {q.difficulty}
          </Badge>
          {q.isPreviousYear && (
            <Badge variant="outline" className="bg-secondary/10 text-secondary-foreground border-secondary/20">
              {q.examName} {q.year}
            </Badge>
          )}
          {q.marks && (
            <span className="text-sm font-medium text-muted-foreground ml-auto">{q.marks} Marks</span>
          )}
        </div>
      </div>

      <Card className="shadow-lg border-primary/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <CardContent className="pt-8 text-lg leading-relaxed">
          {q.stimulusText && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg italic font-serif text-muted-foreground border border-muted">
              {q.stimulusText}
            </div>
          )}
          
          <div className="font-medium text-foreground whitespace-pre-wrap">
            {q.questionText}
          </div>

          {q.questionType === 'MCQ' && q.options && q.options.length > 0 && (
            <div className="mt-8 space-y-3">
              {q.options.sort((a, b) => a.orderNo - b.orderNo).map(opt => (
                <div 
                  key={opt.id} 
                  className={`flex gap-4 p-4 rounded-lg border transition-colors ${
                    opt.isCorrect 
                      ? "bg-primary/5 border-primary/20" 
                      : "bg-card border-border"
                  }`}
                >
                  <div className="font-mono font-bold text-muted-foreground pt-0.5">
                    {opt.optionLabel}.
                  </div>
                  <div className="flex-1">
                    <span className={opt.isCorrect ? "font-medium text-foreground" : "text-muted-foreground"}>
                      {opt.optionText}
                    </span>
                    {opt.isCorrect && (
                      <div className="flex items-center gap-2 mt-2 text-primary font-medium text-sm">
                        <CheckCircle2 className="h-4 w-4" /> Correct Answer
                      </div>
                    )}
                    {opt.isCorrect && opt.explanationText && (
                      <div className="mt-2 text-sm text-muted-foreground bg-background p-3 rounded border">
                        <span className="font-semibold block mb-1">Explanation:</span>
                        {opt.explanationText}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {q.questionType === 'CQ' && q.subParts && q.subParts.length > 0 && (
            <div className="mt-8 space-y-6">
              {q.subParts.sort((a, b) => a.orderNo - b.orderNo).map(part => (
                <div key={part.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-3">
                      <span className="font-mono font-bold text-muted-foreground">{part.partLabel}.</span>
                      <span className="font-medium">{part.partText}</span>
                    </div>
                    {part.marks && <Badge variant="outline">{part.marks}</Badge>}
                  </div>
                  
                  <div className="ml-8 mt-4 pt-4 border-t space-y-3">
                    {part.answerText && (
                      <div>
                        <span className="text-sm font-semibold text-primary block mb-1">Answer:</span>
                        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">{part.answerText}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {q.questionType === 'WRITTEN' && (
            <div className="mt-8 pt-6 border-t">
              <span className="text-sm font-semibold text-primary block mb-3">Sample Answer / Solution:</span>
              <div className="bg-primary/5 border border-primary/10 p-5 rounded-lg text-foreground whitespace-pre-wrap">
                {q.answerText || "No answer provided."}
              </div>
              {q.explanationText && (
                <div className="mt-4 text-sm text-muted-foreground bg-card border p-4 rounded-lg">
                  <span className="font-semibold block mb-2">Explanation:</span>
                  {q.explanationText}
                </div>
              )}
            </div>
          )}

          {q.videoSolutionUrl && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline" className="gap-2" asChild>
                <a href={q.videoSolutionUrl} target="_blank" rel="noopener noreferrer">
                  <PlayCircle className="h-4 w-4" /> Watch Video Solution
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
