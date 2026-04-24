require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// 1. สร้าง Pool สำหรับการเชื่อมต่อ
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. สร้าง Adapter
const adapter = new PrismaPg(pool);

// 3. ส่ง Adapter ให้ PrismaClient (มาตรฐาน Prisma 7)
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
