const express = require('express');
const dotenv = require("dotenv").config();
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const authenticate = require("./middleware/authenticate.js");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.use("/customer", session({secret: process.env.JWT_SECRET_KEY, resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", authenticate);
 
app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(port,()=>console.log("Server is running"));
