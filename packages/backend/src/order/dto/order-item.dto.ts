import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class OrderItemDto {
  @ApiProperty({ example: 1, description: 'Product ID' })
  @IsNotEmpty()
  @IsInt()
  productId: number;

  @ApiProperty({ example: 2, description: 'Quantity of the product' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 99.99, description: 'Price per unit at the time of order' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;
}