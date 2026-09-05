import { describe, expect, it } from "vitest";
import { electionState, sortNalissOffices } from "./elections";

describe("electionState", () => {
  const opens = new Date("2026-05-01T08:00:00Z");
  const closes = new Date("2026-05-03T18:00:00Z");
  it("reports upcoming, open, and closed windows", () => {
    expect(electionState(opens, closes, new Date("2026-04-30T23:00:00Z"))).toBe("upcoming");
    expect(electionState(opens, closes, new Date("2026-05-02T12:00:00Z"))).toBe("open");
    expect(electionState(opens, closes, new Date("2026-05-04T00:00:00Z"))).toBe("closed");
  });
});

describe("sortNalissOffices", () => {
  it("uses the official NALISS office hierarchy", () => {
    const positions = [
      { title: "Sports Director", slug: "sports-director" },
      { title: "President", slug: "president" },
      { title: "Public Relations Officer", slug: "public-relations-officer" },
      { title: "Social Director", slug: "social-director" },
      { title: "Assistant General Secretary", slug: "assistant-general-secretary" },
    ];
    expect(sortNalissOffices(positions).map((position) => position.slug)).toEqual([
      "president",
      "assistant-general-secretary",
      "social-director",
      "public-relations-officer",
      "sports-director",
    ]);
  });
});
