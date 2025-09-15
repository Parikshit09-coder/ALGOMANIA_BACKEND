const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Team = require('./Schemas/Team');
const app = express();
app.use(express.urlencoded({ extended: true }));
const authentication = require('./Middleware/Authentication.js');


require('dotenv').config();
app.use(cors(
  {
    origin:"https://algomania3.duckdns.org",
        credentials: true, 
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
         allowedHeaders: ["Content-Type", "Authorization"], 
  }
)); 

app.use(express.json());
app.use('/', require('./Routes/login'))
app.use('/admin',authentication("admin"),require('./Routes/admin.js'))
app.use('/team',authentication("user"),require('./Routes/Team.js'))

require('dotenv').config();
const PORT = process.env.PORT || 5000;

const MONGO_URL = process.env.MONGO_URL;
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})

