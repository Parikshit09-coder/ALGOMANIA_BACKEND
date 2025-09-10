const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Team = require('./Schemas/Team');
const app = express();
app.use(express.urlencoded({ extended: true }));
const authentication = require('./Middleware/Authentication.js');


require('dotenv').config();
app.use(cors());
app.use(express.json());
app.use('/', require('./Routes/login'))
app.use('/admin',authentication("admin"),require('./Routes/admin.js'))
app.use('/team',authentication("user"),require('./Routes/Team.js'))

const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 4000;

mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(PORT, () => console.log("Server running on port 5000")))
  .catch(err => console.log(err));

