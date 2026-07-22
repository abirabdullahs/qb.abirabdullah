import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-foreground">404</h1>
        <p className="text-lg text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
