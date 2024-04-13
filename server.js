const dotenv = require('dotenv');
const colors = require('colors');

const app = require('./app');
const connectDB = require('./config/db');

// Config
dotenv.config({ path: './config/config.env' });
const PORT = process.env.PORT || 3000;
connectDB();

const server = app.listen(PORT, () => {
  console.log(`Server Running On Port -> ${PORT}`.yellow.underline);
});

// ErrorHandler
process.on('unhandledRejection', reason => {
  console.log(`unhandledRejection ${reason}`.red);
  server.close(() => process.exit(1));
});
