import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.argv[2] || 'devonsroberson24@yahoo.com';
  const password = process.argv[3] || 'Test123!';

  console.log(`Setting password for: ${email}`);

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.update({
    where: { email },
    data: { passwordHash: hash }
  });

  console.log('Password updated successfully for:', user.email);
  console.log('You can now sign in with:');
  console.log(`  Email: ${email}`);
  console.log(`  Password: ${password}`);
}

main()
  .catch(console.error)
  .finally(() => {
    pool.end();
    prisma.$disconnect();
  });
