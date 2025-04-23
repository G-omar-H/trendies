import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, Min, ValidateNested } from 'class-validator';
import { OrderStatus } from '@prisma/client';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
  @ApiProperty({ example: 1, description: 'Customer ID' })
  @IsNotEmpty()
  @IsInt()
  customerId: number;

  @ApiPropertyOptional({ 
    enum: OrderStatus, 
    default: OrderStatus.PENDING,
    description: 'Order status' 
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ 
    type: [OrderItemDto], 
    description: 'Order items (products in the order)' 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];

  @ApiProperty({ example: 199.98, description: 'Total amount of the order' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  total: number;
}