import { PrismaClient, OrderStatus, Customer, Product, Order } from '@prisma/client';

const prisma = new PrismaClient();

// Define explicit types for our arrays
type CustomerInput = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

type ProductInput = {
  name: string;
  description: string;
  price: number;
  sku: string;
  stock: number;
};

// Luxury brand names by category
const BRANDS = {
  Watches: ['Rolex', 'Patek Philippe', 'Audemars Piguet', 'Omega', 'Cartier', 'Jaeger-LeCoultre', 'IWC', 'Hublot', 'Breitling', 'TAG Heuer'],
  Jewelry: ['Tiffany & Co.', 'Cartier', 'Bulgari', 'Van Cleef & Arpels', 'Harry Winston', 'Chopard', 'Graff', 'Mikimoto', 'Piaget', 'Bvlgari'],
  Handbags: ['Louis Vuitton', 'Hermès', 'Chanel', 'Gucci', 'Prada', 'Fendi', 'Dior', 'Bottega Veneta', 'Saint Laurent', 'Celine'],
  Clothing: ['Gucci', 'Prada', 'Dior', 'Chanel', 'Louis Vuitton', 'Versace', 'Armani', 'Burberry', 'Valentino', 'Tom Ford'],
  Accessories: ['Hermès', 'Gucci', 'Louis Vuitton', 'Montblanc', 'Tiffany & Co.', 'Cartier', 'Prada', 'Chanel', 'Dior', 'Versace']
};

// Product types by category
const PRODUCT_TYPES = {
  Watches: ['Chronograph', 'Dive Watch', 'Dress Watch', 'GMT', 'Perpetual Calendar', 'Tourbillon', 'Skeleton', 'Diamond Set', 'Sport', 'Limited Edition'],
  Jewelry: ['Diamond Necklace', 'Emerald Ring', 'Sapphire Earrings', 'Ruby Bracelet', 'Pearl Pendant', 'Gold Choker', 'Tennis Bracelet', 'Statement Ring', 'Stud Earrings', 'Cuff Bracelet'],
  Handbags: ['Tote', 'Clutch', 'Shoulder Bag', 'Crossbody', 'Hobo', 'Satchel', 'Bucket Bag', 'Evening Bag', 'Backpack', 'Mini Bag'],
  Clothing: ['Cashmere Coat', 'Silk Dress', 'Wool Suit', 'Leather Jacket', 'Evening Gown', 'Tailored Blazer', 'Designer Jeans', 'Embroidered Blouse', 'Sequin Skirt', 'Linen Shirt'],
  Accessories: ['Silk Scarf', 'Leather Belt', 'Designer Sunglasses', 'Calfskin Wallet', 'Cashmere Gloves', 'Statement Tie', 'Luxury Watch Winder', 'Exotic Leather Keychain', 'Designer Hat', 'Premium Cufflinks']
};

// Materials by category
const MATERIALS = {
  Watches: ['Stainless Steel', '18K Gold', 'Rose Gold', 'Platinum', 'Titanium', 'Ceramic', 'Carbon Fiber', 'Diamond-Set', 'Leather Strap', 'Rubber'],
  Jewelry: ['18K Gold', 'Platinum', 'White Gold', 'Rose Gold', 'Sterling Silver', 'Diamonds', 'Sapphires', 'Emeralds', 'Rubies', 'Pearls'],
  Handbags: ['Full-Grain Leather', 'Calfskin', 'Crocodile', 'Python', 'Ostrich', 'Canvas', 'Lambskin', 'Suede', 'Satin', 'Tweed'],
  Clothing: ['Cashmere', 'Silk', 'Virgin Wool', 'Leather', 'Egyptian Cotton', 'Vicuna', 'Merino', 'Linen', 'Mohair', 'Alpaca'],
  Accessories: ['Italian Leather', 'Silk', 'Cashmere', '18K Gold Hardware', 'Sterling Silver', 'Carbon Fiber', 'Horn', 'Mother of Pearl', 'Palladium', 'Saffiano Leather']
};

// Luxury colors
const COLORS = [
  'Black', 'Midnight Blue', 'Burgundy', 'Champagne', 'Rose Gold', 'Platinum Gray', 'Ivory', 'Emerald Green',
  'Sapphire Blue', 'Ruby Red', 'Navy', 'Chocolate Brown', 'Classic Beige', 'Charcoal', 'Forest Green',
  'Aubergine', 'Cognac', 'Caramel', 'Pearl White', 'Slate Gray', 'Teal', 'Oxblood', 'Taupe', 'Sand'
];

// Collection names
const COLLECTIONS = [
  'Heritage', 'Prestige', 'Sovereign', 'Imperial', 'Elite', 'Celestial', 'Legacy', 'Opulent', 
  'Lumière', 'Timeless', 'Regal', 'Eclipse', 'Zenith', 'Pinnacle', 'Ethereal', 'Infinity',
  'Majestic', 'Sublime', 'Royal', 'Grandeur', 'Virtuoso', 'Executive', 'Ambassador', 'Platinum'
];

// Real-sounding customer first/last names
const FIRST_NAMES = [
  'Emma', 'James', 'Sophia', 'William', 'Olivia', 'Benjamin', 'Charlotte', 'Michael', 'Amelia', 'Alexander', 
  'Isabella', 'Ethan', 'Ava', 'Daniel', 'Mia', 'Matthew', 'Harper', 'Jackson', 'Evelyn', 'David',
  'Elizabeth', 'Joseph', 'Sofia', 'Samuel', 'Camila', 'Sebastian', 'Victoria', 'Henry', 'Aria', 'Christopher',
  'Lillian', 'Andrew', 'Zoe', 'Jonathan', 'Audrey', 'Thomas', 'Scarlett', 'Owen', 'Grace', 'Charles'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson',
  'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White',
  'Lopez', 'Lee', 'Gonzalez', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Perez', 'Hall',
  'Young', 'Allen', 'Sanchez', 'Wright', 'King', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson',
  'Chen', 'Nguyen', 'Parker', 'Wright', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Morris', 'Murphy'
];

// Luxury addresses and districts
const LUXURY_DISTRICTS = [
  { city: 'New York', districts: ['Upper East Side', 'Tribeca', 'SoHo', 'Greenwich Village', 'West Village'] },
  { city: 'Los Angeles', districts: ['Beverly Hills', 'Bel Air', 'Malibu', 'Hollywood Hills', 'Pacific Palisades'] },
  { city: 'Chicago', districts: ['Gold Coast', 'Lincoln Park', 'Streeterville', 'Lakeview', 'Wicker Park'] },
  { city: 'Miami', districts: ['South Beach', 'Bal Harbour', 'Coconut Grove', 'Brickell', 'Coral Gables'] },
  { city: 'San Francisco', districts: ['Pacific Heights', 'Nob Hill', 'Marina District', 'Russian Hill', 'Presidio Heights'] },
  { city: 'Boston', districts: ['Beacon Hill', 'Back Bay', 'Seaport District', 'South End', 'Brookline'] },
  { city: 'Seattle', districts: ['Madison Park', 'Queen Anne', 'Capitol Hill', 'Bellevue', 'Medina'] },
  { city: 'Austin', districts: ['Westlake', 'Tarrytown', 'Pemberton Heights', 'Rollingwood', 'West Lake Hills'] },
  { city: 'Dallas', districts: ['Highland Park', 'University Park', 'Preston Hollow', 'Turtle Creek', 'Bluffview'] },
  { city: 'Denver', districts: ['Cherry Creek', 'Hilltop', 'Country Club', 'Belcaro', 'Bonnie Brae'] }
];

// Generate a random number within a range
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Pick a random element from an array
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate a random luxury product name
function generateProductName(category: string): string {
  const brand = getRandomElement(BRANDS[category as keyof typeof BRANDS] || ['Luxury Brand']);
  const type = getRandomElement(PRODUCT_TYPES[category as keyof typeof PRODUCT_TYPES] || ['Luxury Item']);
  const material = getRandomElement(MATERIALS[category as keyof typeof MATERIALS] || ['Premium Material']);
  const color = getRandomElement(COLORS);
  const collection = getRandomElement(COLLECTIONS);
  
  return `${brand} ${collection} ${type} in ${color} ${material}`;
}

// Generate a realistic product description
function generateProductDescription(category: string, name: string): string {
  const luxuryAdj1 = getRandomElement([
    'exquisite', 'handcrafted', 'meticulously designed', 'artisanal', 'exclusive', 
    'premium', 'timeless', 'iconic', 'sophisticated', 'refined'
  ]);
  
  const luxuryAdj2 = getRandomElement([
    'elegant', 'sumptuous', 'opulent', 'lavish', 'luxurious',
    'distinguished', 'prestigious', 'exceptional', 'masterful', 'magnificent'
  ]);
  
  const feature1 = getRandomElement([
    'handmade in Italy', 'handmade in France', 'crafted by master artisans',
    'created with traditional techniques', 'made with ethically sourced materials',
    'featuring signature house details', 'with numbered production', 'from the acclaimed collection'
  ]);
  
  const feature2 = getRandomElement([
    'packaged in a signature gift box', 'accompanied by an authenticity certificate',
    'with complimentary adjustments available', 'with a limited lifetime warranty',
    'includes dust bag and documentation', 'presented in premium packaging'
  ]);
  
  return `This ${luxuryAdj1} piece from our ${name} is ${luxuryAdj2} and ${feature1}. ${feature2}. The perfect addition to any sophisticated collection.`;
}

// Generate a realistic SKU
function generateSKU(category: string, index: number): string {
  const categoryCode = category.substring(0, 3).toUpperCase();
  const uniqueId = String(index).padStart(5, '0');
  const randomLetters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
                        String.fromCharCode(65 + Math.floor(Math.random() * 26));
  
  return `${categoryCode}-${randomLetters}${uniqueId}`;
}

// Generate a realistic customer name
function generateCustomerName(): string {
  return `${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`;
}

// Generate a realistic email from a name
function generateEmail(name: string): string {
  const domains = ['gmail.com', 'icloud.com', 'outlook.com', 'yahoo.com', 'me.com', 'protonmail.com'];
  const nameParts = name.toLowerCase().split(' ');
  const formats = [
    `${nameParts[0]}.${nameParts[1]}`,
    `${nameParts[0]}${nameParts[1]}`,
    `${nameParts[0]}.${nameParts[1]}${getRandomInt(1, 99)}`,
    `${nameParts[0][0]}${nameParts[1]}`,
    `${nameParts[0]}${nameParts[1][0]}`
  ];
  
  return `${getRandomElement(formats)}@${getRandomElement(domains)}`;
}

// Generate a realistic phone number
function generatePhone(): string {
  const formats = [
    `+1 (${getRandomInt(201, 989)}) ${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`,
    `+1 ${getRandomInt(201, 989)}-${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`,
    `+1 (${getRandomInt(201, 989)})${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`
  ];
  
  return getRandomElement(formats);
}

// Generate a realistic luxury address
function generateAddress(): string {
  const location = getRandomElement(LUXURY_DISTRICTS);
  const district = getRandomElement(location.districts);
  
  const houseNumber = getRandomInt(1, 999);
  const streetTypes = ['Ave', 'St', 'Blvd', 'Dr', 'Lane', 'Place', 'Road', 'Way', 'Court', 'Terrace'];
  const streetNames = [
    'Maple', 'Oak', 'Cedar', 'Pine', 'Elm', 'Park', 'Lake', 'River', 'Ocean', 'Mountain',
    'Highland', 'Sunset', 'Willow', 'Meadow', 'Forest', 'Spring', 'Summer', 'Autumn', 'Winter', 'Harbor',
    'Vista', 'Ridge', 'Valley', 'Creek', 'Brook', 'Hill', 'Crest', 'Summit', 'Garden', 'Orchard'
  ];
  
  const streetName = getRandomElement(streetNames);
  const streetType = getRandomElement(streetTypes);
  const zipCode = `${getRandomInt(10000, 99999)}`;
  
  // Sometimes add an apartment/unit
  const hasApt = Math.random() > 0.6;
  const aptPart = hasApt ? `, Apt ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${getRandomInt(1, 999)}` : '';
  
  return `${houseNumber} ${streetName} ${streetType}${aptPart}, ${district}, ${location.city}, ${zipCode}`;
}

async function main() {
  console.log('🌱 Starting enhanced luxury database seeding...');

  // Clear existing data
  console.log('Cleaning existing data...');
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.customer.deleteMany({});
  
  // Create customers
  console.log('Creating customers...');
  const customerData: CustomerInput[] = [];
  
  // Add 50 realistic customers
  for (let i = 1; i <= 50; i++) {
    const name = generateCustomerName();
    customerData.push({
      name,
      email: generateEmail(name),
      phone: generatePhone(),
      address: generateAddress(),
    });
  }
  
  // Insert customers
  console.log('Inserting customers...');
  const customers: Customer[] = [];
  
  for (const data of customerData) {
    const customer = await prisma.customer.create({ data });
    customers.push(customer);
  }
  console.log(`✅ Created ${customers.length} customers`);

  // Create products
  console.log('Creating luxury products...');
  const productData: ProductInput[] = [];
  const categories = Object.keys(BRANDS);
  
  // Add 100 luxury products
  for (let i = 1; i <= 100; i++) {
    const categoryIndex = i % categories.length;
    const category = categories[categoryIndex];
    
    // Price varies by category
    let price = 0;
    switch (category) {
      case 'Watches':
        price = getRandomInt(2000, 50000);
        break;
      case 'Jewelry':
        price = getRandomInt(1000, 30000);
        break;
      case 'Handbags':
        price = getRandomInt(1500, 20000);
        break;
      case 'Clothing':
        price = getRandomInt(500, 10000);
        break;
      case 'Accessories':
        price = getRandomInt(200, 5000);
        break;
      default:
        price = getRandomInt(500, 5000);
    }
    
    // Round price to look more realistic (often ends in 00, 50, 95, or 99)
    const priceEndings = [0, 0, 0, 50, 95, 99];
    const roundedPrice = Math.floor(price / 100) * 100 + getRandomElement(priceEndings);
    
    const name = generateProductName(category);
    
    productData.push({
      name,
      description: generateProductDescription(category, name),
      price: roundedPrice,
      sku: generateSKU(category, i),
      stock: getRandomInt(1, 50),
    });
  }
  
  // Insert products
  console.log('Inserting products...');
  const products: Product[] = [];
  
  for (const data of productData) {
    const product = await prisma.product.create({ data });
    products.push(product);
  }
  console.log(`✅ Created ${products.length} products`);

  // Create orders
  console.log('Creating orders...');
  const orders: Order[] = [];
  
  // Create 150 orders with realistic patterns
  for (let i = 1; i <= 150; i++) {
    // Customers with higher indices (newer customers) place fewer orders
    const customerIndex = Math.min(
      Math.floor(Math.pow(Math.random(), 1.5) * customers.length),
      customers.length - 1
    );
    const customer = customers[customerIndex];
    
    // Determine order date (more recent orders are more frequent)
    const daysAgo = Math.floor(Math.pow(Math.random(), 2) * 180); // Last 6 months, weighted toward recent
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    // Order status depends on age
    let status: OrderStatus;
    if (daysAgo < 2) {
      status = OrderStatus.PENDING;
    } else if (daysAgo < 5) {
      status = OrderStatus.PROCESSING;
    } else if (daysAgo < 10) {
      status = Math.random() > 0.3 ? OrderStatus.SHIPPED : OrderStatus.PROCESSING;
    } else if (daysAgo < 20) {
      status = Math.random() > 0.8 ? OrderStatus.SHIPPED : OrderStatus.DELIVERED;
    } else {
      status = Math.random() > 0.1 ? OrderStatus.DELIVERED : OrderStatus.CANCELLED;
    }
    
    // Create order first
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        status,
        total: 0, // Will update after adding items
        createdAt: date,
        updatedAt: date,
      },
    });
    
    // Determine number of items (usually 1-2 for luxury items, rarely more)
    const numItemsWeights = [
      { value: 1, weight: 60 }, // 60% chance of 1 item
      { value: 2, weight: 30 }, // 30% chance of 2 items
      { value: 3, weight: 8 },  // 8% chance of 3 items
      { value: 4, weight: 2 }   // 2% chance of 4 items
    ];
    
    // Select number of items using weighted probability
    let numItems = 1;
    const randomValue = Math.random() * 100;
    let cumulativeWeight = 0;
    
    for (const option of numItemsWeights) {
      cumulativeWeight += option.weight;
      if (randomValue <= cumulativeWeight) {
        numItems = option.value;
        break;
      }
    }
    
    // Track products already in this order to avoid duplicates
    const orderProductIds = new Set<number>();
    let orderTotal = 0;
    
    // Add items to order
    for (let j = 0; j < numItems; j++) {
      // Product selection has some bias toward similar categories
      let productIndex: number;
      
      do {
        if (j === 0 || Math.random() > 0.7) {
          // Random product
          productIndex = Math.floor(Math.random() * products.length);
        } else {
          // Try to select a product from a similar category
          const lastCategoryIndex = products[Array.from(orderProductIds)[orderProductIds.size - 1]].name.indexOf(' ');
          const lastCategory = products[Array.from(orderProductIds)[orderProductIds.size - 1]].name.substring(0, lastCategoryIndex);
          
          // Find products from same brand/category
          const similarProducts = products.filter(p => p.name.startsWith(lastCategory));
          
          if (similarProducts.length > 0) {
            const randomSimilar = getRandomInt(0, similarProducts.length - 1);
            productIndex = products.findIndex(p => p.id === similarProducts[randomSimilar].id);
          } else {
            productIndex = Math.floor(Math.random() * products.length);
          }
        }
      } while (orderProductIds.has(productIndex));
      
      // Add product to tracking set
      orderProductIds.add(productIndex);
      
      const product = products[productIndex];
      
      // Luxury items usually bought in quantity of 1
      const quantity = Math.random() > 0.9 ? 2 : 1;
      const itemTotal = product.price * quantity;
      orderTotal += itemTotal;
      
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity,
          price: product.price,
        },
      });
      
      // Update product stock
      await prisma.product.update({
        where: { id: product.id },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      });
    }
    
    // Update order total
    await prisma.order.update({
      where: { id: order.id },
      data: { total: orderTotal },
    });
    
    orders.push(order);
    if (i % 15 === 0) console.log(`Created ${i} orders`);
  }
  
  console.log(`✅ Created ${orders.length} orders with items`);
  console.log('🎉 Enhanced luxury database seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });