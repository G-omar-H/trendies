import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Patch, 
    Param, 
    Delete, 
    Query, 
    ParseIntPipe 
  } from '@nestjs/common';
  import { 
    ApiTags, 
    ApiOperation, 
    ApiResponse, 
    ApiQuery 
  } from '@nestjs/swagger';
  import { OrderService } from './order.service';
  import { CreateOrderDto } from './dto/create-order.dto';
  import { UpdateOrderDto } from './dto/update-order.dto';
  import { OrderStatus } from '@prisma/client';
  
  @ApiTags('orders')
  @Controller('orders')
  export class OrderController {
    constructor(private readonly orderService: OrderService) {}
  
    @Post()
    @ApiOperation({ summary: 'Create a new order' })
    @ApiResponse({ status: 201, description: 'The order has been successfully created.' })
    create(@Body() createOrderDto: CreateOrderDto) {
      return this.orderService.create(createOrderDto);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all orders with pagination' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ 
      name: 'status', 
      required: false, 
      enum: OrderStatus,
      description: 'Filter orders by status' 
    })
    findAll(
      @Query('page', new ParseIntPipe({ optional: true })) page?: number,
      @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
      @Query('status') status?: OrderStatus,
    ) {
      return this.orderService.findAll(page || 1, limit || 10, status);
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get an order by ID' })
    @ApiResponse({ status: 200, description: 'Return the order.' })
    @ApiResponse({ status: 404, description: 'Order not found.' })
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.orderService.findOne(id);
    }
  
    @Patch(':id')
    @ApiOperation({ summary: 'Update an order' })
    @ApiResponse({ status: 200, description: 'The order has been successfully updated.' })
    @ApiResponse({ status: 404, description: 'Order not found.' })
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateOrderDto: UpdateOrderDto,
    ) {
      return this.orderService.update(id, updateOrderDto);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Delete an order' })
    @ApiResponse({ status: 200, description: 'The order has been successfully deleted.' })
    @ApiResponse({ status: 404, description: 'Order not found.' })
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.orderService.remove(id);
    }
  }