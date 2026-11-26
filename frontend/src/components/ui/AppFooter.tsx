import { Link } from "react-router-dom";
import {
  Briefcase,
  Cpu,
  Database,
  GitBranch,
  Globe,
  Layers,
  Radio,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { BlackjackLogo } from "../ui/BlackjackLogo";
import { SOCIAL_LINKS } from "../../assets/links";

export interface AppFooterProps {
  className?: string;
}

const PLATFORM_LINKS = [
  { label: "Home", to: "/" },
  { label: "Rooms", to: "/rooms" },
  { label: "Wallet", to: "/wallet" },
  { label: "Profile", to: "/profile" },
];

const INFO_LINKS = [
  { label: "Game Rules", to: "/rules" },
  { label: "System Architecture", to: "/architecture" },
  { label: "About Developer", to: "/about" },
  { label: "Terms & Conditions", to: "/terms" },
];

const BUILT_WITH_STACK = [
  {
    name: "Spring Boot 4.1.2",
    href: "https://spring.io/projects/spring-boot",
    Icon: Cpu,
    iconClass: "text-emerald-400",
  },
  {
    name: "React & Vite",
    href: "https://react.dev/",
    Icon: Layers,
    iconClass: "text-amber-400",
  },
  {
    name: "PostgreSQL",
    href: "https://www.postgresql.org/docs/",
    Icon: Database,
    iconClass: "text-sky-400",
  },
  {
    name: "Redis Cache",
    href: "https://redis.io/docs/",
    Icon: Zap,
    iconClass: "text-rose-400",
  },
  {
    name: "WebSocket & STOMP",
    href: "https://docs.spring.io/spring-framework/reference/web/websocket/stomp.html",
    Icon: Radio,
    iconClass: "text-amber-300",
  },
];

export function AppFooter({ className = "" }: AppFooterProps) {
  return (
    <footer
      className={`border-t border-amber-500/15 bg-neutral-950 text-neutral-400 ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand + Summary + Social Icon Buttons */}
          <div className="space-y-4 lg:col-span-5">
            <BlackjackLogo size="md" />
            <p className="max-w-sm text-xs leading-relaxed text-neutral-400">
              Blackjack platform engineered with transactional chip settlement,
              real-time hand updates, and role-based management.
            </p>

            <div className="flex items-center gap-2.5 pt-1">
              <a
                href={SOCIAL_LINKS.github}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                title="GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/90 text-neutral-300 transition hover:border-amber-400/45 hover:bg-neutral-900 hover:text-amber-300"
              >
                <GitBranch className="h-4 w-4" />
              </a>

              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/90 text-neutral-300 transition hover:border-amber-400/45 hover:bg-neutral-900 hover:text-amber-300"
              >
                <Briefcase className="h-4 w-4" />
              </a>

              <a
                href={SOCIAL_LINKS.portfolio}
                target="_blank"
                rel="noreferrer"
                aria-label="Developer Portfolio"
                title="Portfolio"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/90 text-neutral-300 transition hover:border-amber-400/45 hover:bg-neutral-900 hover:text-amber-300"
              >
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* PLATFORM */}
          <div className="space-y-3.5 lg:col-span-2">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">
              Platform
            </h3>
            <ul className="space-y-2.5 text-xs">
              {PLATFORM_LINKS.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-neutral-300 transition hover:text-amber-300"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* PAGES & INFO */}
          <div className="space-y-3.5 lg:col-span-2">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">
              Explore
            </h3>
            <ul className="space-y-2.5 text-xs">
              {INFO_LINKS.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-neutral-300 transition hover:text-amber-300"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* BUILT WITH */}
          <div className="space-y-3.5 lg:col-span-3">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">
              Built With
            </h3>
            <ul className="space-y-2.5 text-xs">
              {BUILT_WITH_STACK.map(({ name, href, Icon, iconClass }) => (
                <li key={name}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2.5 text-neutral-300 transition hover:text-amber-300"
                  >
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${iconClass}`} />
                    <span>{name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="mt-10 flex flex-col gap-3 border-t border-neutral-800/80 pt-5 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2 text-neutral-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Blackjack Royale • Virtual Chips Only</span>
          </div>
          <p>© {new Date().getFullYear()} Aayush Kukreja • All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}