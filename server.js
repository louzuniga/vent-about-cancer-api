const express = require('express');
const connectDB = require('./config/db');

const app = express();

// connect to mongoDB
connectDB();

// req.body middleware
app.use(express.json({ extended: false }));

// test API
app.get('/', (req, res) => res.send('API is still running'));

// Define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/vents', require('./routes/api/vents'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
