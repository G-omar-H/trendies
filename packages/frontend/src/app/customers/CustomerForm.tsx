'use client';

import { useState } from 'react';
import { TextInput, Button, Group, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { customerApi, CreateCustomerData } from '@/api/customer';

interface CustomerFormProps {
  onSuccess: () => void;
  initialValues?: Partial<CreateCustomerData>;
  customerId?: number;
}

export default function CustomerForm({ onSuccess, initialValues, customerId }: CustomerFormProps) {
  const [loading, setLoading] = useState(false);
  const isEditMode = !!customerId;

  const form = useForm<CreateCustomerData>({
    initialValues: initialValues || {
      name: '',
      email: '',
      phone: '',
      address: '',
    },

    validate: {
      name: (value) => (value ? null : 'Name is required'),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const handleSubmit = async (values: CreateCustomerData) => {
    setLoading(true);
    try {
      if (isEditMode) {
        await customerApi.updateCustomer(customerId, values);
      } else {
        await customerApi.createCustomer(values);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving customer:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          label="Name"
          placeholder="John Doe"
          required
          {...form.getInputProps('name')}
        />

        <TextInput
          label="Email"
          placeholder="john@example.com"
          required
          {...form.getInputProps('email')}
        />

        <TextInput
          label="Phone"
          placeholder="+1 234 567 8900"
          {...form.getInputProps('phone')}
        />

        <TextInput
          label="Address"
          placeholder="123 Main St, City, Country"
          {...form.getInputProps('address')}
        />

        <Group justify="flex-end" mt="md">
          <Button type="submit" loading={loading}>
            {isEditMode ? 'Update Customer' : 'Create Customer'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}