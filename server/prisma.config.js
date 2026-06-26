require('dotenv/config');
const { defineConfig, env } = require('prisma/config');

module.exports = defineConfig({
  schema: 'src/prisma/schema.prisma',
  migrations: {
    path: 'src/prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
