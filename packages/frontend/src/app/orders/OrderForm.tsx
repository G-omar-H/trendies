'use client';

import { useState, useEffect } from 'react';
import { 
  Button, 
  Group, 
  Stack, 
  Select, 
  NumberInput, 
  Text, 
  Card, 
  ActionIcon, 
  Table,
  Divider, 
  LoadingOverlay 
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { orderApi, CreateOrderData, OrderStatus } from '@/api/order';
import { customerApi } from '@/api/customer';
import { productApi, Product } from '@/api/product';
import { IconTrash } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';

interface OrderFormProps {
  onSuccess: () => void;
  initialValues?: Partial<CreateOrderData>;
  orderId?: number;
}

export default function OrderForm({ onSuccess, initialValues, orderId }: OrderFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number | string>(1);
  const [products, setProducts] = useState<Product[]>([]);
  const isEditMode = !!orderId;

  // Fetch customers
  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers-all'],
    queryFn: () => customerApi.getCustomers(1, 100), // Fetch up to 100 customers
  });

  // Fetch products
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products-all'],
    queryFn: () => productApi.getProducts(1, 100), // Fetch up to 100 products
  });

  // Extract data from query results
  const customers = customersData?.data || [];
  const availableProducts = productsData?.data || [];

  const form = useForm<CreateOrderData>({
    initialValues: initialValues || {
      customerId: 0,
      status: OrderStatus.PENDING,
      orderItems: [],
      total: 0,
    },
    validate: {
      customerId: (value) => (value ? null : 'Customer is required'),
      orderItems: {
        productId: (value) => (value ? null : 'Product is required'),
        quantity: (value) => (value > 0 ? null : 'Quantity must be greater than 0'),
      },
    },
  });

  // Calculate total order amount
  const calculateTotal = (items: typeof form.values.orderItems) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Add product to order
  const addProduct = () => {
    if (!selectedProduct || !quantity) return;
    
    const productId = parseInt(selectedProduct);
    const product = availableProducts.find(p => p.id === productId);
    
    if (!product) return;
    
    // Check if product is already in the order
    const existingItem = form.values.orderItems.find(item => item.productId === productId);
    
    let updatedItems;
    
    if (existingItem) {
      // Update existing item
      updatedItems = form.values.orderItems.map(item => 
        item.productId === productId 
          ? { ...item, quantity: item.quantity + Number(quantity) }
          : item
      );
    } else {
      // Add new item
      updatedItems = [
        ...form.values.orderItems,
        {
          productId,
          quantity: Number(quantity),
          price: product.price,
        }
      ];
    }
    
    // Calculate the new total AFTER updating the items
    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Update both the orderItems and total in a single form update
    form.setValues({
      ...form.values,
      orderItems: updatedItems,
      total: newTotal
    });
    
    // Reset selection
    setSelectedProduct(null);
    setQuantity(1);
  };

  // Remove product from order
  const removeProduct = (index: number) => {
    const newItems = [...form.values.orderItems];
    newItems.splice(index, 1);
    
    // Calculate the new total AFTER removing the item
    const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Update both the orderItems and total in a single form update
    form.setValues({
      ...form.values,
      orderItems: newItems,
      total: newTotal
    });
  };

  // Handle form submission
  const handleSubmit = async (values: CreateOrderData) => {
    // Ensure we have items
    if (values.orderItems.length === 0) {
      alert('Please add at least one product to the order');
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await orderApi.updateOrder(orderId, values);
      } else {
        await orderApi.createOrder(values);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving order:', error);
      alert('An error occurred while saving the order');
    } finally {
      setLoading(false);
    }
  };

  // Get product details for display
  useEffect(() => {
    if (availableProducts.length > 0 && form.values.orderItems.length > 0) {
      const productDetails = form.values.orderItems.map(item => {
        const product = availableProducts.find(p => p.id === item.productId);
        return {
          ...item,
          product
        };
      });
      setProducts(productDetails.map(item => item.product).filter(Boolean) as Product[]);
    }
  }, [availableProducts, form.values.orderItems, form.values.total]);

  if (isLoadingCustomers || isLoadingProducts) {
    return <LoadingOverlay visible={true} />;
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack spacing="md" pos="relative">
        <LoadingOverlay visible={loading} />
        
        <Select
          label="Customer"
          placeholder="Select a customer"
          required
          searchable
          data={customers.map(customer => ({
            value: String(customer.id),
            label: `${customer.name} (${customer.email})`
          }))}
          value={form.values.customerId ? String(form.values.customerId) : null}
          onChange={(value) => form.setFieldValue('customerId', value ? parseInt(value) : 0)}
          error={form.errors.customerId}
        />
        
        <Select
          label="Status"
          placeholder="Select order status"
          data={Object.values(OrderStatus).map(status => ({
            value: status,
            label: status.charAt(0) + status.slice(1).toLowerCase()
          }))}
          value={form.values.status}
          onChange={(value) => form.setFieldValue('status', value as OrderStatus)}
        />

        <Divider label="Add Products" labelPosition="center" />
        
        <Group align="flex-end">
          <Select
            label="Product"
            placeholder="Select a product"
            searchable
            data={availableProducts
              .filter(p => p.stock > 0)
              .map(product => ({
                value: String(product.id),
                label: `${product.name} - $${product.price.toFixed(2)} (${product.stock} in stock)`
              }))}
            value={selectedProduct}
            onChange={setSelectedProduct}
            style={{ flex: 3 }}
          />
          
          <NumberInput
            label="Quantity"
            placeholder="1"
            min={1}
            max={selectedProduct ? 
              availableProducts.find(p => p.id === parseInt(selectedProduct))?.stock || 99 
              : 99}
            value={quantity}
            onChange={setQuantity}
            style={{ flex: 1 }}
          />
          
          <Button onClick={addProduct}>Add</Button>
        </Group>
        
        {form.values.orderItems.length > 0 ? (
          <Card withBorder shadow="sm" radius="md" padding="md" mt="md">
            <Text fw={500} mb="xs">Order Items</Text>
            
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Product</Table.Th>
                  <Table.Th>Price</Table.Th>
                  <Table.Th>Quantity</Table.Th>
                  <Table.Th>Subtotal</Table.Th>
                  <Table.Th></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {form.values.orderItems.map((item, index) => {
                  const product = availableProducts.find(p => p.id === item.productId);
                  return (
                    <Table.Tr key={index}>
                      <Table.Td>{product?.name}</Table.Td>
                      <Table.Td>${item.price.toFixed(2)}</Table.Td>
                      <Table.Td>{item.quantity}</Table.Td>
                      <Table.Td>${(item.price * item.quantity).toFixed(2)}</Table.Td>
                      <Table.Td>
                        <ActionIcon color="red" onClick={() => removeProduct(index)}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
                <Table.Tr>
                  <Table.Td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    Total:
                  </Table.Td>
                  <Table.Td colSpan={2} style={{ fontWeight: 'bold' }}>
                    ${form.values.total.toFixed(2)}
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Card>
        ) : (
          <Text c="dimmed" ta="center" py="sm">
            No products added to this order yet.
          </Text>
        )}

        <Group justify="flex-end" mt="xl">
          <Button type="submit" disabled={form.values.orderItems.length === 0}>
            {isEditMode ? 'Update Order' : 'Create Order'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}