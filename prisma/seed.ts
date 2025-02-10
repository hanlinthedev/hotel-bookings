import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing rooms
  await prisma.room.deleteMany({});

  // Seed rooms
  const rooms = [
    // Standard Rooms (1st and 2nd floor)
    ...Array(10)
      .fill(0)
      .map((_, i) => ({
        number: `1${(i + 1).toString().padStart(2, '0')}`,
        type: 'SINGLE',
        price: 299.99,
        capacity: 2,
        description:
          'Elegant single room with city view, king-size bed, and marble bathroom',
      })),
    ...Array(10)
      .fill(0)
      .map((_, i) => ({
        number: `2${(i + 1).toString().padStart(2, '0')}`,
        type: 'DOUBLE',
        price: 399.99,
        capacity: 3,
        description:
          'Spacious double room with balcony, two queen-size beds, and luxury amenities',
      })),

    // Luxury Suites (3rd floor)
    ...Array(8)
      .fill(0)
      .map((_, i) => ({
        number: `3${(i + 1).toString().padStart(2, '0')}`,
        type: 'SUITE',
        price: 699.99,
        capacity: 4,
        description:
          'Premium suite with separate living area, dining space, and panoramic views',
      })),

    // Deluxe Suites (4th floor)
    ...Array(4)
      .fill(0)
      .map((_, i) => ({
        number: `4${(i + 1).toString().padStart(2, '0')}`,
        type: 'DELUXE',
        price: 1299.99,
        capacity: 6,
        description:
          'Exclusive deluxe suite with private terrace, jacuzzi, and butler service',
      })),

    // Presidential Suite (Penthouse)
    {
      number: 'PH01',
      type: 'DELUXE',
      price: 2999.99,
      capacity: 8,
      description:
        'Presidential penthouse suite with 360-degree views, private pool, and exclusive amenities',
    },
  ];

  for (const room of rooms) {
    await prisma.room.create({
      data: room,
    });
  }

  console.log(`Seeded ${rooms.length} rooms`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
