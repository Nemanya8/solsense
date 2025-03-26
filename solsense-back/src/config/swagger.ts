import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Solsense API Documentation',
      version: '1.0.0',
      description: 'API documentation for Solsense Backend',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        PortfolioData: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'Unique identifier for the portfolio entry',
            },
            wallet_address: {
              type: 'string',
              description: 'Solana wallet address',
            },
            timestamp: {
              type: 'number',
              description: 'Unix timestamp of when the data was recorded',
            },
            portfolio_data: {
              type: 'object',
              description: 'Portfolio data from Step Finance',
            },
            tx_history: {
              type: 'object',
              description: 'Transaction history from Helius',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the record was created',
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            total: {
              type: 'number',
              description: 'Total number of records',
            },
            limit: {
              type: 'number',
              description: 'Number of records per page',
            },
            offset: {
              type: 'number',
              description: 'Number of records skipped',
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/PortfolioData',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options); 