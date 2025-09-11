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

require('dotenv').config();
const PORT = process.env.PORT || 4000;

const MONGO_URL = process.env.MONGO_URL;
mongoose.connect("mongodb+srv://gurudesai200513_db_user:IOdiQMZ16U7k4gvJ@cluster0.nomqvbf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})

