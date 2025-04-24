'use client';

import { useState } from 'react';
import { TextInput, Button, Group, Stack, NumberInput, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { productApi, CreateProductData } from '@/api/product';

interface ProductFormProps {
  onSuccess: () => void;
  initialValues?: Partial<CreateProductData>;
  productId?: number;
}

export default function ProductForm({ onSuccess, initialValues, productId }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const isEditMode = !!productId;

  const form = useForm<CreateProductData>({
    initialValues: initialValues || {
      name: '',
      description: '',
      price: 0,
      sku: '',
      stock: 0,
    },

    validate: {
      name: (value) => (value ? null : 'Name is required'),
      price: (value) => (value >= 0 ? null : 'Price must be a positive number'),
      sku: (value) => (value ? null : 'SKU is required'),
      stock: (value) => (value >= 0 ? null : 'Stock must be a positive number'),
    },
  });

  const handleSubmit = async (values: CreateProductData) => {
    setLoading(true);
    try {
      if (isEditMode) {
        await productApi.updateProduct(productId, values);
      } else {
        await productApi.createProduct(values);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          label="Name"
          placeholder="Luxury Watch"
          required
          {...form.getInputProps('name')}
        />

        <Textarea
          label="Description"
          placeholder="High-quality luxury watch with premium materials"
          autosize
          minRows={3}
          {...form.getInputProps('description')}
        />

        <Group grow>
          <NumberInput
            label="Price"
            placeholder="999.99"
            required
            min={0}
            decimalScale={2}
            prefix="$"
            {...form.getInputProps('price')}
          />

          <TextInput
            label="SKU"
            placeholder="LUX-WATCH-001"
            required
            {...form.getInputProps('sku')}
          />
        </Group>

        <NumberInput
          label="Stock"
          placeholder="50"
          required
          min={0}
          {...form.getInputProps('stock')}
        />

        <Group justify="flex-end" mt="md">
          <Button type="submit" loading={loading}>
            {isEditMode ? 'Update Product' : 'Create Product'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}