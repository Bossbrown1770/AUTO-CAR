const express = require('express');
const app = express();
const path = require('path');
const connectDB = require('./config/database');

// Connect to database
connectDB();

const session = require('express-session');
const MongoStore = require('connect-mongo');

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session middleware
app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/car-dealership' })
    })
);

// Serve static files from the 'public' directory
app.use(express.static(__dirname));

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payments', require('./routes/payments'));

// Define routes for each page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/inventory', (req, res) => {
    res.sendFile(path.join(__dirname, 'inventory.html'));
});

app.get('/details', (req, res) => {
    res.sendFile(path.join(__dirname, 'details.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/payment', (req, res) => {
    res.sendFile(path.join(__dirname, 'payment.html'));
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
