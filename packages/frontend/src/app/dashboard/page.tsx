'use client';

import { SimpleGrid, Card, Text, Title, Group, RingProgress, useMantineTheme, LoadingOverlay } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { customerApi } from '@/api/customer';
import { productApi } from '@/api/product';
import { orderApi, OrderStatus } from '@/api/order';
import Link from 'next/link';

export default function Dashboard() {
  const theme = useMantineTheme();
  
  // Fetch dashboard data
  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers-count'],
    queryFn: () => customerApi.getCustomers(1, 1),
  });
  
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products-count'],
    queryFn: () => productApi.getProducts(1, 1),
  });
  
  // Fetch orders - we need all of them to calculate total sales correctly
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['orders-dashboard'],
    queryFn: () => orderApi.getOrders(1, 1000), // Fetch more orders to ensure we get all
  });

  // Calculate data for display
  const customerCount = customersData?.meta?.total || 0;
  const productCount = productsData?.meta?.total || 0;
  const orderCount = ordersData?.meta?.total || 0;
  
  // Get all orders and calculate total sales
  const allOrders = ordersData?.data || [];
  const totalSales = allOrders.reduce((sum, order) => sum + Number(order.total), 0);
  
  // For recent orders, use the most recent orders from our fetched data
  // Sort by date descending to ensure most recent are first
  const recentOrders = [...allOrders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);
  
  // Calculate percentage for progress rings (for demo purposes)
  const customerPercentage = Math.min(100, Math.round((customerCount / 100) * 100));
  const productPercentage = Math.min(100, Math.round((productCount / 200) * 100));
  const orderPercentage = Math.min(100, Math.round((orderCount / 200) * 100));
  const salesPercentage = Math.min(100, Math.round((totalSales / 50000) * 100));

  const isLoading = isLoadingCustomers || isLoadingProducts || isLoadingOrders;
  
  console.log('Total Sales:', totalSales);
  console.log('All Orders:', allOrders);
  
  return (
    <>
      <Title
        order={2}
        size="h1"
        style={{ fontWeight: 600 }}
        className="mb-8"
      >
        Dashboard
      </Title>
      
      <div style={{ position: 'relative', minHeight: isLoading ? '200px' : 'auto' }}>
        <LoadingOverlay visible={isLoading} />
        
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" align="flex-start">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Total Sales
                </Text>
                <Text fw={700} size="xl">
                  ${totalSales.toFixed(2)}
                </Text>
              </div>
              <RingProgress
                sections={[{ value: salesPercentage, color: theme.colors.indigo[5] }]}
                size={80}
                thickness={8}
                label={
                  <Text c="indigo" fw={700} ta="center" size="lg">
                    {salesPercentage}%
                  </Text>
                }
              />
            </Group>
            <Text mt="sm" c="dimmed" size="sm">
              <Link href="/orders" className="text-indigo-4 hover:underline">
                View all orders
              </Link>
            </Text>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" align="flex-start">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Orders
                </Text>
                <Text fw={700} size="xl">
                  {orderCount}
                </Text>
              </div>
              <RingProgress
                sections={[{ value: orderPercentage, color: theme.colors.indigo[5] }]}
                size={80}
                thickness={8}
                label={
                  <Text c="indigo" fw={700} ta="center" size="lg">
                    {orderPercentage}%
                  </Text>
                }
              />
            </Group>
            <Text mt="sm" c="dimmed" size="sm">
              <Link href="/orders" className="text-indigo-4 hover:underline">
                Manage orders
              </Link>
            </Text>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" align="flex-start">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Customers
                </Text>
                <Text fw={700} size="xl">
                  {customerCount}
                </Text>
              </div>
              <RingProgress
                sections={[{ value: customerPercentage, color: theme.colors.indigo[5] }]}
                size={80}
                thickness={8}
                label={
                  <Text c="indigo" fw={700} ta="center" size="lg">
                    {customerPercentage}%
                  </Text>
                }
              />
            </Group>
            <Text mt="sm" c="dimmed" size="sm">
              <Link href="/customers" className="text-indigo-4 hover:underline">
                Manage customers
              </Link>
            </Text>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" align="flex-start">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Products
                </Text>
                <Text fw={700} size="xl">
                  {productCount}
                </Text>
              </div>
              <RingProgress
                sections={[{ value: productPercentage, color: theme.colors.indigo[5] }]}
                size={80}
                thickness={8}
                label={
                  <Text c="indigo" fw={700} ta="center" size="lg">
                    {productPercentage}%
                  </Text>
                }
              />
            </Group>
            <Text mt="sm" c="dimmed" size="sm">
              <Link href="/products" className="text-indigo-4 hover:underline">
                Manage products
              </Link>
            </Text>
          </Card>
        </SimpleGrid>

        <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
          <Title order={3} className="mb-4">Recent Orders</Title>
          
          {recentOrders.length === 0 ? (
            <Text c="dimmed">
              No recent orders to display. Create your first order to see it here.
            </Text>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 pr-4">Order ID</th>
                    <th className="text-left py-2 pr-4">Customer</th>
                    <th className="text-left py-2 pr-4">Date</th>
                    <th className="text-left py-2 pr-4">Status</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="py-2 pr-4">
                        <Link href={`/orders/${order.id}`} className="text-indigo-4 hover:underline">
                          #{order.id}
                        </Link>
                      </td>
                      <td className="py-2 pr-4">{order.customer.name}</td>
                      <td className="py-2 pr-4">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 pr-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === OrderStatus.PENDING ? 'bg-yellow-800 text-yellow-100' :
                          order.status === OrderStatus.PROCESSING ? 'bg-blue-800 text-blue-100' :
                          order.status === OrderStatus.SHIPPED ? 'bg-indigo-800 text-indigo-100' :
                          order.status === OrderStatus.DELIVERED ? 'bg-green-800 text-green-100' :
                          'bg-red-800 text-red-100'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2 text-right">${Number(order.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="mt-4 text-right">
            <Link href="/orders" className="text-indigo-400 hover:underline">
              View all orders →
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}