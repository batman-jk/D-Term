import { motion } from "framer-motion";
import { ArrowRight, Compass, ShieldCheck, Sparkles, GraduationCap, Lock, BarChart3, Users } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.21, 0.45, 0.32, 0.9] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden transition-colors duration-300">
      {/* ── Floating Header ── */}
      <header className="fixed top-0 left-0 right-0 z-[100] flex h-20 items-center justify-between px-6 md:px-12 backdrop-blur-lg bg-background/60 border-b border-border transition-colors duration-300">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center shadow-[0_0_20px_rgba(217,152,40,0.3)]">
            <ShieldCheck className="h-5 w-5 text-black" />
          </div>
          <span className="text-xl font-black tracking-tighter text-foreground">D-Term</span>
        </div>

        <nav className="hidden md:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">
          <a href="#scholar" className="hover:text-amber-500 dark:hover:text-amber-300 transition-colors uppercase">Scholar</a>
          <a href="#faculty" className="hover:text-amber-500 dark:hover:text-amber-300 transition-colors uppercase">Faculty</a>
        </nav>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <Button 
            variant="outline"
            className="hidden sm:flex h-10 rounded-full border-border bg-background hover:bg-muted text-[10px] font-bold uppercase tracking-widest text-foreground px-6"
            onClick={() => setLocation("/role-selection")}
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* ── High-end overlays ── */}
      <div className="noise-overlay" />
      <div className="fixed inset-0 bg-vignette pointer-events-none z-10 dark:opacity-100 opacity-20 transition-opacity duration-300" />

      {/* ── Fixed background layer ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,211,141,0.06),transparent_50%),linear-gradient(180deg,transparent_0%,var(--background)_70%,transparent_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(251,211,141,0.08),transparent_40%),linear-gradient(180deg,#06070b_0%,#050505_50%,#070608_100%)]" />
        <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.04] [background-image:linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] [background-size:80px_80px]" />
      </div>

      <div className="relative z-20">
        {/* ── Hero Section ── */}
        <section className="flex min-h-[90vh] flex-col items-center justify-center px-6 pt-24 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            className="flex max-w-5xl flex-col items-center"
          >
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-border bg-background/40 px-6 py-2.5 text-[10px] font-semibold uppercase tracking-[0.4em] text-muted-foreground backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
              Precision-led evaluation
            </div>
            <h1 className="mb-8 font-heading text-6xl font-black tracking-[-0.06em] text-foreground md:text-8xl lg:text-[10rem] leading-[0.85]">
              <span className="bg-gradient-to-b from-foreground via-foreground/90 to-foreground/40 bg-clip-text text-transparent">
                D-Term
              </span>
            </h1>
            <p className="max-w-2xl text-balance text-base leading-relaxed text-muted-foreground md:text-lg">
              Assess meaning, not memorised noise. A focused flow designed for 
              academic integrity and surgical precision.
            </p>
            
            <div className="mt-12 flex flex-col items-center gap-10">
              <Button
                size="lg"
                className="group h-16 rounded-full border border-primary/20 bg-primary text-primary-foreground px-12 text-sm font-black uppercase tracking-[0.25em] shadow-[0_20px_50px_rgba(var(--primary),0.25)] transition-all hover:scale-[1.05] hover:opacity-95 active:scale-[0.98]"
                onClick={() => setLocation("/role-selection")}
              >
                Get Started
                <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-2" />
              </Button>

              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="flex flex-col items-center gap-3"
              >
                <div className="h-10 w-px bg-gradient-to-b from-amber-400/50 to-transparent" />
                <span className="text-[9px] font-bold uppercase tracking-[0.5em] text-muted-foreground/60">Explore Platform</span>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ── Tagline Section ── */}
        <section className="flex min-h-[40vh] flex-col items-center justify-center px-6 py-12 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
            className="flex max-w-3xl flex-col items-center"
          >
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background/50 backdrop-blur-sm">
              <GraduationCap className="h-7 w-7 text-amber-500 dark:text-amber-300" />
            </div>
            <h2 className="mb-6 font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Built for <span className="text-amber-500 dark:text-amber-300">Integrity</span>
            </h2>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              Secret codes, fullscreen enforcement, and precise scoring rubrics.
              Every exam is controlled.
            </p>
            
            <motion.div 
              variants={staggerContainer}
              className="mt-12 grid grid-cols-3 gap-6 md:gap-12"
            >
              {[
                { icon: Lock, label: "Secure" },
                { icon: ShieldCheck, label: "Fair" },
                { icon: Sparkles, label: "Precise" },
              ].map(({ icon: Icon, label }) => (
                <motion.div key={label} variants={staggerItem} className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background/40 transition-colors hover:border-amber-500/30 group">
                    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-amber-500 dark:group-hover:text-amber-300 transition-colors" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground/70">{label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ── Scholar Section ── */}
        <section id="scholar" className="flex min-h-[40vh] items-center justify-center px-6 py-12 scroll-mt-20">
          <div className="flex w-full max-w-6xl flex-col md:flex-row md:items-center md:gap-20">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
              className="mb-12 md:mb-0 md:w-1/2"
            >
              <div className="mb-5 inline-flex rounded-2xl bg-sky-500/10 p-3">
                <ShieldCheck className="h-7 w-7 text-sky-500 dark:text-sky-400" />
              </div>
              <h2 className="mb-5 font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                The Scholar's Standard
              </h2>
              <p className="max-w-md text-base leading-relaxed text-muted-foreground">
                Terminology-heavy assessment into a guided experience built for clarity.
              </p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="space-y-4 md:w-1/2"
            >
              {[
                { text: "Terminology-focused assessment", desc: "Test true understanding" },
                { text: "Dynamic question bank systems", desc: "Curated pools" },
                { text: "Secure access protocols", desc: "Anti-cheat measures" },
              ].map((item) => (
                <motion.div
                  key={item.text}
                  variants={staggerItem}
                  className="group relative overflow-hidden rounded-xl border border-border bg-background/30 p-5 backdrop-blur-sm transition-all hover:bg-muted/30 hover:border-sky-500/30"
                >
                  <p className="text-sm font-bold text-foreground">{item.text}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground/60">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Faculty Section ── */}
        <section id="faculty" className="flex min-h-[40vh] items-center justify-center px-6 py-12 scroll-mt-20">
          <div className="flex w-full max-w-6xl flex-col md:flex-row-reverse md:items-center md:gap-20">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
              className="mb-12 md:mb-0 md:w-1/2"
            >
              <div className="mb-5 inline-flex rounded-2xl bg-amber-500/10 p-3">
                <Compass className="h-7 w-7 text-amber-500 dark:text-amber-400" />
              </div>
              <h2 className="mb-5 font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Faculty Command Centre
              </h2>
              <p className="max-w-md text-base leading-relaxed text-muted-foreground">
                Architect your curriculum with ease.
              </p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="space-y-4 md:w-1/2"
            >
              {[
                { icon: BarChart3, text: "Advanced analytics", desc: "Performance dashboards" },
                { icon: Users, text: "Student management", desc: "Organise classes" },
                { icon: Lock, text: "Exam controls", desc: "Time limits" },
              ].map((item) => (
                <motion.div
                  key={item.text}
                  variants={staggerItem}
                  className="group flex items-start gap-4 rounded-xl border border-border bg-background/30 p-5 backdrop-blur-sm transition-all hover:bg-muted/30 hover:border-amber-500/30"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background/40">
                    <item.icon className="h-4 w-4 text-amber-500 dark:text-amber-300" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{item.text}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground/60">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CTA Section ── */}
        <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-12 text-center mb-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            className="flex max-w-2xl flex-col items-center"
          >
            <div className="mb-8 h-px w-20 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
            <h2 className="mb-8 font-heading text-5xl font-black text-foreground md:text-6xl tracking-tight">
              Ready to Begin?
            </h2>
            <p className="mb-10 max-w-lg text-lg leading-relaxed text-muted-foreground/80">
              The platform is ready for real work.
            </p>
            <Button
              size="lg"
              className="group h-16 rounded-full border border-primary/20 bg-primary text-primary-foreground px-12 text-sm font-black uppercase tracking-[0.25em] shadow-[0_20px_50px_rgba(var(--primary),0.3)] transition-all hover:scale-[1.03] hover:opacity-95 active:scale-[0.98]"
              onClick={() => setLocation("/role-selection")}
            >
              Enter Platform
              <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-2" />
            </Button>
            <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.4em] text-muted-foreground/50">
              No registration required
            </p>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
