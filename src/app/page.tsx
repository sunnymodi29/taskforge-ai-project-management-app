import Link from "next/link";
import { Zap, Shield, BarChart3, Users, ArrowRight, CheckCircle2, Star, Code } from "lucide-react";
import { Button } from "@/components/ui";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">TrackEzz</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#solutions" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Solutions</Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Sign in</Link>
            <Link href="/login">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6 animate-fade-in">
              <Star className="h-3 w-3 fill-primary" />
              <span>Now with AI-powered Root Cause Analysis</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in">
              Build Faster. Track Smarter. <br />
              <span className="gradient-text">Ship Better.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              The next-gen project management platform for modern software teams. 
              Integrated bug tracking, sprint planning, and AI insights in one fast interface.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <Link href="/login">
                <Button size="lg" className="h-12 px-8 text-base">
                  Start for Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                <Code className="mr-2 h-5 w-5" /> Star on GitHub
              </Button>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Everything your team needs</h2>
              <p className="text-muted-foreground">Purpose-built for software development workflows.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Kanban & Sprints", icon: <CheckCircle2 className="h-6 w-6" />, desc: "Visual boards and flexible sprint management for agile teams." },
                { title: "AI-Powered Insights", icon: <Zap className="h-6 w-6" />, desc: "Automatic duplicate bug detection and root cause analysis." },
                { title: "Enterprise Security", icon: <Shield className="h-6 w-6" />, desc: "Role-based access control and detailed audit logs." },
                { title: "Advanced Analytics", icon: <BarChart3 className="h-6 w-6" />, desc: "Velocity charts, burndown metrics, and team performance stats." },
                { title: "Real-time Sync", icon: <Users className="h-6 w-6" />, desc: "Collaborate seamlessly with instant updates across all users." },
                { title: "Developer First", icon: <Code className="h-6 w-6" />, desc: "Keyboard shortcuts, command palette, and robust API integrations." },
              ].map((feature, i) => (
                <div key={i} className="p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-12">Trusted by teams at</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale">
              <span className="text-2xl font-bold">ACME</span>
              <span className="text-2xl font-bold">GLOBEX</span>
              <span className="text-2xl font-bold">SOYLENT</span>
              <span className="text-2xl font-bold">INITECH</span>
              <span className="text-2xl font-bold">UMBRELLA</span>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="p-12 rounded-3xl bg-primary text-primary-foreground relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to ship better software?</h2>
                <p className="text-lg text-primary-foreground/80 mb-10">
                  Join 10,000+ developers tracking their work with TrackEzz.
                </p>
                <Link href="/login">
                  <Button size="lg" variant="secondary" className="h-12 px-10 text-lg">
                    Get Started Now
                  </Button>
                </Link>
              </div>
              {/* Background Glow */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="font-bold">TrackEzz</span>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">Terms</Link>
            <Link href="#" className="hover:text-foreground">Privacy</Link>
            <Link href="#" className="hover:text-foreground">Security</Link>
            <Link href="#" className="hover:text-foreground">Help</Link>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TrackEzz. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
