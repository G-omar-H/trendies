import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Headphones', description: 'Product name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'High-quality wireless headphones with noise cancellation', description: 'Product description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 99.99, description: 'Product price' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'WH-1000XM4', description: 'Product SKU (Stock Keeping Unit)' })
  @IsNotEmpty()
  @IsString()
  sku: string;

  @ApiProperty({ example: 50, description: 'Product stock quantity' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  stock: number;
}