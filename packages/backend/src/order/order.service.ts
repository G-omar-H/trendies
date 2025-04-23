import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus, Prisma } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const { customerId, orderItems, status, total } = createOrderDto;

    // Check if customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    // Check if products exist and have enough stock
    for (const item of orderItems) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Not enough stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        );
      }
    }

    // Create order with orderItems in a transaction
    return this.prisma.$transaction(async (prisma) => {
      // Create order
      const order = await prisma.order.create({
        data: {
          customerId,
          total,
          status: status || OrderStatus.PENDING,
        },
      });

      // Create order items and update product stock
      for (const item of orderItems) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          },
        });

        // Update product stock
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Return created order with orderItems
      return prisma.order.findUnique({
        where: { id: order.id },
        include: {
          customer: true,
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  }

  async findAll(page = 1, limit = 10, status?: OrderStatus) {
    const skip = (page - 1) * limit;
    
    const where: Prisma.OrderWhereInput = {};
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    // Check if order exists
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const { customerId, status, orderItems, total } = updateOrderDto;

    // Check if customer exists
    if (customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        throw new NotFoundException(`Customer with ID ${customerId} not found`);
      }
    }

    // Handle order items update in a transaction if needed
    if (orderItems && orderItems.length > 0) {
      return this.prisma.$transaction(async (prisma) => {
        // Delete existing order items
        await prisma.orderItem.deleteMany({
          where: { orderId: id },
        });

        // Create new order items and update product stock
        for (const item of orderItems) {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new NotFoundException(`Product with ID ${item.productId} not found`);
          }

          if (product.stock < item.quantity) {
            throw new BadRequestException(
              `Not enough stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
            );
          }

          await prisma.orderItem.create({
            data: {
              orderId: id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            },
          });

          // Update product stock
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        // Update order
        await prisma.order.update({
          where: { id },
          data: {
            customerId,
            status,
            total,
          },
        });

        // Return updated order with orderItems
        return prisma.order.findUnique({
          where: { id },
          include: {
            customer: true,
            orderItems: {
              include: {
                product: true,
              },
            },
          },
        });
      });
    }

    // If no orderItems update, just update the order
    return this.prisma.order.update({
      where: { id },
      data: {
        customerId,
        status,
        total,
      },
      include: {
        customer: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    try {
      // Get order items to restore product stock
      const order = await this.prisma.order.findUnique({
        where: { id },
        include: {
          orderItems: true,
        },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      // Delete order and restore product stock in a transaction
      return this.prisma.$transaction(async (prisma) => {
        // Restore product stock for each order item
        for (const item of order.orderItems) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }

        // Delete order (cascades to order items)
        return prisma.order.delete({
          where: { id },
        });
      });
    } catch (error) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  }
}