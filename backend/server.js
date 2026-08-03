import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './src/config/db.js';

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📁 Uploads directory: ${process.cwd()}/uploads`);
  });
});
