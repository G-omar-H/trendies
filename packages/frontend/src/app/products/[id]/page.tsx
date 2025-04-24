'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { productApi } from '@/api/product';
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
  LoadingOverlay,
  Alert,
  Badge,
  NumberFormatter,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import ProductForm from '../ProductForm';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);

  const { data: product, isLoading, isError, refetch } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productApi.getProduct(productId),
  });

  const { data: productOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['product-orders', productId],
    queryFn: () => orderApi.getOrders(1, 100), // Get more orders to ensure we find all
    enabled: !!product, // Only run this query if we have a product
  });
  

  const deleteProduct = useMutation({
    mutationFn: () => productApi.deleteProduct(productId),
    onSuccess: () => {
      router.push('/products');
    },
  });

  // Function to determine stock status color
  const getStockStatusColor = (stock: number): string => {
    if (stock <= 0) return 'red';
    if (stock < 10) return 'orange';
    return 'green';
  };

  if (isLoading) {
    return (
      <Card padding="xl" shadow="md" radius="md" style={{ position: 'relative', minHeight: '300px' }}>
        <LoadingOverlay visible={true} />
      </Card>
    );
  }

  if (isError || !product) {
    return (
      <Alert color="red" title="Error" variant="filled">
        Product not found or error loading product data
      </Alert>
    );
  }

  return (
    <>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Product Details</Title>
        <Group>
          <Button variant="outline" onClick={openEdit}>Edit</Button>
          <Button color="red" variant="outline" onClick={openDelete}>Delete</Button>
        </Group>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack spacing="md">
          <Group>
            <Text fw={500} w="120px">Name:</Text>
            <Text>{product.name}</Text>
          </Group>
          
          <Group align="flex-start">
            <Text fw={500} w="120px">Description:</Text>
            <Text style={{ flex: 1 }}>{product.description || '—'}</Text>
          </Group>
          
          <Group>
            <Text fw={500} w="120px">Price:</Text>
            <Text>
              <NumberFormatter
                value={product.price}
                prefix="$"
                decimalScale={2}
                fixedDecimalScale
              />
            </Text>
          </Group>
          
          <Group>
            <Text fw={500} w="120px">SKU:</Text>
            <Text>{product.sku}</Text>
          </Group>
          
          <Group>
            <Text fw={500} w="120px">Stock:</Text>
            <Badge color={getStockStatusColor(product.stock)}>
              {product.stock}
            </Badge>
          </Group>
        </Stack>

        <Divider my="md" />

<Title order={3} size="h4" mb="md">Orders containing this product</Title>

{isLoadingOrders ? (
  <LoadingOverlay visible={true} />
) : (
  <>
    {productOrders?.data && productOrders.data
      .filter(order => order.orderItems.some(item => item.productId === productId))
      .length > 0 ? (
      <div className="overflow-x-auto">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Order ID</Table.Th>
              <Table.Th>Customer</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Quantity</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {productOrders.data
              .filter(order => order.orderItems.some(item => item.productId === productId))
              .map((order) => {
                const orderItem = order.orderItems.find(item => item.productId === productId);
                const quantity = orderItem ? orderItem.quantity : 0;
                
                return (
                  <Table.Tr key={order.id}>
                    <Table.Td>#{order.id}</Table.Td>
                    <Table.Td>{order.customer.name}</Table.Td>
                    <Table.Td>{new Date(order.createdAt).toLocaleDateString()}</Table.Td>
                    <Table.Td>{quantity}</Table.Td>
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
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="subtle" size="xs">View</Button>
                      </Link>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
          </Table.Tbody>
        </Table>
      </div>
    ) : (
      <Text c="dimmed">No orders found for this product.</Text>
    )}
  </>
)}
        
        <Group justify="center" mt="xl">
          <Button variant="subtle" onClick={() => router.push('/products')}>
            Back to Products
          </Button>
        </Group>
      </Card>

      <Modal opened={editOpened} onClose={closeEdit} title="Edit Product" centered size="lg">
        <ProductForm 
          initialValues={product}
          productId={productId}
          onSuccess={() => { closeEdit(); refetch(); }}
        />
      </Modal>

      <Modal opened={deleteOpened} onClose={closeDelete} title="Delete Product" centered>
        <Text mb="lg">Are you sure you want to delete this product? This action cannot be undone.</Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={closeDelete}>Cancel</Button>
          <Button 
            color="red" 
            onClick={() => deleteProduct.mutate()}
            loading={deleteProduct.isPending}
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </>
  );
}