import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    name: 'Plumbing',
    icon: '🔧',
    description: 'Professional plumbing services for repairs, installations, and maintenance',
  },
  {
    name: 'Electrical',
    icon: '⚡',
    description: 'Licensed electricians for wiring, repairs, and electrical installations',
  },
  {
    name: 'Cleaning',
    icon: '🧹',
    description: 'Professional cleaning services for homes and offices',
  },
  {
    name: 'Painting',
    icon: '🎨',
    description: 'Interior and exterior painting services by experienced painters',
  },
  {
    name: 'Carpentry',
    icon: '🔨',
    description: 'Custom woodwork, furniture repair, and carpentry services',
  },
  {
    name: 'HVAC',
    icon: '❄️',
    description: 'Heating, ventilation, and air conditioning services',
  },
  {
    name: 'Landscaping',
    icon: '🌳',
    description: 'Lawn care, garden maintenance, and landscaping design',
  },
  {
    name: 'Moving',
    icon: '📦',
    description: 'Professional moving and packing services',
  },
  {
    name: 'Appliance Repair',
    icon: '🔌',
    description: 'Repair and maintenance for home appliances',
  },
  {
    name: 'Pest Control',
    icon: '🐛',
    description: 'Pest inspection, removal, and prevention services',
  },
  {
    name: 'Locksmith',
    icon: '🔑',
    description: 'Lock installation, repair, and emergency lockout services',
  },
  {
    name: 'Handyman',
    icon: '🛠️',
    description: 'General home repairs and maintenance services',
  },
];

async function seed() {
  console.log('🌱 Seeding categories...');

  for (const category of categories) {
    const existing = await prisma.category.findUnique({
      where: { name: category.name },
    });

    if (!existing) {
      await prisma.category.create({
        data: category,
      });
      console.log(`✅ Created category: ${category.name}`);
    } else {
      console.log(`⏭️  Category already exists: ${category.name}`);
    }
  }

  console.log('🎉 Seeding completed!');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

