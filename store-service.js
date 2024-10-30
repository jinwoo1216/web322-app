const fs = require("fs");
const path = require("path");

let items = [];
let categories = [];

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

// Function to add a new item
function addItem(itemData) {
  return new Promise((resolve) => {
    itemData.published = itemData.published ? true : false;
    itemData.id = items.length + 1; // Simple ID assignment
    
    items.push(itemData); // Add the item to the items array
    resolve(itemData); // Resolve with the new item data
  });
}

// Export the functions for use in server.js
module.exports = {
  initialize,
  getAllItems,
  getPublishedItems,
  getCategories,
  addItem
};
