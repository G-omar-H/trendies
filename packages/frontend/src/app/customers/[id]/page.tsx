'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { customerApi } from '@/api/customer';
import { orderApi } from '@/api/order';
import Link from 'next/link';
import {
  Table,
  Title,
  Card,
  Text,
  Group,
  Button,
  Divider,
  Stack,
  Modal,
  Badge,
  LoadingOverlay,
  Alert,
  NumberFormatter,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import CustomerForm from '../CustomerForm';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = Number(params.id);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);

  const { data: customer, isLoading, isError, refetch } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customerApi.getCustomer(customerId),
  });

  const { data: customerOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['customer-orders', customerId],
    queryFn: () => orderApi.getOrders(1, 100),
    enabled: !!customer,
  });

  const deleteCustomer = useMutation({
    mutationFn: () => customerApi.deleteCustomer(customerId),
    onSuccess: () => {
      router.push('/customers');
    },
  });

  if (isLoading) {
    return (
      <Card padding="xl" shadow="md" radius="md" style={{ position: 'relative', minHeight: '300px' }}>
        <LoadingOverlay visible={true} />
      </Card>
    );
  }

  if (isError || !customer) {
    return (
      <Alert color="red" title="Error" variant="filled">
        Customer not found or error loading customer data
      </Alert>
    );
  }

  return (
    <>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Customer Details</Title>
        <Group>
          <Button variant="outline" onClick={openEdit}>Edit</Button>
          <Button color="red" variant="outline" onClick={openDelete}>Delete</Button>
        </Group>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack spacing="md">
          <Group>
            <Text fw={500} w="120px">Name:</Text>
            <Text>{customer.name}</Text>
          </Group>
          
          <Group>
            <Text fw={500} w="120px">Email:</Text>
            <Text>{customer.email}</Text>
          </Group>
          
          <Group>
            <Text fw={500} w="120px">Phone:</Text>
            <Text>{customer.phone || '—'}</Text>
          </Group>
          
          <Group>
            <Text fw={500} w="120px">Address:</Text>
            <Text>{customer.address || '—'}</Text>
          </Group>
        </Stack>

        <Divider my="md" />

<Title order={3} size="h4" mb="md">Order History</Title>

{isLoadingOrders ? (
  <LoadingOverlay visible={true} />
) : (
  <>
    {customerOrders?.data && customerOrders.data.filter(order => order.customerId === customerId).length > 0 ? (
      <div className="overflow-x-auto">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Order ID</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Total</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {customerOrders.data
              .filter(order => order.customerId === customerId)
              .map((order) => (
                <Table.Tr key={order.id}>
                  <Table.Td>#{order.id}</Table.Td>
                  <Table.Td>{new Date(order.createdAt).toLocaleDateString()}</Table.Td>
                  <Table.Td>
                    <Badge color={
                      order.status === 'PENDING' ? 'yellow' :
                      order.status === 'PROCESSING' ? 'blue' :
                      order.status === 'SHIPPED' ? 'indigo' :
                      order.status === 'DELIVERED' ? 'green' : 'red'
                    }>
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
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="subtle" size="xs">View</Button>
                    </Link>
                  </Table.Td>
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      </div>
    ) : (
      <Text c="dimmed">No orders found for this customer.</Text>
    )}
  </>
)}
        
        <Group justify="center" mt="xl">
          <Button variant="subtle" onClick={() => router.push('/customers')}>
            Back to Customers
          </Button>
        </Group>
      </Card>

      <Modal opened={editOpened} onClose={closeEdit} title="Edit Customer" centered>
        <CustomerForm 
          initialValues={customer}
          customerId={customerId}
          onSuccess={() => { closeEdit(); refetch(); }}
        />
      </Modal>

      <Modal opened={deleteOpened} onClose={closeDelete} title="Delete Customer" centered>
        <Text mb="lg">Are you sure you want to delete this customer? This action cannot be undone.</Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={closeDelete}>Cancel</Button>
          <Button 
            color="red" 
            onClick={() => deleteCustomer.mutate()}
            loading={deleteCustomer.isPending}
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </>
  );
}