import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, Guitar, Users, Music } from 'lucide-react';

export function NewLandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <main className="container mx-auto px-4 py-16 max-w-7xl space-y-16 flex-1">
        
        {/* Hero Section */}
        <div className="text-center space-y-6">
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
              The complete platform for modern guitar education. 
              Empowering teachers to manage their studios and inspiring students to master their craft.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/sign-in" prefetch={false}>
              <Button size="lg" className="w-full sm:w-auto px-8 text-base">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up" prefetch={false}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 text-base">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* For Teachers */}
          <Card className="hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>For Teachers</CardTitle>
                  <CardDescription>Streamline your studio management</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Student Management",
                  "Smart Scheduling",
                  "Lesson Plans & Notes",
                  "Payment Tracking",
                  "Repertoire Database",
                  "Automated Reminders"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* For Students */}
          <Card className="hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Music className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>For Students</CardTitle>
                  <CardDescription>Accelerate your learning journey</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Interactive Practice Logs",
                  "Song Library Access",
                  "Goal Tracking",
                  "Lesson History",
                  "Assignment Views",
                  "Progress Analytics"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

        </div>

        {/* Additional Value Prop / Social Proof (Optional placeholder) */}
        <div className="text-center pt-8 animate-fade-in opacity-0" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
           <p className="text-sm text-muted-foreground">
             Trusted by guitar teachers and music schools worldwide.
           </p>
        </div>

      </main>
      
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        <div className="container mx-auto px-4">
          &copy; {new Date().getFullYear()} Guitar CRM. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
