export const MILESTONES = [50, 75, 100] as const;
export type MilestonePercent = (typeof MILESTONES)[number];

export type WishlistTarget = {
  id: string;
  name: string;
  cost: number;
};

export type MilestoneNotification = {
  key: string; // Dạng `${itemId}:${percent}`, dùng để đánh dấu đã báo
  itemId: string;
  itemName: string;
  percent: MilestonePercent;
  message: string;
};

export function getNewMilestones(
  items: WishlistTarget[],
  balance: number,
  notifiedKeys: ReadonlySet<string>,
): MilestoneNotification[] {
  if (balance <= 0 || items.length === 0) return [];

  const notifications: MilestoneNotification[] = [];

  for (const item of items) {
    if (item.cost <= 0) continue;

    const currentRatio = (balance / item.cost) * 100;

    for (const percent of MILESTONES) {
      if (currentRatio >= percent) {
        const key = `${item.id}:${percent}`;
        if (!notifiedKeys.has(key)) {
          notifications.push({
            key,
            itemId: item.id,
            itemName: item.name,
            percent,
            message: `Bạn đã tiết kiệm được ${percent}% cho ${item.name}!`,
          });
        }
      }
    }
  }

  return notifications;
}