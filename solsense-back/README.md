# Solsense Backend API

This is the backend API for Solsense, providing portfolio management and tracking functionality for Solana wallets.

## API Documentation

The API documentation is available through Swagger UI at `/api-docs` when the server is running. This provides an interactive interface to explore and test the API endpoints.

## API Endpoints

### Portfolios

#### Get Portfolio History
```http
GET /api/portfolios/:address
```

Retrieves the portfolio history for a specific wallet address.

**Parameters:**
- `address` (path parameter): The Solana wallet address
- `limit` (query parameter, optional): Number of records to return (default: 10)
- `offset` (query parameter, optional): Number of records to skip (default: 0)

**Response:**
```json
{
  "total": number,
  "limit": number,
  "offset": number,
  "data": [
    {
      "id": number,
      "wallet_address": string,
      "timestamp": number,
      "portfolio_data": object,
      "tx_history": object,
      "created_at": string
    }
  ]
}
```

#### Update Portfolio Data
```http
POST /api/portfolios/:address
```

Fetches and saves the latest portfolio data for a specific wallet address.

**Parameters:**
- `address` (path parameter): The Solana wallet address

**Response:**
```json
{
  "message": "Portfolio saved successfully",
  "data": {
    "id": number,
    "wallet_address": string,
    "timestamp": number,
    "portfolio_data": object,
    "tx_history": object,
    "created_at": string
  }
}
```

## Environment Variables

The following environment variables are required:

- `PORT`: Server port (default: 4000)
- `STEP_API_KEY`: API key for Step Finance
- `HELIUS_API_KEY`: API key for Helius RPC
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_HOST`: Database host
- `DB_NAME`: Database name
- `DB_PORT`: Database port (default: 5432)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env` file

3. Start the server:
```bash
npm start
```

4. Access the API documentation:
   - Open your browser and navigate to `http://localhost:4000/api-docs`
   - You can test the API endpoints directly from the Swagger UI interface

## Database Schema

The application uses PostgreSQL with the following main table:

### portfolios
- `id`: SERIAL PRIMARY KEY
- `wallet_address`: VARCHAR(255)
- `timestamp`: BIGINT
- `portfolio_data`: JSONB
- `tx_history`: JSONB
- `created_at`: TIMESTAMP WITH TIME ZONE 