import { Injectable } from '@nestjs/common';
import { MembershipTier } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LoyaltyService {
  private readonly pointMultipliers = {
    STANDARD: 10, // 10 points per night
    DELUXE: 15, // 15 points per night
    SUITE: 25, // 25 points per night
    PRESIDENTIAL: 40, // 40 points per night
  };

  constructor(private prisma: PrismaService) {}

  private readonly tierThresholds = {
    SILVER: 1000,
    GOLD: 5000,
    PLATINUM: 10000,
  };

  private readonly tierDiscounts = {
    STANDARD: 0,
    SILVER: 0.05,
    GOLD: 0.1,
    PLATINUM: 0.15,
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

  async addPoints(
    userId: string,
    roomType: string,
    checkIn: Date,
    checkOut: Date,
  ) {
    const stayDuration = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
    );

    const pointsPerNight =
      this.pointMultipliers[roomType] || this.pointMultipliers.STANDARD;
    const totalPoints = pointsPerNight * stayDuration;

    const loyaltyAccount = await this.prisma.loyaltyAccount.update({
      where: { userId },
      data: {
        points: {
          increment: totalPoints,
        },
      },
    });

    // Update the tier based on new total points
    await this.updateTier(userId, loyaltyAccount.points);

    return loyaltyAccount;
  }

  public async updateTier(userId: string, points: number): Promise<void> {
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

  getTierDiscount(tier: MembershipTier): number {
    return this.tierDiscounts[tier] || 0;
  }
}
