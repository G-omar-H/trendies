import { apiClient } from './client';

export type Customer = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
};

export type CustomersResponse = {
  data: Customer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type CreateCustomerData = {
  name: string;
  email: string;
  phone?: string;
  address?: string;
};

export type UpdateCustomerData = Partial<CreateCustomerData>;

export const customerApi = {
  getCustomers: (page = 1, limit = 10): Promise<CustomersResponse> => {
    return apiClient.get(`/customers?page=${page}&limit=${limit}`);
  },

  getCustomer: (id: number): Promise<Customer> => {
    return apiClient.get(`/customers/${id}`);
  },

  createCustomer: (data: CreateCustomerData): Promise<Customer> => {
    return apiClient.post('/customers', data);
  },

  updateCustomer: (id: number, data: UpdateCustomerData): Promise<Customer> => {
    return apiClient.patch(`/customers/${id}`, data);
  },

  deleteCustomer: (id: number): Promise<void> => {
    return apiClient.delete(`/customers/${id}`);
  },
};