'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { orderApi, OrderStatus } from '@/api/order';
import {
  Title,
  Card,
  Text,
  Group,
  Button,
  Stack,
  Badge,
  Modal,
  LoadingOverlay,
  Alert,
  Divider,
  Table,
  Select,
  NumberFormatter,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import OrderForm from '../OrderForm';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [status, setStatus] = useState<OrderStatus | null>(null);

  const { data: order, isLoading, isError, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApi.getOrder(orderId),
    onSuccess: (data) => {
      setStatus(data.status);
    }
  });

  const deleteOrder = useMutation({
    mutationFn: () => orderApi.deleteOrder(orderId),
    onSuccess: () => {
      router.push('/orders');
    },
  });

  const updateStatus = useMutation({
    mutationFn: (newStatus: OrderStatus) => 
      orderApi.updateOrder(orderId, { status: newStatus }),
    onSuccess: () => {
      refetch();
    },
  });

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusChange = (value: string | null) => {
    if (!value) return;
    
    const newStatus = value as OrderStatus;
    setStatus(newStatus);
    updateStatus.mutate(newStatus);
  };

  if (isLoading) {
    return (
      <Card padding="xl" shadow="md" radius="md" style={{ position: 'relative', minHeight: '300px' }}>
        <LoadingOverlay visible={true} />
      </Card>
    );
  }

  if (isError || !order) {
    return (
      <Alert color="red" title="Error" variant="filled">
        Order not found or error loading order data
      </Alert>
    );
  }

  return (
    <>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Order #{order.id}</Title>
        <Group>
          <Button variant="outline" onClick={openEdit}>Edit Order</Button>
          <Button color="red" variant="outline" onClick={openDelete}>Delete Order</Button>
        </Group>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder className="mb-4">
        <Group position="apart" mb="md">
          <Stack spacing="xs">
            <Group>
              <Text fw={500} w={100}>Customer:</Text>
              <Text>{order.customer.name}</Text>
            </Group>
            <Group>
              <Text fw={500} w={100}>Email:</Text>
              <Text>{order.customer.email}</Text>
            </Group>
            <Group>
              <Text fw={500} w={100}>Created:</Text>
              <Text>{formatDate(order.createdAt)}</Text>
            </Group>
            <Group>
              <Text fw={500} w={100}>Updated:</Text>
              <Text>{formatDate(order.updatedAt)}</Text>
            </Group>
          </Stack>
          
          <Stack spacing="xs" align="flex-end">
            <Group>
              <Text fw={500}>Status:</Text>
              <Select
                value={status}
                onChange={handleStatusChange}
                data={Object.values(OrderStatus).map(status => ({
                  value: status,
                  label: status.charAt(0) + status.slice(1).toLowerCase()
                }))}
                style={{ width: 150 }}
              />
            </Group>
            <Group mt="md">
              <Text fw={700} size="lg">Total:</Text>
              <Text fw={700} size="lg">
                <NumberFormatter
                  value={order.total}
                  prefix="$"
                  decimalScale={2}
                  fixedDecimalScale
                />
              </Text>
            </Group>
          </Stack>
        </Group>
      </Card>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={3} size="h4" mb="lg">Order Items</Title>
        
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Product</Table.Th>
              <Table.Th>SKU</Table.Th>
              <Table.Th>Price</Table.Th>
              <Table.Th>Quantity</Table.Th>
              <Table.Th>Subtotal</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {order.orderItems.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>{item.product.name}</Table.Td>
                <Table.Td>{item.product.sku}</Table.Td>
                <Table.Td>
                  <NumberFormatter
                    value={item.price}
                    prefix="$"
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </Table.Td>
                <Table.Td>{item.quantity}</Table.Td>
                <Table.Td>
                  <NumberFormatter
                    value={item.price * item.quantity}
                    prefix="$"
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
          <Table.Tfoot>
            <Table.Tr>
              <Table.Th colSpan={4} style={{ textAlign: 'right' }}>Total:</Table.Th>
              <Table.Th>
                <NumberFormatter
                  value={order.total}
                  prefix="$"
                  decimalScale={2}
                  fixedDecimalScale
                />
              </Table.Th>
            </Table.Tr>
          </Table.Tfoot>
        </Table>
        
        <Group justify="center" mt="xl">
          <Button variant="subtle" onClick={() => router.push('/orders')}>
            Back to Orders
          </Button>
        </Group>
      </Card>

      <Modal opened={editOpened} onClose={closeEdit} title="Edit Order" centered size="xl">
        <OrderForm 
          initialValues={{
            customerId: order.customerId,
            status: order.status,
            total: order.total,
            orderItems: order.orderItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          }}
          orderId={orderId}
          onSuccess={() => { closeEdit(); refetch(); }}
        />
      </Modal>

      <Modal opened={deleteOpened} onClose={closeDelete} title="Delete Order" centered>
        <Text mb="lg">Are you sure you want to delete this order? This action cannot be undone.</Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={closeDelete}>Cancel</Button>
          <Button 
            color="red" 
            onClick={() => deleteOrder.mutate()}
            loading={deleteOrder.isPending}
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </>
  );
}