import { ActionsShowcase } from "../../components/guest/rules/ActionsShowcase";
import { CardValuesShowcase } from "../../components/guest/rules/CardValuesShowcase";
import { PayoutsAndDealerRules } from "../../components/guest/rules/PayoutsAndDealerRules";
import { GuestPageHeader } from "../../components/layout/guest/GuestPageHeader";

export default function GameRulesPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <GuestPageHeader
        eyebrow="Blackjack Royale · How to Play"
        title="Game Rules & Table Guide"
        subtitle="Learn card values, every player decision, dealer behavior, and hand settlement rules with visual examples before stepping up to a live room."
      />

      <div className="space-y-6">
        <CardValuesShowcase />
        <ActionsShowcase />
        <PayoutsAndDealerRules />
      </div>
    </section>
  );
}