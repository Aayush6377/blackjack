import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, BookOpen, Code2, LogIn, Sparkles } from "lucide-react";

export function LandingCtaSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative mx-auto max-w-7xl px-4 pt-8 pb-20 sm:px-6 sm:pt-12 sm:pb-24 lg:px-8">
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.42, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl border border-amber-400/35 bg-gradient-to-br from-emerald-950/80 via-neutral-900/95 to-neutral-950 p-7 shadow-2xl shadow-black/75 sm:p-10 lg:p-12"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-10 hidden -translate-y-1/2 items-center lg:flex"
        >
          <motion.img
            src="/cards/AS.png"
            alt=""
            animate={
              prefersReducedMotion
                ? undefined
                : { y: [0, -10, 0], rotate: [-12, -9, -12] }
            }
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
            className="-mr-6 h-40 w-28 -rotate-12 rounded-2xl border border-amber-400/45 bg-neutral-900 object-cover opacity-85 shadow-2xl shadow-black/80"
          />
          <motion.img
            src="/cards/QH.png"
            alt=""
            animate={
              prefersReducedMotion
                ? undefined
                : { y: [0, 8, 0], rotate: [10, 13, 10] }
            }
            transition={{
              duration: 5.2,
              delay: 0.3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="h-40 w-28 rotate-12 rounded-2xl border border-emerald-400/45 bg-neutral-900 object-cover opacity-90 shadow-2xl shadow-black/80"
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Your Seat Is Open</span>
          </div>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready to Take Your Shot at{" "}
            <span className="text-amber-300">21</span>?
          </h2>

          <p className="mt-3 text-xs leading-relaxed text-neutral-300 sm:text-base">
            Create your free account, claim your first daily streak reward, and
            experience real-time Blackjack backed by Spring Boot, Redis, and
            PostgreSQL.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3.5">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-neutral-950 shadow-xl shadow-amber-500/20 transition hover:-translate-y-0.5 hover:bg-amber-400"
            >
              <span>Create Free Account</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-950/70 px-5 py-3.5 text-sm font-semibold text-emerald-200 transition hover:-translate-y-0.5 hover:border-emerald-400/70 hover:bg-emerald-950"
            >
              <LogIn className="h-4 w-4 text-emerald-400" />
              <span>Sign In</span>
            </Link>

            <Link
              to="/rules"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950/85 px-4 py-3.5 text-sm font-semibold text-neutral-300 transition hover:border-neutral-700 hover:text-white"
            >
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span>Read Rules</span>
            </Link>

            <Link
              to="/architecture"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950/85 px-4 py-3.5 text-sm font-semibold text-neutral-300 transition hover:border-neutral-700 hover:text-white"
            >
              <Code2 className="h-4 w-4 text-sky-400" />
              <span>Architecture</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}