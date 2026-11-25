import {
  Ban,
  Coins,
  FileCheck2,
  Gavel,
  RefreshCw,
  Scale,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { GuestPageHeader } from "../../components/layout/guest/GuestPageHeader";
import { TermsSectionCard, type TermsSectionCardProps } from "../../components/guest/terms/TermsSectionCard";
import { TermsHighlightBanner } from "../../components/guest/terms/TermsHighlightBanner";


const TERMS_SECTIONS: TermsSectionCardProps[] = [
  {
    number: "01",
    title: "Acceptance & Eligibility",
    icon: UserCheck,
    points: [
      "By creating an account, accessing tables, or purchasing chip packs on Blackjack Royale, you agree to comply with these Terms & Conditions.",
      "You must be at least 18 years of age (or the legal age of majority in your jurisdiction) to register and play.",
      "You are responsible for maintaining the confidentiality of your account credentials and all actions performed under your session.",
    ],
  },
  {
    number: "02",
    title: "Virtual Chips & Entertainment Purpose",
    icon: Coins,
    points: [
      "Blackjack Royale operates strictly with virtual in-game chips for entertainment and skill-based table play.",
      "Chips have zero monetary value outside the platform and cannot be withdrawn, redeemed for real currency, sold, or transferred between user accounts.",
      "Daily streak rewards, promotional coupons, and purchased chip packs exist solely to fund gameplay inside Blackjack Royale rooms.",
    ],
  },
  {
    number: "03",
    title: "Chip Pack Purchases & Non-Refundable Policy",
    icon: Ban,
    points: [
      "All chip pack purchases are final, non-refundable, and non-exchangeable once payment is processed.",
      "No refunds will be issued for chips spent in gameplay, unused wallet balances, accidental pack selection, or account suspension caused by policy violations.",
      "Prices, pack quantities, and promotional coupon eligibility may be updated at any time prior to checkout.",
    ],
    callout:
      "Payment Deducted Without Chips? If your payment succeeds at the gateway but chips do not appear in your wallet, submit a Support Ticket under 'Payment & Chips' with your transaction reference. Our admin team will audit the payment attempt and credit your missing chips.",
  },
  {
    number: "04",
    title: "Fair Play & Prohibited Conduct",
    icon: ShieldCheck,
    points: [
      "Automated bots, scripts, multi-account farming, coupon abuse, or exploitation of race conditions and API endpoints are strictly prohibited.",
      "All shoe shuffles, card deals, and round settlements are computed deterministically on the server to ensure fair outcomes.",
      "We reserve the right to freeze wallets, void suspicious transactions, or permanently suspend accounts engaged in abuse or fraudulent chargebacks.",
    ],
  },
  {
    number: "05",
    title: "Account Deletion & Data Retention",
    icon: Gavel,
    points: [
      "You may request permanent account deletion from your Profile settings at any time.",
      "Upon deletion, personal profile details, OAuth links, active sessions, wallet balances, and open support tickets are cleared, while anonymized financial and audit logs may be retained for compliance.",
      "Deleted accounts and forfeited virtual chip balances cannot be restored once deletion is confirmed.",
    ],
  },
  {
    number: "06",
    title: "Service Availability & Updates to Terms",
    icon: RefreshCw,
    points: [
      "We may perform scheduled maintenance, update room rules, or adjust table limits to keep gameplay responsive and balanced.",
      "Blackjack Royale is provided on an 'as-is' and 'as-available' basis without warranties of uninterrupted uptime.",
      "Continued use of the platform after updates to these Terms & Conditions constitutes acceptance of the revised terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <GuestPageHeader
        eyebrow="Blackjack Royale · Legal & Policies"
        title="Terms & Conditions"
        subtitle="Please read these rules governing account usage, virtual chip packs, non-refundable payments, fair play, and support resolution."
      />

      <TermsHighlightBanner />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {TERMS_SECTIONS.map((section) => (
          <TermsSectionCard key={section.number} {...section} />
        ))}
      </div>

      <div className="mt-6 flex flex-col items-start justify-between gap-2 rounded-2xl border border-neutral-800/80 bg-neutral-900/50 px-5 py-4 text-xs text-neutral-400 sm:flex-row sm:items-center">
        <div className="inline-flex items-center gap-2">
          <FileCheck2 className="h-4 w-4 text-amber-400" />
          <span>Effective Date: November 2026 · Blackjack Royale</span>
        </div>
        <div className="inline-flex items-center gap-1.5 text-neutral-500">
          <Scale className="h-3.5 w-3.5" />
          <span>Questions? Sign in and raise a ticket in Support Center.</span>
        </div>
      </div>
    </section>
  );
}