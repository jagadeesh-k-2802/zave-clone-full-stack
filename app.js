const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const errorHandler = require('./middlewares/error');
const notFound = require('./middlewares/404');

// Routes
const viewsRoutes = require('./routes/views');
const authRoutes = require('./routes/auth');
const preferencesRoutes = require('./routes/preferences');
const groupsRoutes = require('./routes/groups');

const app = express();
app.set('view engine', 'ejs');

// Middlewares
app.use(morgan('dev'));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', viewsRoutes);
app.use('/auth', authRoutes);
app.use('/preferences', preferencesRoutes);
app.use('/groups', groupsRoutes);

// ErrorHandler
app.use(errorHandler);

// 404
app.use('*', notFound);

module.exports = app;
