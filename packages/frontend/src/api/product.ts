import { apiClient } from './client';

export type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  sku: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductsResponse = {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type CreateProductData = {
  name: string;
  description?: string;
  price: number;
  sku: string;
  stock: number;
};

export type UpdateProductData = Partial<CreateProductData>;

export const productApi = {
  getProducts: (page = 1, limit = 10): Promise<ProductsResponse> => {
    return apiClient.get(`/products?page=${page}&limit=${limit}`);
  },

  getProduct: (id: number): Promise<Product> => {
    return apiClient.get(`/products/${id}`);
  },

  createProduct: (data: CreateProductData): Promise<Product> => {
    return apiClient.post('/products', data);
  },

  updateProduct: (id: number, data: UpdateProductData): Promise<Product> => {
    return apiClient.patch(`/products/${id}`, data);
  },

  deleteProduct: (id: number): Promise<void> => {
    return apiClient.delete(`/products/${id}`);
  },
};