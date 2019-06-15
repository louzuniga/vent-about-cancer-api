const express = require('express');
const connectDB = require('./config/db');
const API_ORIGIN = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.options('*', cors());

// connect to mongoDB
connectDB();

// req.body middleware
app.use(express.json({ extended: false }));

// Define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/vents', require('./routes/api/vents'));

// //Serve static assets in production
// if(process.env.NODE_ENV === 'production') {
//     // Set static folder
//     app.use(express.static('client/build'));

//     app.get('*', (req, res) => {
//         res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
//     });
// }

const PORT = process.env.API_ORIGIN || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
