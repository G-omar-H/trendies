import { PrismaClient, OrderStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

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
  const customerData = [];
  for (let i = 0; i < 50; i++) {
    customerData.push({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress() + ', ' + faker.location.city() + ', ' + faker.location.zipCode(),
    });
  }
  
  console.log('Inserting customers...');
  const customers = [];
  for (const data of customerData) {
    const customer = await prisma.customer.create({ data });
    customers.push(customer);
  }
  console.log(`✅ Created ${customers.length} customers`);

  // Create products
  console.log('Creating products...');
  const productData = [];
  const categories = ['Watches', 'Jewelry', 'Handbags', 'Clothing', 'Accessories'];
  
  for (let i = 0; i < 100; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const name = `Luxury ${category} Item ${i+1}`;
    
    // Price varies by category
    let price;
    if (category === 'Watches') {
      price = Math.floor(Math.random() * 30000) + 1000;
    } else if (category === 'Jewelry') {
      price = Math.floor(Math.random() * 20000) + 500;
    } else if (category === 'Handbags') {
      price = Math.floor(Math.random() * 10000) + 500;
    } else {
      price = Math.floor(Math.random() * 3000) + 100;
    }
    
    productData.push({
      name,
      description: `High-quality luxury ${category.toLowerCase()} item with premium materials.`,
      price,
      sku: `${category.substring(0, 3).toUpperCase()}-${String(i+1).padStart(5, '0')}`,
      stock: Math.floor(Math.random() * 50) + 5,
    });
  }
  
  console.log('Inserting products...');
  const products = [];
  for (const data of productData) {
    const product = await prisma.product.create({ data });
    products.push(product);
  }
  console.log(`✅ Created ${products.length} products`);

  // Create orders
  console.log('Creating orders...');
  const orders = [];
  
  for (let i = 0; i < 150; i++) {
    const customerIndex = Math.floor(Math.random() * customers.length);
    const customer = customers[customerIndex];
    
    const statusOptions = Object.values(OrderStatus);
    const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 200));
    
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
    
    // Now add 1-3 products to this order
    const numItems = Math.floor(Math.random() * 3) + 1;
    let orderTotal = 0;
    
    for (let j = 0; j < numItems; j++) {
      const productIndex = Math.floor(Math.random() * products.length);
      const product = products[productIndex];
      
      const quantity = Math.floor(Math.random() * 2) + 1;
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
    if (i % 20 === 0) console.log(`Created ${i} orders`);
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