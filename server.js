// server.js

/*********************************************************************************
WEB322 – Assignment 04
I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
No part of this assignment has been copied manually or electronically from any other 
source (including 3rd party web sites) or distributed to other students.

Name: Jinwoo Park
Student ID: 180446239
Date: October 7, 2024
Render Web App URL: https://web322-app-ores.onrender.com
GitHub Repository URL: https://github.com/jinwoo1216/web322-app
********************************************************************************/

const express = require('express');
const path = require('path');
const storeService = require('./store-service');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require('express-handlebars');

// Initialize express app
const app = express();

// Set the port to process.env.PORT or default to 8080
const HTTP_PORT = process.env.PORT || 8080;

// Configure Handlebars as the view engine
const hbsHelpers = {
  navLink: function (url, options) {
    const isActive = app.locals.activeRoute === url;
    return `<li class="nav-item"><a class="nav-link ${
      isActive ? 'active' : ''
    }" href="${url}">${options.fn(this)}</a></li>`;
  },
};
app.engine('.hbs', exphbs.engine({ extname: '.hbs', helpers: hbsHelpers }));
app.set('view engine', '.hbs');

// Set up Cloudinary configuration
cloudinary.config({
  cloud_name: 'diytti8dx',
  api_key: '837181373364637',
  api_secret: 'Qe6JKyU3I95QUDKSS6_rxINiAyc',
  secure: true
});

const upload = multer(); // Initialize multer without disk storage

// Middleware to serve static files from the "public" folder
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to set active route
app.use((req, res, next) => {
  let route = req.path.substring(1);
  app.locals.activeRoute = `/${route}`;
  next();
});

// Route for the root URL ("/") to redirect to the "/about" page
app.get('/', (req, res) => {
  res.redirect('/about');
});

// Route to serve the about.html file from the "views" folder
app.get('/about', (req, res) => {
  res.render('about');
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
  
// Route for items (edited to use res.render)
app.get('/items', (req, res) => {
  // Check for the query parameters in the URL
  if (req.query.category) {
    // Call the getItemsByCategory function from store-service.js
    storeService.getItemsByCategory(req.query.category)
      .then((items) => res.render('items', { items }))
      .catch(() => res.render('items', { message: 'No items found for this category' }));
  } else if (req.query.minDate) {
    // Call the getItemsByMinDate function from store-service.js
    storeService.getItemsByMinDate(req.query.minDate)
      .then((items) => res.render('items', { items }))
      .catch(() => res.render('items', { message: 'No items found for this date range' }));
  } else {
    // Default behavior: get all items
    storeService.getAllItems()
      .then((items) => res.render('items', { items }))
      .catch(() => res.render('items', { message: 'No items found' }));
  }
});

// Route to fetch a single item by ID
app.get('/item/:id', (req, res) => {
  storeService.getItemById(req.params.id)
    .then((item) => res.render('item', { item }))
    .catch((err) => res.render('item', { message: 'Item not found' }));
});
  
  
// Route for categories (edited to use res.render)
app.get('/categories', (req, res) => {
  storeService.getCategories()
    .then((categories) => res.render('categories', { categories }))
    .catch(() => res.render('categories', { message: 'No categories found' }));
});
  

// Route to render the add item page addItems.hbs
app.get('/items/add', (req, res) => {
  res.render('addItem');
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