import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...\n');

  // ──────────────────────────────────────
  //  1. Upsert Categories
  // ──────────────────────────────────────
  const categoryData = [
    { name: 'Plumbing',         icon: '🔧', description: 'Professional plumbing services for repairs, installations, and maintenance' },
    { name: 'Electrical',       icon: '⚡', description: 'Licensed electricians for wiring, repairs, and electrical installations' },
    { name: 'Cleaning',         icon: '🧹', description: 'Professional cleaning services for homes and offices' },
    { name: 'Painting',         icon: '🎨', description: 'Interior and exterior painting services by experienced painters' },
    { name: 'Carpentry',        icon: '🔨', description: 'Custom woodwork, furniture repair, and carpentry services' },
    { name: 'HVAC',             icon: '❄️', description: 'Heating, ventilation, and air conditioning services' },
    { name: 'Landscaping',      icon: '🌳', description: 'Lawn care, garden maintenance, and landscaping design' },
    { name: 'Moving',           icon: '📦', description: 'Professional moving and packing services' },
    { name: 'Appliance Repair', icon: '🔌', description: 'Repair and maintenance for home appliances' },
    { name: 'Pest Control',     icon: '🐛', description: 'Pest inspection, removal, and prevention services' },
    { name: 'Locksmith',        icon: '🔑', description: 'Lock installation, repair, and emergency lockout services' },
    { name: 'Handyman',         icon: '🛠️', description: 'General home repairs and maintenance services' },
  ];

  console.log('📦 Seeding categories...');
  const categories: Record<string, string> = {};
  for (const cat of categoryData) {
    const created = await prisma.category.upsert({
      where: { name: cat.name },
      update: { icon: cat.icon, description: cat.description },
      create: cat,
    });
    categories[cat.name] = created.id;
    console.log(`  ✓ ${cat.name}`);
  }

  // ──────────────────────────────────────
  //  2. Seed Provider Users + Profiles
  // ──────────────────────────────────────
  const password = await bcrypt.hash('Provider@123', 10);

  const providers = [
    {
      email: 'john.plumber@demo.com',
      name: 'John Miller',
      phone: '+1 555-101-0001',
      location: 'New York, NY',
      category: 'Plumbing',
      bio: 'Licensed master plumber with 12 years of experience. Specializing in residential and commercial plumbing, leak repairs, and bathroom renovations.',
      hourlyRate: 65,
      skills: ['Leak Repair', 'Pipe Installation', 'Drain Cleaning', 'Water Heater', 'Bathroom Remodeling'],
      yearsExperience: 12,
      rating: 4.8,
      reviewCount: 47,
      completedJobs: 210,
      verified: true,
    },
    {
      email: 'sarah.electric@demo.com',
      name: 'Sarah Chen',
      phone: '+1 555-101-0002',
      location: 'San Francisco, CA',
      category: 'Electrical',
      bio: 'Certified electrician focused on smart-home installations, rewiring, and energy efficiency upgrades. Safety is my top priority.',
      hourlyRate: 75,
      skills: ['Wiring', 'Panel Upgrades', 'Smart Home', 'Lighting', 'EV Charger Install'],
      yearsExperience: 8,
      rating: 4.9,
      reviewCount: 62,
      completedJobs: 185,
      verified: true,
    },
    {
      email: 'maria.clean@demo.com',
      name: 'Maria Garcia',
      phone: '+1 555-101-0003',
      location: 'Los Angeles, CA',
      category: 'Cleaning',
      bio: 'Professional cleaner running a small team. We offer deep cleaning, move-in/move-out cleaning, and regular maintenance.',
      hourlyRate: 40,
      skills: ['Deep Cleaning', 'Move In/Out', 'Office Cleaning', 'Carpet Cleaning', 'Window Cleaning'],
      yearsExperience: 6,
      rating: 4.7,
      reviewCount: 93,
      completedJobs: 420,
      verified: true,
    },
    {
      email: 'david.paint@demo.com',
      name: 'David Thompson',
      phone: '+1 555-101-0004',
      location: 'Chicago, IL',
      category: 'Painting',
      bio: 'Award-winning painter with an eye for detail. Interior and exterior work, wallpaper removal, and color consultation included.',
      hourlyRate: 55,
      skills: ['Interior Painting', 'Exterior Painting', 'Wallpaper', 'Color Consultation', 'Cabinet Refinishing'],
      yearsExperience: 15,
      rating: 4.9,
      reviewCount: 38,
      completedJobs: 160,
      verified: true,
    },
    {
      email: 'ahmed.hvac@demo.com',
      name: 'Ahmed Hassan',
      phone: '+1 555-101-0005',
      location: 'Houston, TX',
      category: 'HVAC',
      bio: 'EPA-certified HVAC technician. Installations, repairs, and preventive maintenance for all major brands.',
      hourlyRate: 70,
      skills: ['AC Repair', 'Furnace Install', 'Duct Cleaning', 'Thermostat Setup', 'Maintenance Plans'],
      yearsExperience: 10,
      rating: 4.6,
      reviewCount: 29,
      completedJobs: 145,
      verified: true,
    },
    {
      email: 'lisa.landscape@demo.com',
      name: 'Lisa Nguyen',
      phone: '+1 555-101-0006',
      location: 'Seattle, WA',
      category: 'Landscaping',
      bio: 'Passionate landscaper who transforms outdoor spaces. From lawn care to full garden design and irrigation systems.',
      hourlyRate: 50,
      skills: ['Lawn Care', 'Garden Design', 'Irrigation', 'Tree Trimming', 'Hardscaping'],
      yearsExperience: 7,
      rating: 4.8,
      reviewCount: 54,
      completedJobs: 230,
      verified: true,
    },
    {
      email: 'mike.handy@demo.com',
      name: 'Mike Johnson',
      phone: '+1 555-101-0007',
      location: 'Denver, CO',
      category: 'Handyman',
      bio: 'Jack of all trades. I handle drywall, shelving, furniture assembly, minor plumbing, and just about anything around the house.',
      hourlyRate: 45,
      skills: ['Drywall Repair', 'Furniture Assembly', 'Shelving', 'Door Install', 'General Repairs'],
      yearsExperience: 9,
      rating: 4.5,
      reviewCount: 71,
      completedJobs: 350,
      verified: false,
    },
    {
      email: 'emma.carpenter@demo.com',
      name: 'Emma Williams',
      phone: '+1 555-101-0008',
      location: 'Portland, OR',
      category: 'Carpentry',
      bio: 'Custom carpentry and woodwork. From kitchen cabinets to built-in bookshelves, I bring your ideas to life.',
      hourlyRate: 60,
      skills: ['Custom Cabinets', 'Deck Building', 'Trim Work', 'Framing', 'Furniture Making'],
      yearsExperience: 11,
      rating: 4.7,
      reviewCount: 33,
      completedJobs: 125,
      verified: true,
    },
    {
      email: 'carlos.move@demo.com',
      name: 'Carlos Rivera',
      phone: '+1 555-101-0009',
      location: 'Miami, FL',
      category: 'Moving',
      bio: 'Professional mover with a reliable crew. Local and long-distance moves, packing, and specialty item handling.',
      hourlyRate: 55,
      skills: ['Local Moving', 'Long Distance', 'Packing Service', 'Piano Moving', 'Storage Solutions'],
      yearsExperience: 5,
      rating: 4.4,
      reviewCount: 42,
      completedJobs: 190,
      verified: false,
    },
    {
      email: 'rachel.pest@demo.com',
      name: 'Rachel Kim',
      phone: '+1 555-101-0010',
      location: 'Austin, TX',
      category: 'Pest Control',
      bio: 'Licensed pest control specialist. Eco-friendly treatments for termites, rodents, ants, and more. Free inspections.',
      hourlyRate: 60,
      skills: ['Termite Treatment', 'Rodent Control', 'Ant Removal', 'Bed Bug Treatment', 'Eco-Friendly'],
      yearsExperience: 8,
      rating: 4.6,
      reviewCount: 25,
      completedJobs: 110,
      verified: true,
    },
    {
      email: 'james.lock@demo.com',
      name: 'James Brown',
      phone: '+1 555-101-0011',
      location: 'Boston, MA',
      category: 'Locksmith',
      bio: 'Reliable locksmith available 24/7. Lockouts, rekeying, smart lock installation, and security consultations.',
      hourlyRate: 50,
      skills: ['Emergency Lockout', 'Lock Rekeying', 'Smart Locks', 'Safe Opening', 'Security Audit'],
      yearsExperience: 13,
      rating: 4.8,
      reviewCount: 58,
      completedJobs: 300,
      verified: true,
    },
    {
      email: 'sophie.appliance@demo.com',
      name: 'Sophie Martinez',
      phone: '+1 555-101-0012',
      location: 'Phoenix, AZ',
      category: 'Appliance Repair',
      bio: 'Factory-trained technician for all major appliance brands. Washers, dryers, refrigerators, ovens — I fix them all.',
      hourlyRate: 55,
      skills: ['Washer Repair', 'Dryer Repair', 'Refrigerator', 'Oven Repair', 'Dishwasher'],
      yearsExperience: 7,
      rating: 4.5,
      reviewCount: 36,
      completedJobs: 175,
      verified: true,
    },
  ];

  console.log('\n👤 Seeding provider users & profiles...');
  let created = 0;
  let skipped = 0;

  for (const p of providers) {
    const existing = await prisma.user.findUnique({ where: { email: p.email } });
    if (existing) {
      console.log(`  ⏭️  Already exists: ${p.name} (${p.email})`);
      skipped++;
      continue;
    }

    const categoryId = categories[p.category];
    if (!categoryId) {
      console.log(`  ⚠️  Category not found for ${p.name}: ${p.category}`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        email: p.email,
        password,
        name: p.name,
        phone: p.phone,
        location: p.location,
        role: 'PROVIDER',
        verified: true,
        provider: {
          create: {
            categoryId,
            bio: p.bio,
            hourlyRate: p.hourlyRate,
            skills: p.skills,
            availability: 'AVAILABLE',
            yearsExperience: p.yearsExperience,
            rating: p.rating,
            reviewCount: p.reviewCount,
            completedJobs: p.completedJobs,
            verified: p.verified,
            serviceRadius: 25,
            status: 'ACTIVE',
          },
        },
      },
    });

    // Update category provider count
    await prisma.category.update({
      where: { id: categoryId },
      data: { providerCount: { increment: 1 } },
    });

    console.log(`  ✓ ${p.name} — ${p.category} ($${p.hourlyRate}/hr, ⭐ ${p.rating})`);
    created++;
  }

  console.log(`\n✅ Seed completed!`);
  console.log(`   - ${Object.keys(categories).length} categories`);
  console.log(`   - ${created} providers created, ${skipped} skipped`);
  console.log(`   - All provider passwords: Provider@123`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
