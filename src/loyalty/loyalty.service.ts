import { Injectable } from '@nestjs/common';
import { MembershipTier } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LoyaltyService {
  constructor(private prisma: PrismaService) {}

  private readonly tierThresholds = {
    SILVER: 1000,
    GOLD: 5000,
    PLATINUM: 10000,
  };

  async getOrCreateAccount(userId: string) {
    let account = await this.prisma.loyaltyAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      account = await this.prisma.loyaltyAccount.create({
        data: { userId },
      });
    }

    return account;
  }

  async addPoints(userId: string, points: number) {
    const account = await this.prisma.loyaltyAccount.update({
      where: { userId },
      data: {
        points: { increment: points },
      },
    });

    await this.updateTier(userId, account.points);
    return account;
  }

  private async updateTier(userId: string, points: number): Promise<void> {
    let newTier: MembershipTier = 'STANDARD';

    if (points >= this.tierThresholds.PLATINUM) {
      newTier = 'PLATINUM';
    } else if (points >= this.tierThresholds.GOLD) {
      newTier = 'GOLD';
    } else if (points >= this.tierThresholds.SILVER) {
      newTier = 'SILVER';
    }

    await this.prisma.loyaltyAccount.update({
      where: { userId },
      data: { tier: newTier },
    });
  }

  async getAccountDetails(userId: string) {
    const account = await this.prisma.loyaltyAccount.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      ...account,
      nextTier: this.getNextTierInfo(account.points),
    };
  }

  private getNextTierInfo(currentPoints: number) {
    const tiers = Object.entries(this.tierThresholds);
    for (const [tier, threshold] of tiers) {
      if (currentPoints < threshold) {
        return {
          tier,
          pointsNeeded: threshold - currentPoints,
        };
      }
    }
    return null; // Already at highest tier
  }
}
