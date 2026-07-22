import { useGetDashboardStats, useGetRecentQuestions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { FileQuestion, CheckCircle, Clock, AlertTriangle, BookOpen, Layers } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function DashboardOverview() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: recent, isLoading: recentLoading } = useGetRecentQuestions();

  if (statsLoading || recentLoading) {
    return <div>Loading dashboard...</div>;
  }

  if (!stats) return <div>Failed to load stats.</div>;

  const difficultyData = [
    { name: 'Easy', value: stats.questionsByDifficulty.easy, color: 'hsl(var(--accent))' },
    { name: 'Medium', value: stats.questionsByDifficulty.medium, color: 'hsl(var(--secondary))' },
    { name: 'Hard', value: stats.questionsByDifficulty.hard, color: 'hsl(var(--destructive))' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">Metrics and recent activity across the question bank.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalQuestions.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{stats.pendingQuestions.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedQuestions.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sets</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSets.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Questions by Difficulty</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={difficultyData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Additions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recent?.map((question) => (
                <div key={question.id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none line-clamp-1 group-hover:underline">
                      <Link href={`/dashboard/questions/${question.id}/edit`}>
                        {question.questionText}
                      </Link>
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{question.questionType}</span>
                      <span>•</span>
                      <span>{question.subjectName}</span>
                      <span>•</span>
                      <span className={
                        question.status === 'pending' ? 'text-secondary' : 
                        question.status === 'approved' ? 'text-primary' : 'text-destructive'
                      }>
                        {question.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {!recent?.length && (
                <div className="text-sm text-muted-foreground py-4 text-center">No recent questions</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
