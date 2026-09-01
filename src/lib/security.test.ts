import { describe, expect, it } from "vitest";
import { normalizeMatric, normalizeSurname } from "./security";

describe("identity normalization", () => {
  it("normalizes matriculation numbers without changing punctuation", () => {
    expect(normalizeMatric(" naliss/2023/001 ")).toBe("NALISS/2023/001");
  });
  it("normalizes surname casing and whitespace", () => {
    expect(normalizeSurname("  Oko  NKWỌ ")).toBe("oko nkwọ");
  });
});

