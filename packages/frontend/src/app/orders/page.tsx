'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderApi, OrderStatus } from '@/api/order';
import {
  Title,
  Table,
  Button,
  Group,
  Text,
  Pagination,
  Card,
  LoadingOverlay,
  Badge,
  Modal,
  NumberFormatter,
  SegmentedControl,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import OrderForm from './OrderForm';

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['orders', page, status],
    queryFn: () => orderApi.getOrders(page, 10, status as OrderStatus),
  });

  const orders = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;

  // Helper function to get status badge color
  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'yellow';
      case OrderStatus.PROCESSING:
        return 'blue';
      case OrderStatus.SHIPPED:
        return 'indigo';
      case OrderStatus.DELIVERED:
        return 'green';
      case OrderStatus.CANCELLED:
        return 'red';
      default:
        return 'gray';
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <Group justify="space-between" className="mb-6">
        <Title order={2} size="h1" style={{ fontWeight: 600 }}>
          Orders
        </Title>
        <Button onClick={open}>Create Order</Button>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder className="mb-4">
        <Group justify="flex-start">
          <Text fw={500}>Filter by Status:</Text>
          <SegmentedControl
            value={status || ''}
            onChange={(value) => {
              setStatus(value || null);
              setPage(1);
            }}
            data={[
              { label: 'All', value: '' },
              { label: 'Pending', value: OrderStatus.PENDING },
              { label: 'Processing', value: OrderStatus.PROCESSING },
              { label: 'Shipped', value: OrderStatus.SHIPPED },
              { label: 'Delivered', value: OrderStatus.DELIVERED },
              { label: 'Cancelled', value: OrderStatus.CANCELLED },
            ]}
          />
        </Group>
      </Card>

      <Card shadow="sm" padding="lg" radius="md" withBorder className="relative">
        <LoadingOverlay visible={isLoading} />
        {orders.length === 0 && !isLoading ? (
          <Text ta="center" py="xl" c="dimmed">
            No orders found. Create your first order by clicking the &quot;Create Order&quot; button.
          </Text>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Order ID</Table.Th>
                <Table.Th>Customer</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Total</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {orders.map((order) => (
                <Table.Tr key={order.id}>
                  <Table.Td>#{order.id}</Table.Td>
                  <Table.Td>{order.customer.name}</Table.Td>
                  <Table.Td>{formatDate(order.createdAt)}</Table.Td>
                  <Table.Td>
                    <Badge color={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <NumberFormatter
                      value={order.total}
                      prefix="$"
                      decimalScale={2}
                      fixedDecimalScale
                    />
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="subtle" size="xs">
                          View
                        </Button>
                      </Link>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}

        {totalPages > 1 && (
          <Group justify="center" mt="md">
            <Pagination value={page} onChange={setPage} total={totalPages} />
          </Group>
        )}
      </Card>

      <Modal opened={opened} onClose={close} title="Create New Order" centered size="xl">
        <OrderForm onSuccess={() => { close(); refetch(); }} />
      </Modal>
    </>
  );
}