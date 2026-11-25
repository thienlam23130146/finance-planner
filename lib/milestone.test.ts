import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getNewMilestones, type WishlistTarget } from "./milestone";

const sampleItems: WishlistTarget[] = [
  { id: "item-1", name: "chiếc laptop mới", cost: 20_000_000 },
  { id: "item-2", name: "tai nghe chống ồn", cost: 4_000_000 },
];

describe("getNewMilestones", () => {
  it("trả về mảng rỗng khi số dư <= 0 hoặc chưa đạt mốc 50%", () => {
    assert.deepEqual(getNewMilestones(sampleItems, 0, new Set()), []);
    assert.deepEqual(getNewMilestones(sampleItems, -500_000, new Set()), []);
    assert.deepEqual(getNewMilestones(sampleItems, 1_999_999, new Set()), []);
  });

  it("phát hiện đúng mốc 50%, 75%, 100% khi số dư đạt ngưỡng", () => {
    // 10.000.000 = 50% của laptop (20tr) và 250% (>= 100%) của tai nghe (4tr)
    const result = getNewMilestones(sampleItems, 10_000_000, new Set());

    assert.equal(result.length, 4);
    assert.equal(
      result[0].message,
      "Bạn đã tiết kiệm được 50% cho chiếc laptop mới!",
    );
    assert.deepEqual(
      result.map((r) => r.key),
      ["item-1:50", "item-2:50", "item-2:75", "item-2:100"],
    );
  });

  it("không lặp lại thông báo cho các mốc đã có trong notifiedKeys", () => {
    const alreadyNotified = new Set([
      "item-1:50",
      "item-2:50",
      "item-2:75",
      "item-2:100",
    ]);

    // Số dư tăng lên 15.000.000 (75% của laptop) -> chỉ báo mỗi mốc mới item-1:75
    const result = getNewMilestones(sampleItems, 15_000_000, alreadyNotified);

    assert.equal(result.length, 1);
    assert.equal(result[0].key, "item-1:75");
    assert.equal(
      result[0].message,
      "Bạn đã tiết kiệm được 75% cho chiếc laptop mới!",
    );
  });

  it("không báo lại nếu số dư giảm xuống rồi tăng vượt mốc cũ lần nữa", () => {
    const alreadyNotified = new Set(["item-1:50"]);

    // Số dư từng vượt 50%, sau đó chi tiêu giảm xuống còn 8tr, rồi nạp lại lên 11tr
    const result = getNewMilestones([sampleItems[0]], 11_000_000, alreadyNotified);

    assert.deepEqual(result, []);
  });
});