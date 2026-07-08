import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL || 'postgresql://pricepulse:pricepulse_secret@localhost:5432/pricepulse?schema=public',
}));
