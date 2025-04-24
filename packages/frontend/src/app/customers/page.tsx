'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customerApi } from '@/api/customer';
import {
  Title,
  Table,
  Button,
  Group,
  Text,
  Pagination,
  Card,
  LoadingOverlay,
  ActionIcon,
  Modal,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import CustomerForm from './CustomerForm';

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [opened, { open, close }] = useDisclosure(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['customers', page],
    queryFn: () => customerApi.getCustomers(page),
  });

  const customers = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;

  return (
    <>
      <Group justify="space-between" className="mb-6">
        <Title order={2} size="h1" style={{ fontWeight: 600 }}>
          Customers
        </Title>
        <Button onClick={open}>Add Customer</Button>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder className="relative">
        <LoadingOverlay visible={isLoading} />
        {customers.length === 0 && !isLoading ? (
          <Text ta="center" py="xl" c="dimmed">
            No customers found. Add your first customer by clicking the &quot;Add Customer&quot; button.
          </Text>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Phone</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {customers.map((customer) => (
                <Table.Tr key={customer.id}>
                  <Table.Td>{customer.name}</Table.Td>
                  <Table.Td>{customer.email}</Table.Td>
                  <Table.Td>{customer.phone || '—'}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Link href={`/customers/${customer.id}`}>
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

      <Modal opened={opened} onClose={close} title="Add New Customer" centered>
        <CustomerForm onSuccess={() => { close(); refetch(); }} />
      </Modal>
    </>
  );
}