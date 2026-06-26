const app = require('./app');
const prisma = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // اختبار الاتصال بقاعدة البيانات
    await prisma.$connect();
    console.log('Database connected successfully');

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error(' Database connection failed');
    console.error(error.message);
    
  }
}

startServer();
