import { Link } from "react-router-dom";
import { ArrowUpRight, ExternalLink, Terminal } from "lucide-react";
import { GitHubMark, LinkedInMark } from "./BrandSocialIcons";
import { SOCIAL_LINKS } from "../../../assets/links";

export function DeveloperHeroCard() {
  return (
    <section className="rounded-2xl border border-neutral-800/90 bg-neutral-900/80 p-6 shadow-2xl shadow-black/45 sm:p-8">
      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Left Developer Badge */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/25 bg-gradient-to-b from-emerald-950/40 via-neutral-950 to-neutral-950 p-6 text-center shadow-inner lg:col-span-4">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 shadow-lg shadow-emerald-950/60">
            <Terminal className="h-8 w-8" />
          </div>
          <div className="text-lg font-bold tracking-tight text-white">
            Aayush Kukreja
          </div>
          <div className="mt-0.5 text-xs font-medium text-emerald-300/90">
            Backend &amp; Full-Stack Engineer
          </div>
          <p className="mt-3 text-xs leading-relaxed text-neutral-400">
            Builder of Blackjack Royale — focused on reliable backend rules,
            real-time gameplay state, and clean full-stack architecture.
          </p>
        </div>

        {/* Right Project & Engineering Story */}
        <div className="lg:col-span-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <span>Blackjack Royale · Core Engineering</span>
          </div>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Engineered for{" "}
            <span className="text-emerald-400">Deterministic Table Play.</span>
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-neutral-300 sm:text-base">
            Blackjack Royale was built as a complete, server-driven Blackjack
            platform where card dealing, hand evaluation (including split hands,
            soft/hard aces, and natural blackjacks), chip wallet ledgers, daily
            rewards, coupons, support tickets, and live table updates stay
            synchronized without trusting client state.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-700/90 bg-neutral-950/90 px-4 py-2.5 text-xs font-semibold text-slate-100 transition hover:border-amber-400/50 hover:bg-neutral-900 sm:text-sm"
            >
              <GitHubMark className="h-4 w-4 text-slate-200" />
              <span>GitHub Profile</span>
              <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
            </a>

            <a
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-700/90 bg-neutral-950/90 px-4 py-2.5 text-xs font-semibold text-slate-100 transition hover:border-amber-400/50 hover:bg-neutral-900 sm:text-sm"
            >
              <LinkedInMark className="h-4 w-4 text-sky-400" />
              <span>LinkedIn</span>
              <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
            </a>

            <a
              href={SOCIAL_LINKS.portfolio}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-700/90 bg-neutral-950/90 px-4 py-2.5 text-xs font-semibold text-slate-100 transition hover:border-amber-400/50 hover:bg-neutral-900 sm:text-sm"
            >
              <span>Portfolio</span>
              <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
            </a>

            <Link
              to="/architecture"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-neutral-950 shadow-lg shadow-emerald-500/15 transition hover:bg-emerald-400 sm:text-sm"
            >
              <span>Explore Architecture</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}