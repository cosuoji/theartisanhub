// utils/swagger.js
import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Artisan Directory API',
      version: '1.0.0',
      description: 'API documentation for your Artisan directory project',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://your-production-url.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
        },
      },
    },
    security: [{ cookieAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication and verification' },
      { name: 'Users', description: 'User profile management' },
      { name: 'Artisans', description: 'Public artisan directory' },
      { name: 'Admin', description: 'Admin dashboard and controls' },
      { name: 'Jobs', description: 'Job booking & workflow' },
      { name: 'Reviews', description: 'Reviewing artisans' },
      { name: 'Categories', description: 'Artisan skill categories' },
      { name: 'Locations', description: 'Artisan locations by city' },
      { name: 'Uploads', description: 'File uploads (e.g. avatar)' }
    ],
  },
  apis: ['./routes/*.js', './models/*.js'], // 📌 Scans JSDoc comments
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
