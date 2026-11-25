import { BlackjackHighlightsGrid } from "../../components/guest/about/BlackjackHighlightsGrid";
import { BlackjackTechStackGrid } from "../../components/guest/about/BlackjackTechStackGrid";
import { DeveloperHeroCard } from "../../components/guest/about/DeveloperHeroCard";
import { GuestPageHeader } from "../../components/layout/guest/GuestPageHeader";

export default function AboutDeveloperPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <GuestPageHeader
        eyebrow="Blackjack Royale · Developer & Project"
        title="About the Developer & Platform"
        subtitle="Meet the developer behind Blackjack Royale, how the game and wallet systems are engineered, and the core stack powering the application."
      />

      <div className="space-y-6">
        <DeveloperHeroCard />
        <BlackjackHighlightsGrid />
        <BlackjackTechStackGrid />
      </div>
    </section>
  );
}