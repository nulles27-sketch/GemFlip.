const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const routes = require('./routes/routes.js');
const startup = require('./startup.js');

const app = express();
app.use(express.json());

// mount API routes under /api
app.use('/api', routes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);

// run any startup tasks that expect an io instance
if (startup && typeof startup.startup === 'function') {
  try { startup.startup(io); } catch (e) { console.warn('startup failed', e && e.message); }
}

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bloxyspin';

mongoose.connect(MONGO_URI, { maxPoolSize: 10 })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.warn('MongoDB connection failed:', err && err.message));

server.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});

module.exports = server;
