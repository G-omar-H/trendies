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

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('Cleaning existing data...');
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.customer.deleteMany({});
  
  // Create customers
  console.log('Creating customers...');
  const customerData: CustomerInput[] = [];
  
  // Add 20 sample customers
  for (let i = 1; i <= 20; i++) {
    customerData.push({
      name: `Customer ${i}`,
      email: `customer${i}@example.com`,
      phone: `+1-555-${String(i).padStart(3, '0')}-${String(i * 123).padStart(4, '0')}`,
      address: `${i * 100} Main St, City ${i}, 10${String(i).padStart(3, '0')}`,
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
  console.log('Creating products...');
  const productData: ProductInput[] = [];
  const categories = ['Watches', 'Jewelry', 'Handbags', 'Clothing', 'Accessories'];
  
  // Add 30 sample products
  for (let i = 1; i <= 30; i++) {
    const categoryIndex = i % categories.length;
    const category = categories[categoryIndex];
    
    let price = 0;
    if (category === 'Watches') {
      price = 5000 + (i * 1000);
    } else if (category === 'Jewelry') {
      price = 2000 + (i * 500);
    } else if (category === 'Handbags') {
      price = 1500 + (i * 300);
    } else {
      price = 500 + (i * 100);
    }
    
    productData.push({
      name: `Luxury ${category} Item ${i}`,
      description: `High-quality luxury ${category.toLowerCase()} item with premium materials.`,
      price,
      sku: `${category.substring(0, 3).toUpperCase()}-${String(i).padStart(5, '0')}`,
      stock: 10 + (i % 20),
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
  
  // Create 40 orders
  for (let i = 1; i <= 40; i++) {
    const customerIndex = i % customers.length;
    const customer = customers[customerIndex];
    
    const statusOptions = Object.values(OrderStatus);
    const statusIndex = i % statusOptions.length;
    const status = statusOptions[statusIndex];
    
    const date = new Date();
    date.setDate(date.getDate() - (i * 3)); // Orders spread over the last few months
    
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
    
    // Add 1-2 products to this order
    const numItems = 1 + (i % 2);
    let orderTotal = 0;
    
    for (let j = 0; j < numItems; j++) {
      const productIndex = (i + j) % products.length;
      const product = products[productIndex];
      
      const quantity = 1 + (j % 2);
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
    if (i % 10 === 0) console.log(`Created ${i} orders`);
  }
  
  console.log(`✅ Created ${orders.length} orders with items`);
  console.log('🎉 Database seeding completed successfully!');
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