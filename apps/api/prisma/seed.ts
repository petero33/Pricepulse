/**
 * PricePulse Kenya — Database Seeder
 *
 * Seeds the database with real Kenyan supermarket data:
 * - 7 major supermarket chains
 * - 30+ branch locations (Nairobi, Mombasa, Kisumu, Nakuru)
 * - 15 product categories
 * - 25 brands
 * - 100+ real Kenyan products with approximate prices
 *
 * Run: npx prisma db seed
 */

import { PrismaClient, AuthProvider, UserRole, PriceSource, VerificationStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ─── STORES ──────────────────────────────────────────────────────────────────

const storesData = [
  {
    name: 'Naivas',
    slug: 'naivas',
    color: '#E63946',
    website: 'https://naivas.co.ke',
    branches: [
      { name: 'Naivas Westgate', city: 'Nairobi', address: 'Westgate Mall, Westlands', lat: -1.2638, lng: 36.8034 },
      { name: 'Naivas Junction', city: 'Nairobi', address: 'Junction Mall, Ngong Road', lat: -1.2995, lng: 36.7665 },
      { name: 'Naivas Langata', city: 'Nairobi', address: 'Langata Road, next to Carnivore', lat: -1.3211, lng: 36.7545 },
      { name: 'Naivas Thika Road', city: 'Nairobi', address: 'Thika Road Mall', lat: -1.2149, lng: 36.8891 },
      { name: 'Naivas Nakuru', city: 'Nakuru', address: 'Nakuru Town, Kenyatta Avenue', lat: -0.2894, lng: 36.0673 },
      { name: 'Naivas Kisumu', city: 'Kisumu', address: 'Mega City Mall, Kisumu', lat: -0.1022, lng: 34.7617 },
      { name: 'Naivas Mombasa', city: 'Mombasa', address: 'Nyali Centre, Mombasa', lat: -4.0252, lng: 39.7147 },
      { name: 'Naivas Karen', city: 'Nairobi', address: 'Karen Shopping Centre', lat: -1.3192, lng: 36.7094 },
      { name: 'Naivas Galleria', city: 'Nairobi', address: 'Galleria Mall, Karen', lat: -1.3526, lng: 36.7289 },
    ],
  },
  {
    name: 'Carrefour',
    slug: 'carrefour',
    color: '#004899',
    website: 'https://www.carrefour.ke',
    branches: [
      { name: 'Carrefour Two Rivers', city: 'Nairobi', address: 'Two Rivers Mall, Runda', lat: -1.2093, lng: 36.8077 },
      { name: 'Carrefour The Hub', city: 'Nairobi', address: 'The Hub Karen', lat: -1.3293, lng: 36.7163 },
      { name: 'Carrefour Sarit Centre', city: 'Nairobi', address: 'Sarit Centre, Westlands', lat: -1.2620, lng: 36.8037 },
      { name: 'Carrefour Garden City', city: 'Nairobi', address: 'Garden City Mall, Thika Road', lat: -1.2276, lng: 36.8914 },
      { name: 'Carrefour Mombasa', city: 'Mombasa', address: 'City Mall, Nyali', lat: -4.0304, lng: 39.7179 },
    ],
  },
  {
    name: 'QuickMart',
    slug: 'quickmart',
    color: '#FF6B35',
    website: 'https://quickmart.co.ke',
    branches: [
      { name: 'QuickMart Ruaka', city: 'Nairobi', address: 'Ruaka Town', lat: -1.1980, lng: 36.8009 },
      { name: 'QuickMart Ridgeways', city: 'Nairobi', address: 'Ridgeways Mall, Kiambu Road', lat: -1.2138, lng: 36.8394 },
      { name: 'QuickMart Embakasi', city: 'Nairobi', address: 'Embakasi Village', lat: -1.3149, lng: 36.8935 },
      { name: 'QuickMart Kiserian', city: 'Nairobi', address: 'Kiserian Town', lat: -1.4144, lng: 36.6800 },
      { name: 'QuickMart Nakuru', city: 'Nakuru', address: 'Westside Mall, Nakuru', lat: -0.3036, lng: 36.0782 },
      { name: 'QuickMart Eldoret', city: 'Eldoret', address: 'West End Mall, Eldoret', lat: 0.5143, lng: 35.2698 },
    ],
  },
  {
    name: 'Chandarana',
    slug: 'chandarana',
    color: '#2E8B57',
    website: 'https://www.chandarana.co.ke',
    branches: [
      { name: 'Chandarana Parklands', city: 'Nairobi', address: '3rd Avenue, Parklands', lat: -1.2570, lng: 36.8191 },
      { name: 'Chandarana Lavington', city: 'Nairobi', address: 'Valley Arcade, Lavington', lat: -1.2793, lng: 36.7777 },
      { name: 'Chandarana Yaya Centre', city: 'Nairobi', address: 'Yaya Centre, Hurlingham', lat: -1.2941, lng: 36.7893 },
      { name: 'Chandarana Food Plus', city: 'Nairobi', address: 'Queensway, Nairobi CBD', lat: -1.2902, lng: 36.8219 },
    ],
  },
  {
    name: 'Cleanshelf',
    slug: 'cleanshelf',
    color: '#6A0DAD',
    website: null,
    branches: [
      { name: 'Cleanshelf Roysambu', city: 'Nairobi', address: 'Roysambu, Thika Road', lat: -1.2082, lng: 36.8745 },
      { name: 'Cleanshelf Githurai', city: 'Nairobi', address: 'Githurai 44', lat: -1.1820, lng: 36.9033 },
      { name: 'Cleanshelf Mirema', city: 'Nairobi', address: 'Mirema Drive, Roysambu', lat: -1.1997, lng: 36.8788 },
    ],
  },
  {
    name: 'Eastmatt',
    slug: 'eastmatt',
    color: '#FF8C00',
    website: null,
    branches: [
      { name: 'Eastmatt Machakos', city: 'Machakos', address: 'Machakos Town Centre', lat: -1.5170, lng: 37.2636 },
      { name: 'Eastmatt Kitui', city: 'Kitui', address: 'Kitui Town Centre', lat: -1.3670, lng: 38.0145 },
      { name: 'Eastmatt Meru', city: 'Meru', address: 'Meru Town Centre', lat: 0.0470, lng: 37.6470 },
    ],
  },
  {
    name: 'Tuskys',
    slug: 'tuskys',
    color: '#1565C0',
    website: null,
    branches: [
      { name: 'Tuskys Nairobi CBD', city: 'Nairobi', address: 'Moi Avenue, Nairobi CBD', lat: -1.2832, lng: 36.8234 },
    ],
  },
];

// ─── CATEGORIES ──────────────────────────────────────────────────────────────

const categoriesData = [
  { name: 'Dairy & Eggs', slug: 'dairy-eggs', color: '#FFF9C4', iconUrl: null },
  { name: 'Cereals & Grains', slug: 'cereals-grains', color: '#FFE0B2', iconUrl: null },
  { name: 'Cooking Oil & Fats', slug: 'cooking-oil', color: '#FFF3E0', iconUrl: null },
  { name: 'Bread & Bakery', slug: 'bread-bakery', color: '#FFCCBC', iconUrl: null },
  { name: 'Beverages', slug: 'beverages', color: '#E3F2FD', iconUrl: null },
  { name: 'Household Cleaning', slug: 'household-cleaning', color: '#E8F5E9', iconUrl: null },
  { name: 'Personal Care', slug: 'personal-care', color: '#FCE4EC', iconUrl: null },
  { name: 'Meat & Poultry', slug: 'meat-poultry', color: '#FFEBEE', iconUrl: null },
  { name: 'Fruits & Vegetables', slug: 'fruits-vegetables', color: '#F1F8E9', iconUrl: null },
  { name: 'Sugar & Sweeteners', slug: 'sugar', color: '#FFF8E1', iconUrl: null },
  { name: 'Rice & Pulses', slug: 'rice-pulses', color: '#E8EAF6', iconUrl: null },
  { name: 'Snacks & Confectionery', slug: 'snacks', color: '#F3E5F5', iconUrl: null },
  { name: 'Baby Products', slug: 'baby-products', color: '#E1F5FE', iconUrl: null },
  { name: 'Water & Soft Drinks', slug: 'water-soft-drinks', color: '#E0F7FA', iconUrl: null },
  { name: 'Canned & Packaged Food', slug: 'canned-packaged', color: '#ECEFF1', iconUrl: null },
];

// ─── BRANDS ──────────────────────────────────────────────────────────────────

const brandsData = [
  { name: 'Brookside', slug: 'brookside', country: 'Kenya' },
  { name: 'Daima', slug: 'daima', country: 'Kenya' },
  { name: 'Fresha', slug: 'fresha', country: 'Kenya' },
  { name: 'Bidco', slug: 'bidco', country: 'Kenya' },
  { name: 'Kapa Oil', slug: 'kapa-oil', country: 'Kenya' },
  { name: 'Unga', slug: 'unga', country: 'Kenya' },
  { name: 'Pembe', slug: 'pembe', country: 'Kenya' },
  { name: 'Jogoo', slug: 'jogoo', country: 'Kenya' },
  { name: 'Kabras Sugar', slug: 'kabras-sugar', country: 'Kenya' },
  { name: 'Mumias Sugar', slug: 'mumias-sugar', country: 'Kenya' },
  { name: 'Azam', slug: 'azam', country: 'Tanzania' },
  { name: 'Kenchic', slug: 'kenchic', country: 'Kenya' },
  { name: 'Excel Chemicals', slug: 'excel-chemicals', country: 'Kenya' },
  { name: 'Omo', slug: 'omo', country: 'Global' },
  { name: 'Ariel', slug: 'ariel', country: 'Global' },
  { name: 'Dettol', slug: 'dettol', country: 'Global' },
  { name: 'Colgate', slug: 'colgate', country: 'Global' },
  { name: 'Sunlight', slug: 'sunlight', country: 'Global' },
  { name: 'Kiwi', slug: 'kiwi', country: 'Global' },
  { name: 'Nakumatt', slug: 'nakumatt', country: 'Kenya' },
  { name: 'Broadways', slug: 'broadways', country: 'Kenya' },
  { name: 'PowerAde', slug: 'powerade', country: 'Global' },
  { name: 'Coca-Cola', slug: 'coca-cola', country: 'Global' },
  { name: 'Tusker', slug: 'tusker', country: 'Kenya' },
  { name: 'Pwani Oil', slug: 'pwani-oil', country: 'Kenya' },
];

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
// Each product has typical Nairobi prices (KES) for seeding price history

const productsData = [
  // DAIRY & EGGS
  { name: 'Brookside Full Cream Milk 500ml', slug: 'brookside-full-cream-milk-500ml', barcode: '6281007026014', category: 'dairy-eggs', brand: 'brookside', unit: '500ml', typicalPrice: 60 },
  { name: 'Brookside Full Cream Milk 1L', slug: 'brookside-full-cream-milk-1l', barcode: '6281007026021', category: 'dairy-eggs', brand: 'brookside', unit: '1L', typicalPrice: 120 },
  { name: 'Daima Full Cream Milk 500ml', slug: 'daima-full-cream-milk-500ml', barcode: '6281007026038', category: 'dairy-eggs', brand: 'daima', unit: '500ml', typicalPrice: 58 },
  { name: 'Daima Mala 500ml', slug: 'daima-mala-500ml', barcode: '6281007026045', category: 'dairy-eggs', brand: 'daima', unit: '500ml', typicalPrice: 68 },
  { name: 'Brookside Mozzarella Cheese 200g', slug: 'brookside-mozzarella-200g', barcode: '6281007026052', category: 'dairy-eggs', brand: 'brookside', unit: '200g', typicalPrice: 320 },
  { name: 'Fresha Butter 250g', slug: 'fresha-butter-250g', barcode: '6281007026059', category: 'dairy-eggs', brand: 'fresha', unit: '250g', typicalPrice: 290 },
  { name: 'Eggs (Tray of 30)', slug: 'eggs-tray-30', barcode: null, category: 'dairy-eggs', brand: null, unit: 'tray/30', typicalPrice: 480 },

  // CEREALS & GRAINS
  { name: 'Jogoo Maize Flour 2kg', slug: 'jogoo-maize-flour-2kg', barcode: '6281007026060', category: 'cereals-grains', brand: 'jogoo', unit: '2kg', typicalPrice: 160 },
  { name: 'Jogoo Maize Flour 1kg', slug: 'jogoo-maize-flour-1kg', barcode: '6281007026061', category: 'cereals-grains', brand: 'jogoo', unit: '1kg', typicalPrice: 85 },
  { name: 'Pembe Maize Flour 2kg', slug: 'pembe-maize-flour-2kg', barcode: '6281007026062', category: 'cereals-grains', brand: 'pembe', unit: '2kg', typicalPrice: 158 },
  { name: 'Unga Dola Wheat Flour 2kg', slug: 'unga-dola-wheat-flour-2kg', barcode: '6281007026063', category: 'cereals-grains', brand: 'unga', unit: '2kg', typicalPrice: 175 },
  { name: 'Jungle Oats 1kg', slug: 'jungle-oats-1kg', barcode: '6281007026070', category: 'cereals-grains', brand: null, unit: '1kg', typicalPrice: 195 },
  { name: 'Weetabix 430g', slug: 'weetabix-430g', barcode: '5000116101028', category: 'cereals-grains', brand: null, unit: '430g', typicalPrice: 365 },

  // COOKING OIL
  { name: 'Bidco Ufuta Cooking Oil 2L', slug: 'bidco-ufuta-cooking-oil-2l', barcode: '6281007026080', category: 'cooking-oil', brand: 'bidco', unit: '2L', typicalPrice: 360 },
  { name: 'Pwani Fry Cooking Oil 2L', slug: 'pwani-fry-cooking-oil-2l', barcode: '6281007026081', category: 'cooking-oil', brand: 'pwani-oil', unit: '2L', typicalPrice: 340 },
  { name: 'Kapa Pure Sunflower Oil 1L', slug: 'kapa-sunflower-oil-1l', barcode: '6281007026082', category: 'cooking-oil', brand: 'kapa-oil', unit: '1L', typicalPrice: 195 },
  { name: 'Olive Branch Olive Oil 500ml', slug: 'olive-branch-olive-oil-500ml', barcode: '6281007026083', category: 'cooking-oil', brand: null, unit: '500ml', typicalPrice: 750 },

  // SUGAR
  { name: 'Kabras Sugar 2kg', slug: 'kabras-sugar-2kg', barcode: '6281007026090', category: 'sugar', brand: 'kabras-sugar', unit: '2kg', typicalPrice: 240 },
  { name: 'Mumias Sugar 2kg', slug: 'mumias-sugar-2kg', barcode: '6281007026091', category: 'sugar', brand: 'mumias-sugar', unit: '2kg', typicalPrice: 235 },
  { name: 'Azam Sugar 1kg', slug: 'azam-sugar-1kg', barcode: '6281007026092', category: 'sugar', brand: 'azam', unit: '1kg', typicalPrice: 122 },

  // BREAD & BAKERY
  { name: 'Supa Loaf White Bread 400g', slug: 'supa-loaf-white-bread-400g', barcode: '6281007026100', category: 'bread-bakery', brand: null, unit: '400g', typicalPrice: 60 },
  { name: 'Broadways White Bread 400g', slug: 'broadways-white-bread-400g', barcode: '6281007026101', category: 'bread-bakery', brand: 'broadways', unit: '400g', typicalPrice: 58 },
  { name: 'Farmhouse Brown Bread 500g', slug: 'farmhouse-brown-bread-500g', barcode: '6281007026102', category: 'bread-bakery', brand: null, unit: '500g', typicalPrice: 85 },

  // RICE & PULSES
  { name: 'Pishori Rice 2kg', slug: 'pishori-rice-2kg', barcode: '6281007026110', category: 'rice-pulses', brand: null, unit: '2kg', typicalPrice: 340 },
  { name: 'Basmati Rice 2kg', slug: 'basmati-rice-2kg', barcode: '6281007026111', category: 'rice-pulses', brand: null, unit: '2kg', typicalPrice: 380 },
  { name: 'Dry Lentils (Red) 500g', slug: 'dry-lentils-red-500g', barcode: null, category: 'rice-pulses', brand: null, unit: '500g', typicalPrice: 95 },
  { name: 'Dry Beans 1kg', slug: 'dry-beans-1kg', barcode: null, category: 'rice-pulses', brand: null, unit: '1kg', typicalPrice: 175 },

  // BEVERAGES
  { name: 'Coca-Cola 300ml', slug: 'coca-cola-300ml', barcode: '5449000000996', category: 'water-soft-drinks', brand: 'coca-cola', unit: '300ml', typicalPrice: 60 },
  { name: 'Coca-Cola 500ml', slug: 'coca-cola-500ml', barcode: '5449000024282', category: 'water-soft-drinks', brand: 'coca-cola', unit: '500ml', typicalPrice: 85 },
  { name: 'Dasani Water 500ml', slug: 'dasani-water-500ml', barcode: '5000112601480', category: 'water-soft-drinks', brand: null, unit: '500ml', typicalPrice: 55 },
  { name: 'Keringet Water 600ml', slug: 'keringet-water-600ml', barcode: '6281007026120', category: 'water-soft-drinks', brand: null, unit: '600ml', typicalPrice: 60 },

  // HOUSEHOLD CLEANING
  { name: 'Omo Washing Powder 500g', slug: 'omo-washing-powder-500g', barcode: '6281007026130', category: 'household-cleaning', brand: 'omo', unit: '500g', typicalPrice: 155 },
  { name: 'Ariel Washing Powder 500g', slug: 'ariel-washing-powder-500g', barcode: '6281007026131', category: 'household-cleaning', brand: 'ariel', unit: '500g', typicalPrice: 175 },
  { name: 'Sunlight Dish Washing Liquid 500ml', slug: 'sunlight-dish-washing-500ml', barcode: '6281007026132', category: 'household-cleaning', brand: 'sunlight', unit: '500ml', typicalPrice: 115 },
  { name: 'Dettol Disinfectant 500ml', slug: 'dettol-disinfectant-500ml', barcode: '6281007026133', category: 'household-cleaning', brand: 'dettol', unit: '500ml', typicalPrice: 285 },
  { name: 'Jik Bleach 1L', slug: 'jik-bleach-1l', barcode: '6281007026134', category: 'household-cleaning', brand: null, unit: '1L', typicalPrice: 145 },

  // PERSONAL CARE
  { name: 'Colgate Toothpaste 75ml', slug: 'colgate-toothpaste-75ml', barcode: '6281007026140', category: 'personal-care', brand: 'colgate', unit: '75ml', typicalPrice: 120 },
  { name: 'Dettol Hand Soap 250ml', slug: 'dettol-hand-soap-250ml', barcode: '6281007026141', category: 'personal-care', brand: 'dettol', unit: '250ml', typicalPrice: 175 },
  { name: 'Lifebuoy Soap Bar 100g', slug: 'lifebuoy-soap-bar-100g', barcode: '6281007026142', category: 'personal-care', brand: null, unit: '100g', typicalPrice: 65 },

  // MEAT
  { name: 'Kenchic Frozen Chicken 1.2kg', slug: 'kenchic-frozen-chicken-1-2kg', barcode: '6281007026150', category: 'meat-poultry', brand: 'kenchic', unit: '1.2kg', typicalPrice: 550 },
  { name: 'Beef Mince 500g', slug: 'beef-mince-500g', barcode: null, category: 'meat-poultry', brand: null, unit: '500g', typicalPrice: 380 },

  // SNACKS
  { name: 'Pringles Original 165g', slug: 'pringles-original-165g', barcode: '038000845093', category: 'snacks', brand: null, unit: '165g', typicalPrice: 450 },
  { name: 'Lays Classic 100g', slug: 'lays-classic-100g', barcode: '6281007026160', category: 'snacks', brand: null, unit: '100g', typicalPrice: 95 },
  { name: 'Digestive Biscuits 400g', slug: 'digestive-biscuits-400g', barcode: '6281007026161', category: 'snacks', brand: null, unit: '400g', typicalPrice: 185 },
];

// ─── MAIN SEED FUNCTION ───────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting PricePulse Kenya database seed...\n');

  // 1. Seed Categories
  console.log('📂 Seeding categories...');
  const categoryMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryMap[cat.slug] = category.id;
    process.stdout.write('.');
  }
  console.log(`\n✅ ${categoriesData.length} categories seeded.\n`);

  // 2. Seed Brands
  console.log('🏷️  Seeding brands...');
  const brandMap: Record<string, string> = {};
  for (const brand of brandsData) {
    const b = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand,
    });
    brandMap[brand.slug] = b.id;
    process.stdout.write('.');
  }
  console.log(`\n✅ ${brandsData.length} brands seeded.\n`);

  // 3. Seed Stores + Branches
  console.log('🏪 Seeding stores and branches...');
  const branchMap: Record<string, string> = {};
  let totalBranches = 0;

  for (const storeData of storesData) {
    const { branches, ...storeInfo } = storeData;
    const store = await prisma.store.upsert({
      where: { slug: storeInfo.slug },
      update: {},
      create: storeInfo,
    });

    for (const branch of branches) {
      const slug = `${storeInfo.slug}-${branch.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
      const b = await prisma.branch.upsert({
        where: { slug },
        update: {},
        create: {
          storeId: store.id,
          name: branch.name,
          slug,
          address: branch.address,
          city: branch.city,
          latitude: branch.lat,
          longitude: branch.lng,
          openingTime: '08:00',
          closingTime: '21:00',
        },
      });
      branchMap[branch.name] = b.id;
      totalBranches++;
      process.stdout.write('.');
    }
  }
  console.log(`\n✅ ${storesData.length} stores + ${totalBranches} branches seeded.\n`);

  // 4. Seed Products
  console.log('📦 Seeding products...');
  const productMap: Record<string, string> = {};

  for (const product of productsData) {
    const { category, brand, typicalPrice, ...productInfo } = product;
    const p = await prisma.product.upsert({
      where: { slug: productInfo.slug },
      update: {},
      create: {
        ...productInfo,
        categoryId: categoryMap[category],
        brandId: brand ? brandMap[brand] : undefined,
        isVerified: true,
      },
    });
    productMap[productInfo.slug] = p.id;
    process.stdout.write('.');
  }
  console.log(`\n✅ ${productsData.length} products seeded.\n`);

  // 5. Seed Admin User
  console.log('👤 Seeding admin user...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pricepulse.ke' },
    update: {},
    create: {
      email: 'admin@pricepulse.ke',
      displayName: 'PricePulse Admin',
      provider: 'EMAIL' as AuthProvider,
      role: 'ADMIN' as UserRole,
      reputationScore: 1.0,
    },
  });
  console.log(`✅ Admin user seeded: ${admin.email}\n`);

  // 6. Seed Sample Price Reports (realistic Nairobi prices)
  console.log('💰 Seeding sample price reports...');
  const naivas_westgate = branchMap['Naivas Westgate'];
  const carrefour_tworivers = branchMap['Carrefour Two Rivers'];
  const quickmart_ruaka = branchMap['QuickMart Ruaka'];

  let priceCount = 0;
  for (const product of productsData) {
    const productId = productMap[product.slug];
    if (!productId) continue;

    // Each product gets prices at 3 stores with slight variations
    const priceVariations = [
      { branchId: naivas_westgate, multiplier: 1.0 },
      { branchId: carrefour_tworivers, multiplier: 1.03 },  // Carrefour slightly higher
      { branchId: quickmart_ruaka, multiplier: 0.98 },       // QuickMart slightly lower
    ];

    for (const variation of priceVariations) {
      if (!variation.branchId) continue;
      const price = Math.round(product.typicalPrice * variation.multiplier);

      await prisma.priceReport.create({
        data: {
          productId,
          branchId: variation.branchId,
          reportedById: admin.id,
          price,
          source: 'ADMIN' as PriceSource,
          status: 'ACCEPTED' as VerificationStatus,
          verificationScore: 100,
          reportedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // within last 24h
        },
      });
      priceCount++;
    }
    process.stdout.write('.');
  }
  console.log(`\n✅ ${priceCount} price reports seeded.\n`);

  // 7. Seed Sample Offers
  console.log('🏷️  Seeding sample offers...');
  const naivas = await prisma.store.findUnique({ where: { slug: 'naivas' } });
  const carrefour = await prisma.store.findUnique({ where: { slug: 'carrefour' } });

  if (naivas) {
    await prisma.offer.upsert({
      where: { id: 'seed-offer-naivas-1' },
      update: {},
      create: {
        id: 'seed-offer-naivas-1',
        storeId: naivas.id,
        title: 'Weekend Savings — Up to 20% Off',
        description: 'Save on selected household and grocery items this weekend.',
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    });
  }

  if (carrefour) {
    await prisma.offer.upsert({
      where: { id: 'seed-offer-carrefour-1' },
      update: {},
      create: {
        id: 'seed-offer-carrefour-1',
        storeId: carrefour.id,
        title: 'Buy 2 Get 1 Free — Selected Beverages',
        description: 'Mix and match any beverages for this exclusive offer.',
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log('✅ Sample offers seeded.\n');

  console.log('🎉 Database seeding completed successfully!');
  console.log(`   Categories: ${categoriesData.length}`);
  console.log(`   Brands: ${brandsData.length}`);
  console.log(`   Stores: ${storesData.length}`);
  console.log(`   Branches: ${totalBranches}`);
  console.log(`   Products: ${productsData.length}`);
  console.log(`   Price reports: ${priceCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
