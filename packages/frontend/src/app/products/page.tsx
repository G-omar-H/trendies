'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/api/product';
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
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import ProductForm from './ProductForm';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [opened, { open, close }] = useDisclosure(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['products', page],
    queryFn: () => productApi.getProducts(page),
  });

  const products = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;

  // Function to determine stock status color
  const getStockStatusColor = (stock: number): string => {
    if (stock <= 0) return 'red';
    if (stock < 10) return 'orange';
    return 'green';
  };

  return (
    <>
      <Group justify="space-between" className="mb-6">
        <Title order={2} size="h1" style={{ fontWeight: 600 }}>
          Products
        </Title>
        <Button onClick={open}>Add Product</Button>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder className="relative">
        <LoadingOverlay visible={isLoading} />
        {products.length === 0 && !isLoading ? (
          <Text ta="center" py="xl" c="dimmed">
            No products found. Add your first product by clicking the &quot;Add Product&quot; button.
          </Text>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>SKU</Table.Th>
                <Table.Th>Price</Table.Th>
                <Table.Th>Stock</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {products.map((product) => (
                <Table.Tr key={product.id}>
                  <Table.Td>{product.name}</Table.Td>
                  <Table.Td>{product.sku}</Table.Td>
                  <Table.Td>
                    <NumberFormatter
                      value={product.price}
                      prefix="$"
                      decimalScale={2}
                      fixedDecimalScale
                    />
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getStockStatusColor(product.stock)}>
                      {product.stock}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Link href={`/products/${product.id}`}>
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

      <Modal opened={opened} onClose={close} title="Add New Product" centered size="lg">
        <ProductForm onSuccess={() => { close(); refetch(); }} />
      </Modal>
    </>
  );
}