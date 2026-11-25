import { PlayingCardSprite } from "./PlayingCardSprite";

interface ActionScenario {
  badge: string;
  title: string;
  summary: string;
  note: string;
  cards: { code: string; caption: string; tilt?: number }[];
}

const SCENARIOS: ActionScenario[] = [
  {
    badge: "HIT",
    title: "Draw Another Card",
    summary: "Request one more card from the shoe to improve a low total.",
    note: "You can keep hitting until you stand, reach 21, or bust (> 21).",
    cards: [
      { code: "5C", caption: "5", tilt: -6 },
      { code: "7H", caption: "7", tilt: 0 },
      { code: "8D", caption: "+8 = 20", tilt: 6 },
    ],
  },
  {
    badge: "STAND",
    title: "Lock Your Hand",
    summary: "Keep your current total and pass the turn to the dealer.",
    note: "Strong totals like 18–20 are usually best held rather than risking a bust.",
    cards: [
      { code: "10H", caption: "10", tilt: -4 },
      { code: "9C", caption: "9 (Stand 19)", tilt: 4 },
    ],
  },
  {
    badge: "DOUBLE DOWN",
    title: "Double Bet, Take 1 Card",
    summary: "Match your original wager once and receive exactly one final card.",
    note: "Great on 9, 10, or 11 when the dealer shows a weak upcard.",
    cards: [
      { code: "6S", caption: "6", tilt: -5 },
      { code: "5D", caption: "11", tilt: 0 },
      { code: "KC", caption: "+10 = 21", tilt: 5 },
    ],
  },
  {
    badge: "SPLIT",
    title: "Divide a Pair Into Two Hands",
    summary: "Split two equal-value cards into separate hands with a matching bet.",
    note: "A 21 made after splitting counts as a regular 21 (1:1), not a natural blackjack.",
    cards: [
      { code: "8S", caption: "Hand 1", tilt: -5 },
      { code: "8H", caption: "Hand 2", tilt: 5 },
    ],
  },
  {
    badge: "SURRENDER",
    title: "Forfeit Early for Half Back",
    summary: "Give up your hand before acting to recover half of your initial bet.",
    note: "Useful when facing an unfavorable matchup and you want to cut losses.",
    cards: [
      { code: "10D", caption: "10", tilt: -4 },
      { code: "6H", caption: "16 (Half Back)", tilt: 4 },
    ],
  },
  {
    badge: "INSURANCE",
    title: "Side Bet When Dealer Shows Ace",
    summary: "When the dealer's upcard is an Ace, you can place a side wager.",
    note: "Pays 2:1 if the dealer's hole card gives them a natural blackjack.",
    cards: [
      { code: "AH", caption: "Dealer Ace", tilt: -3 },
      { code: "JH", caption: "Dealer 10", tilt: 4 },
    ],
  },
];

export function ActionsShowcase() {
  return (
    <section className="rounded-2xl border border-neutral-800/90 bg-neutral-900/75 p-5 shadow-xl shadow-black/30 sm:p-6">
      <div className="mb-5 border-b border-neutral-800/80 pb-4">
        <div className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
          Step 02 · Table Decisions
        </div>
        <h2 className="mt-0.5 text-lg font-bold text-white sm:text-xl">
          Every Move You Can Make at the Table
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {SCENARIOS.map((item) => (
          <div
            key={item.badge}
            className="flex flex-col justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-950/75 p-4 sm:flex-row sm:items-center"
          >
            <div className="min-w-0 flex-1">
              <span className="inline-flex rounded-md border border-amber-400/35 bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-300">
                {item.badge}
              </span>
              <h3 className="mt-2 text-sm font-bold text-white sm:text-base">
                {item.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-neutral-300">
                {item.summary}
              </p>
              <p className="mt-1.5 text-[11px] text-neutral-400">{item.note}</p>
            </div>

            <div className="flex shrink-0 items-center justify-center gap-1.5">
              {item.cards.map((c) => (
                <PlayingCardSprite
                  key={`${item.badge}-${c.code}-${c.caption}`}
                  code={c.code}
                  tiltDeg={c.tilt ?? 0}
                  caption={c.caption}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}