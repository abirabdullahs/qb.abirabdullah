import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Search, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground py-24 lg:py-32">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="/attached_assets/generated_images/hero-library.jpg" 
            alt="" 
            className="w-full h-full object-cover mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent" />
        </div>
        <div className="container relative z-10 mx-auto px-6 max-w-5xl">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-5xl lg:text-7xl font-serif italic tracking-tight leading-tight">
              A meticulously curated academic library.
            </h1>
            <p className="text-lg lg:text-xl text-primary-foreground/80 max-w-2xl font-light">
              EduBank is the definitive source for academic and admission questions in Bangladesh. Structured, verified, and accessible for educators and institutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-medium rounded-full px-8">
                <Link href="/questions">
                  Explore Archive <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Link href="/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-serif tracking-tight">Structured Taxonomy</h3>
              <p className="text-muted-foreground leading-relaxed">
                Questions organized by segment, subject, chapter, and topic. A true ontology of academic knowledge.
              </p>
            </div>
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-serif tracking-tight">Verified Quality</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every entry passes through a rigid moderation flow. No duplicates, no typos, no ambiguities.
              </p>
            </div>
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-serif tracking-tight">Deep Search</h3>
              <p className="text-muted-foreground leading-relaxed">
                Filter by difficulty, cognitive level, previous year records, and exact university unit requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative / CTA Section */}
      <section className="py-24 bg-card border-t border-b">
        <div className="container mx-auto px-6 max-w-5xl flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-4xl font-serif italic tracking-tight">Ready to contribute?</h2>
            <p className="text-muted-foreground text-lg">
              Join hundreds of educators building the most comprehensive open question bank in the country. Your expertise shapes the next generation.
            </p>
            <Button asChild size="lg" className="rounded-full mt-4">
              <Link href="/dashboard/questions/new">Submit a Question</Link>
            </Button>
          </div>
          <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl bg-muted aspect-video relative">
            <img 
              src="/attached_assets/generated_images/abstract-geometry.jpg" 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
