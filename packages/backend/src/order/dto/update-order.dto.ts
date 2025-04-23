import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, Min, ValidateNested } from 'class-validator';
import { OrderStatus } from '@prisma/client';
import { OrderItemDto } from './order-item.dto';

export class UpdateOrderDto {
  @ApiPropertyOptional({ example: 1, description: 'Customer ID' })
  @IsOptional()
  @IsInt()
  customerId?: number;

  @ApiPropertyOptional({ enum: OrderStatus, description: 'Order status' })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ 
    type: [OrderItemDto], 
    description: 'Order items (products in the order)' 
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems?: OrderItemDto[];

  @ApiPropertyOptional({ example: 199.98, description: 'Total amount of the order' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  total?: number;
}