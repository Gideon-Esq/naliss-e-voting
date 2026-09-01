import { describe, expect, it } from "vitest";
import { electionState } from "./elections";

describe("electionState", () => {
  const opens = new Date("2026-05-01T08:00:00Z");
  const closes = new Date("2026-05-03T18:00:00Z");
  it("reports upcoming, open, and closed windows", () => {
    expect(electionState(opens, closes, new Date("2026-04-30T23:00:00Z"))).toBe("upcoming");
    expect(electionState(opens, closes, new Date("2026-05-02T12:00:00Z"))).toBe("open");
    expect(electionState(opens, closes, new Date("2026-05-04T00:00:00Z"))).toBe("closed");
  });
});

