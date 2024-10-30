// server.js

/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
No part of this assignment has been copied manually or electronically from any other 
source (including 3rd party web sites) or distributed to other students.

Name: Jinwoo Park
Student ID: 180446239
Date: October 7, 2024
Render Web App URL: https://web322-app-vljk.onrender.com
GitHub Repository URL: https://github.com/jinwoo1216/web322-app
********************************************************************************/

const express = require('express');
const path = require('path');
const storeService = require('./store-service');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Initialize express app
const app = express();

// Set the port to process.env.PORT or default to 8080
const HTTP_PORT = process.env.PORT || 8080;

// Set up Cloudinary configuration
cloudinary.config({
  cloud_name: 'web322-app',
  api_key: '837181373364637',
  api_secret: 'Qe6JKyU3I95QUDKSS6_rxINiAyc',
  secure: true
});

const upload = multer(); // Initialize multer without disk storage

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


// Route for shop (all published items)
app.get('/shop', (req, res) => {
    storeService.getPublishedItems()
      .then((items) => {
        res.json(items); // Send the published items as JSON
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  });
  
  // Route for items (all items)
  app.get('/items', (req, res) => {
    storeService.getAllItems()
      .then((items) => {
        res.json(items); // Send all items as JSON
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  });
  
  // Route for categories
  app.get('/categories', (req, res) => {
    storeService.getCategories()
      .then((categories) => {
        res.json(categories); // Send all categories as JSON
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  });

  // Route to serve addItem.html for adding a new item
  app.get('/items/add', (req, res) => {
   res.sendFile(path.join(__dirname, 'views', 'addItem.html'));
  });

  // Route for adding a new item with image upload
  app.post('/items/add', upload.single('featureImage'), (req, res) => {
    if (req.file) {
      // Function to upload the file stream to Cloudinary
      let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          let stream = cloudinary.uploader.upload_stream(
            (error, result) => {
              if (result) {
                resolve(result);
              } else {
                reject(error);
              }
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };
  
      // Async function to handle the upload
      async function upload(req) {
        let result = await streamUpload(req);
        console.log(result); // For debugging, shows the Cloudinary upload result
        return result;
      }
  
      // Upload the image and process the item
      upload(req).then((uploaded) => {
        processItem(uploaded.url);
      }).catch((err) => {
        res.status(500).send("Failed to upload image.");
      });
  
    } else {
      // No file uploaded; proceed with an empty image URL
      processItem("");
    }
  
    // Function to process the item data
    function processItem(imageUrl) {
      req.body.featureImage = imageUrl;
  
      // Use the new function in store-service to add the item
      storeService.addItem(req.body)
        .then((newItem) => {
          res.redirect('/items'); // Redirect to /items after adding new item
        })
        .catch((err) => {
          res.status(500).send("Error adding new item.");
        });
    }
  });  
  
  // Initialize the data from JSON files before starting the server
  storeService.initialize()
    .then(() => {
      app.listen(HTTP_PORT, () => {
        console.log(`Express http server listening on port ${HTTP_PORT}`);
      });
    })
    .catch((err) => {
      console.error("Unable to start server:", err);
    });