import { DashboardShell } from "@/components/layout/DashboardShell";
import { PublicShell } from "@/components/layout/PublicShell";
import { Route, Switch, Router as WouterRouter } from "wouter";

// Public Pages
import Home from "@/pages/Home";
import QuestionsList from "@/pages/public/QuestionsList";
import QuestionDetail from "@/pages/public/QuestionDetail";

// Dashboard Pages
import DashboardOverview from "@/pages/dashboard/Overview";
import QuestionsAdminList from "@/pages/dashboard/questions/List";
import QuestionCreate from "@/pages/dashboard/questions/Create";
import QuestionEdit from "@/pages/dashboard/questions/Edit";
import ReviewPending from "@/pages/dashboard/ReviewPending";

import QuestionSetsList from "@/pages/dashboard/question-sets/List";
import QuestionSetCreate from "@/pages/dashboard/question-sets/Create";
import QuestionSetDetail from "@/pages/dashboard/question-sets/Detail";

import SubjectsList from "@/pages/dashboard/taxonomy/Subjects";
import ChaptersList from "@/pages/dashboard/taxonomy/Chapters";
import TopicsList from "@/pages/dashboard/taxonomy/Topics";

import NotFound from "@/pages/not-found";

export function Router() {
  return (
    <Switch>
      {/* Dashboard Routes wrapped in DashboardShell */}
      <Route path="/dashboard*">
        <DashboardShell>
          <Switch>
            <Route path="/dashboard" component={DashboardOverview} />
            
            <Route path="/dashboard/questions" component={QuestionsAdminList} />
            <Route path="/dashboard/questions/new" component={QuestionCreate} />
            <Route path="/dashboard/questions/:id/edit" component={QuestionEdit} />
            
            <Route path="/dashboard/question-sets" component={QuestionSetsList} />
            <Route path="/dashboard/question-sets/new" component={QuestionSetCreate} />
            <Route path="/dashboard/question-sets/:id" component={QuestionSetDetail} />
            
            <Route path="/dashboard/review" component={ReviewPending} />
            
            <Route path="/dashboard/taxonomy/subjects" component={SubjectsList} />
            <Route path="/dashboard/taxonomy/chapters" component={ChaptersList} />
            <Route path="/dashboard/taxonomy/topics" component={TopicsList} />
            
            <Route component={NotFound} />
          </Switch>
        </DashboardShell>
      </Route>

      {/* Public Routes wrapped in PublicShell */}
      <Route path="*">
        <PublicShell>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/questions" component={QuestionsList} />
            <Route path="/questions/:id" component={QuestionDetail} />
            <Route component={NotFound} />
          </Switch>
        </PublicShell>
      </Route>
    </Switch>
  );
}
