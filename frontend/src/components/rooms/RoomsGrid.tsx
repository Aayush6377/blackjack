import { useMemo, useState } from "react";
import type { RoomSummary } from "../../types/room";
import { RoomCard } from "./RoomCard";

type RoomFilter = "ALL" | "UNLOCKED" | "LOCKED";

interface RoomsGridProps {
  rooms: RoomSummary[];
  isLoading: boolean;
  onEnterRoom: (room: RoomSummary) => void;
  onInspectRules: (room: RoomSummary) => void;
}

export function RoomsGrid({
  rooms,
  isLoading,
  onEnterRoom,
  onInspectRules,
}: RoomsGridProps) {
  const [filter, setFilter] = useState<RoomFilter>("ALL");

  const sortedRooms = useMemo(
    () => [...rooms].sort((a, b) => a.displayOrder - b.displayOrder),
    [rooms]
  );

  const filteredRooms = useMemo(() => {
    if (filter === "UNLOCKED") return sortedRooms.filter((r) => r.unlocked);
    if (filter === "LOCKED") return sortedRooms.filter((r) => !r.unlocked);
    return sortedRooms;
  }, [sortedRooms, filter]);

  const unlockedCount = sortedRooms.filter((r) => r.unlocked).length;
  const lockedCount = sortedRooms.length - unlockedCount;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-80 animate-pulse rounded-2xl border border-zinc-800/80 bg-zinc-900/40"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(
            [
              { key: "ALL", label: `All Rooms (${sortedRooms.length})` },
              { key: "UNLOCKED", label: `Unlocked (${unlockedCount})` },
              { key: "LOCKED", label: `Locked (${lockedCount})` },
            ] as const
          ).map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  active
                    ? "bg-amber-400 text-zinc-950"
                    : "border border-zinc-800 bg-zinc-900/70 text-zinc-300 hover:border-zinc-700 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {filteredRooms.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-10 text-center text-sm text-zinc-400">
          No rooms match the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onEnterRoom={onEnterRoom}
              onInspectRules={onInspectRules}
            />
          ))}
        </div>
      )}
    </div>
  );
}