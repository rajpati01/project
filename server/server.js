
const app = require('./app');
const connectDB = require('./config/database');


// Connect to database
connectDB();

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
    console.log(`🚀 EcoWise server running on port ${PORT}`);
 });


