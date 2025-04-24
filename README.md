# Trendies - Order Management System

<img alt="Trendies Logo" src="https://trendiesmaroc.com/trendies-logo.svg">

A sophisticated order management system built with modern technologies. Trendies allows businesses to efficiently manage orders, products, and customers through an intuitive interface with server-side pagination.

## 📋 Features

### Order Management
- Create, view, edit, and delete orders
- Update order status (Pending, Processing, Shipped, Delivered, Cancelled)
- Track order history and details

### Product Management
- Comprehensive product catalog
- Stock tracking and availability
- Price management

### Customer Management
- Customer profiles and purchase history
- Contact information management

### Dashboard
- Sales metrics and insights
- Recent orders overview
- Performance indicators

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router) with React 19
- **UI Components**: Mantine UI
- **Styling**: Tailwind CSS
- **Data Fetching**: TanStack Query (React Query)
- **State Management**: React Context API

### Backend
- **API Framework**: Nest.js
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **API Documentation**: Swagger

### DevOps
- **Package Manager**: pnpm
- **Repository Structure**: Monorepo
- **Language**: TypeScript
- **Containerization**: Docker ready

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- pnpm (v8+)
- Docker and Docker Compose (optional)
- PostgreSQL (if not using Docker)

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/G-omar-H/trendies.git
    cd trendies
    ```

2. Install dependencies:
    ```bash
    pnpm install
    ```

3. Set up environment variables:
    - Copy environment templates:
      ```bash
      cp packages/backend/.env.example .env
      cp packages/frontend/.env.example packages/frontend/.env
      ```
    - Edit the `.env` files with your configuration.

4. Start the development environment:
    - Using Docker:
      ```bash
      docker-compose up -d
      ```
    - Without Docker:
     ```bash
      # Check if PostgreSQL is running
      sudo service postgresql status
      
      # If not running, start it
      sudo service postgresql start
      
      # Create database (first time only)
      sudo -u postgres psql -c "CREATE DATABASE trendies;"
      sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"
      ```

5. Set up the database schema and seed data:
    ```bash
    # In packages/backend directory
    npx prisma db push
    
    # Seed the database
    npx ts-node prisma/seeds/simple-seed.ts
    ```

6. Start the services separately:
    ```bash
    # Terminal 1: Start the backend
    cd packages/backend
    pnpm run start:dev
    
    # Terminal 2: Start the frontend
    cd packages/frontend
    pnpm run dev
    ```



7. Access the application:
    - Frontend: [http://localhost:3000](http://localhost:3000)
    - Backend API: [http://localhost:3333](http://localhost:3333)
    - API Documentation: [http://localhost:3333/api/docs](http://localhost:3333/api/docs)

## 📊 Project Structure

```
trendies/
├── packages/
│   ├── backend/          # Nest.js API
│   │   ├── src/
│   │   │   ├── customer/ # Customer module
│   │   │   ├── order/    # Order module
│   │   │   ├── product/  # Product module
│   │   │   └── main.ts   # Application entry point
│   │   ├── prisma/       # Prisma schema and migrations
│   │   └── package.json
│   └── frontend/         # Next.js application
│       ├── src/
│       │   ├── app/      # App router pages
│       │   ├── components/ # Reusable components
│       │   ├── api/      # API clients
│       │   └── lib/      # Utilities and helpers
│       └── package.json
├── docker-compose.yml    # Docker configuration
├── package.json          # Root package.json
├── pnpm-workspace.yaml   # Workspace configuration
└── README.md             # This file
```

## 📱 Application Pages

- **Dashboard** (`/`): Overview of sales metrics and recent orders
- **Orders** (`/orders`): List of all orders with pagination and filtering
- **Order Details** (`/orders/[id]`): Detailed view of a specific order
- **Products** (`/products`): Products catalog with inventory management
- **Product Details** (`/products/[id]`): Detailed view of a specific product
- **Customers** (`/customers`): Customer list with contact information
- **Customer Details** (`/customers/[id]`): Customer profile with order history

## 🔄 API Endpoints

### Orders
- `GET /orders`: List all orders (paginated)
- `GET /orders/:id`: Get order details
- `POST /orders`: Create a new order
- `PATCH /orders/:id`: Update order information
- `DELETE /orders/:id`: Delete an order

### Products
- `GET /products`: List all products (paginated)
- `GET /products/:id`: Get product details
- `POST /products`: Create a new product
- `PATCH /products/:id`: Update product information
- `DELETE /products/:id`: Delete a product

### Customers
- `GET /customers`: List all customers (paginated)
- `GET /customers/:id`: Get customer details
- `POST /customers`: Create a new customer
- `PATCH /customers/:id`: Update customer information
- `DELETE /customers/:id`: Delete a customer

Complete API documentation is available via Swagger at `/api/docs` when running the backend.

## 🧪 Testing and Quality

- **TypeScript**: Strict type-checking for reliable code
- **ESLint**: Code quality assurance
- **Automated Tests**: Unit and integration tests
- **Responsive Design**: Mobile-friendly interface

## 🔗 Deployment

The application can be deployed using various platforms:
- **Frontend**: Vercel, Netlify, or any static hosting
- **Backend & Database**: Vercel, Render, Railway, or any Node.js hosting with PostgreSQL support

A live demo is available at: [https://trendies-demo.vercel.app/](https://trendies-nu.vercel.app/)

## 📈 Future Enhancements

- Advanced analytics dashboard
- Multi-language support
- Payment integration
- Export functionality (CSV, PDF)
- Mobile application

## 📄 License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

Developed for Trendies Corporation by Omar. © 2025 Trendies.
