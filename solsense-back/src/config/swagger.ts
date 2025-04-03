import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Solsense API',
      version: '1.0.0',
      description: 'API documentation for Solsense',
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
            id: { type: 'number' },
            wallet_address: { type: 'string' },
            timestamp: { type: 'string' },
            portfolio_data: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                wallet: { type: 'string' },
                summary: {
                  type: 'object',
                  properties: {
                    statuses: { type: 'object' },
                    positions: {
                      type: 'object',
                      properties: {
                        farm: { type: 'object' },
                        token: { type: 'object' },
                        lending: { type: 'object' },
                        liquidity: { type: 'object' }
                      }
                    },
                    staleJobs: { type: 'array', items: { type: 'string' } },
                    aggregated: {
                      type: 'object',
                      properties: {
                        netWorth: { type: 'number' },
                        nftValue: { type: 'number' },
                        defiValue: { type: 'number' },
                        tokenValue: { type: 'number' },
                        nftDefiValue: { type: 'number' },
                        estimated24hReward: { type: 'number' },
                        totalPendingReward: { type: 'number' }
                      }
                    }
                  }
                },
                positions: {
                  type: 'object',
                  properties: {
                    farm: { type: 'array' },
                    token: { type: 'object' },
                    lending: { type: 'object' },
                    liquidity: { type: 'object' }
                  }
                }
              }
            },
            tx_history: { type: 'object' },
            transaction_volume: { type: 'array', items: { type: 'number' } },
            profile_ratings: {
              type: 'object',
              properties: {
                whale: { type: 'number' },
                hodler: { type: 'number' },
                flipper: { type: 'number' },
                defi_user: { type: 'number' },
                experienced: { type: 'number' }
              }
            },
            earned_rewards: { type: 'number' },
            created_at: { type: 'string' }
          }
        },
        AdvertiserRegistration: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
            name: { type: 'string' },
            description: { type: 'string' }
          }
        },
        AdvertiserLogin: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' }
          }
        },
        AdvertiserResponse: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            description: { type: 'string' },
            ads: { type: 'array', items: { type: 'string' } },
            created_at: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options); 