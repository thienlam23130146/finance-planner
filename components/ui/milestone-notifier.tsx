"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { getNewMilestones, type WishlistTarget } from "@/lib/milestone";

const STORAGE_KEY = "finance_planner_notified_milestones";

export function MilestoneNotifier({
  items,
  balance,
}: {
  items: WishlistTarget[];
  balance: number;
}) {
  useEffect(() => {
    let savedKeys: string[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) savedKeys = JSON.parse(raw);
    } catch {
      savedKeys = [];
    }

    const notifiedSet = new Set(savedKeys);
    const freshNotifications = getNewMilestones(items, balance, notifiedSet);

    if (freshNotifications.length === 0) return;

    for (const item of freshNotifications) {
      toast.success(item.message);
      notifiedSet.add(item.key);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...notifiedSet]));
    } catch {
      // Bỏ qua nếu trình duyệt chặn storage
    }
  }, [items, balance]);

  return null;
}