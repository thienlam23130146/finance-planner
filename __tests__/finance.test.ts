import { describe, expect, test } from "vitest";
import { wishlistProgress } from "@/lib/finance";

describe("wishlistProgress", () => {
  test("tính % và làm tròn xuống", () => {
    expect(
      wishlistProgress(2_999_999, 4_000_000),
    ).toBe(74);
  });

  test("luôn nằm trong 0..100", () => {
    expect(wishlistProgress(-500_000, 1_000_000))
      .toBe(0);
    expect(wishlistProgress(9_000_000, 1_000_000))
      .toBe(100);
  });
});