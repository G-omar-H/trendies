import { apiClient } from './client';
import { Customer } from './customer';
import { Product } from './product';

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
};

export type Order = {
  id: number;
  status: OrderStatus;
  customerId: number;
  customer: Customer;
  orderItems: OrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
};

export type OrdersResponse = {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type OrderItemInput = {
  productId: number;
  quantity: number;
  price: number;
};

export type CreateOrderData = {
  customerId: number;
  status?: OrderStatus;
  orderItems: OrderItemInput[];
  total: number;
};

export type UpdateOrderData = Partial<CreateOrderData>;

export const orderApi = {
  getOrders: (page = 1, limit = 10, status?: OrderStatus): Promise<OrdersResponse> => {
    let url = `/orders?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    return apiClient.get(url);
  },

  getOrder: (id: number): Promise<Order> => {
    return apiClient.get(`/orders/${id}`);
  },

  createOrder: (data: CreateOrderData): Promise<Order> => {
    return apiClient.post('/orders', data);
  },

  updateOrder: (id: number, data: UpdateOrderData): Promise<Order> => {
    return apiClient.patch(`/orders/${id}`, data);
  },

  deleteOrder: (id: number): Promise<void> => {
    return apiClient.delete(`/orders/${id}`);
  },
};