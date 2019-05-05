const express = require('express');
const connectDB = require('./config/db');

const app = express();

// connect to mongoDB
connectDB();

// req.body middleware
app.use(express.json({ extended: false }));

// test API
app.get('/', (req, res) => res.send('API is running'));

// Define routes

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
