// server.js

/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
No part of this assignment has been copied manually or electronically from any other 
source (including 3rd party web sites) or distributed to other students.

Name: Jinwoo
Student ID: 180446239
Date: October 7, 2024
Cyclic Web App URL:
GitHub Repository URL:
********************************************************************************/

const express = require('express');
const path = require('path');

// Initialize express app
const app = express();

// Set the port to process.env.PORT or default to 8080
const HTTP_PORT = process.env.PORT || 8080;

// Middleware to serve static files from the "public" folder
app.use(express.static('public'));

// Route for the root URL ("/") to redirect to the "/about" page
app.get('/', (req, res) => {
  res.redirect('/about');
});

// Route to serve the about.html file from the "views" folder
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Set the server to listen on the specified port
app.listen(HTTP_PORT, () => {
  console.log(`Express http server listening on port ${HTTP_PORT}`);
});
