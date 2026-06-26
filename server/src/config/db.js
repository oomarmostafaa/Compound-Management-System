const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(/^["']|["']$/g, '')
});

const adapter = new PrismaPg(pool);

module.exports = new PrismaClient({
  adapter
});