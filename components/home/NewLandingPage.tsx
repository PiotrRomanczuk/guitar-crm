import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, Guitar, Rocket, Terminal } from 'lucide-react';

export function NewLandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <main className="container mx-auto px-4 py-16 max-w-7xl space-y-16 flex-1">
        
        {/* Hero Section */}
        <div className="text-center space-y-6 animate-fade-in">
          <div className="flex justify-center">
             <div className="p-4 bg-primary/10 rounded-full ring-1 ring-primary/20">
                <Guitar className="w-12 h-12 text-primary" />
             </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Guitar CRM
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The ultimate Student Management System for guitar teachers. 
              Manage lessons, track progress, and grow your studio with ease.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/sign-in">
              <Button size="lg" className="w-full sm:w-auto px-8 text-base">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 text-base">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
          
          {/* Project Features */}
          <Card className="hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Rocket className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Project Features</CardTitle>
                  <CardDescription>Built with modern web technologies</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Next.js 16 App Router",
                  "TypeScript Strict",
                  "Supabase Database",
                  "Zod Validation",
                  "Jest Testing",
                  "Tailwind CSS"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Development Tools */}
          <Card className="hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Terminal className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Development Ready</CardTitle>
                  <CardDescription>Automated workflows and scripts</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { cmd: "npm run setup", desc: "Complete environment setup" },
                  { cmd: "npm run new-feature", desc: "Create feature branch" },
                  { cmd: "npm run tdd", desc: "Start TDD workflow" },
                  { cmd: "npm run quality", desc: "Run quality checks" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                    <code className="text-xs font-mono bg-background px-2 py-1 rounded border border-border text-primary">
                      {item.cmd}
                    </code>
                    <span className="text-xs text-muted-foreground font-medium">{item.desc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
      
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border bg-card/50">
        <p>Built with Next.js, TypeScript & Supabase</p>
      </footer>
    </div>
  );
}
