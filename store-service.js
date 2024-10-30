const fs = require("fs");
const path = require("path");

let items = [];
let categories = {};

// Function to initialize the data by reading the JSON files
function initialize() {
  return new Promise((resolve, reject) => {
    // Read the items.json file
    fs.readFile(path.join(__dirname, "data", "items.json"), "utf8", (err, data) => {
      if (err) {
        reject("unable to read items.json");
        return;
      }

      // Parse the data and assign it to the items array
      items = JSON.parse(data);

      // Read the categories.json file
      fs.readFile(path.join(__dirname, "data", "categories.json"), "utf8", (err, data) => {
        if (err) {
          reject("unable to read categories.json");
          return;
        }

        // Parse the data and assign it to the categories array
        categories = JSON.parse(data);
        resolve();
      });
    });
  });
}

// Function to get all items
function getAllItems() {
  return new Promise((resolve, reject) => {
    if (items.length > 0) {
      resolve(items);
    } else {
      reject("no results returned");
    }
  });
}

// Function to get all published items
function getPublishedItems() {
  return new Promise((resolve, reject) => {
    const publishedItems = items.filter(item => item.published === true);
    if (publishedItems.length > 0) {
      resolve(publishedItems);
    } else {
      reject("no published items found");
    }
  });
}

// Function to get all categories
function getCategories() {
  return new Promise((resolve, reject) => {
    if (categories.length > 0) {
      resolve(categories);
    } else {
      reject("no categories found");
    }
  });
}

// Export the functions so they can be used in server.js
module.exports = {
  initialize,
  getAllItems,
  getPublishedItems,
  getCategories
};
