import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create categories
  const categories = [
    {
      name: 'Home Cleaning',
      icon: 'home',
      description: 'Professional cleaning services for your home',
      providerCount: 0,
    },
    {
      name: 'Plumbing',
      icon: 'wrench',
      description: 'Expert plumbers for all your needs',
      providerCount: 0,
    },
    {
      name: 'Electrical',
      icon: 'zap',
      description: 'Licensed electricians available 24/7',
      providerCount: 0,
    },
    {
      name: 'Landscaping',
      icon: 'trees',
      description: 'Transform your outdoor spaces',
      providerCount: 0,
    },
    {
      name: 'Moving',
      icon: 'truck',
      description: 'Reliable moving and packing services',
      providerCount: 0,
    },
    {
      name: 'Painting',
      icon: 'paintbrush',
      description: 'Interior and exterior painting experts',
      providerCount: 0,
    },
    {
      name: 'Handyman',
      icon: 'hammer',
      description: 'General repairs and maintenance',
      providerCount: 0,
    },
    {
      name: 'Pet Care',
      icon: 'dog',
      description: 'Trusted pet sitters and groomers',
      providerCount: 0,
    },
  ];

  console.log('📦 Seeding categories...');
  
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
    console.log(`  ✓ Created: ${created.name}`);
  }

  console.log('\n✅ Seed completed successfully!');
  console.log(`   - ${categories.length} categories created`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

