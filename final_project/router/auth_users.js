const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const { generateToken } = require("../utils/authUtils");

let users = [];

const isValid = (username)=>{ //returns boolean
  return users[username];
};

const authenticatedUser = (username,password)=>{ //returns boolean
  return users[username] && users[username].password === password
};

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;
  try {
    if (!users[username]) {
      return res.status(404).json({ message: "User not found" });
    } 
    const isUserValid = authenticatedUser(username, password);
    if (!isUserValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // Generate a JWT token on successful login
    const token = generateToken(users[username]);

    req.session.user = token; // Store user session
    res.status(200).json({ message: "Logged in successfully", user: username, token });
  } catch (error) {
    console.log("error in loginUser", error);
    res.status(500).json({ message: "Error logging in", error });
  }
});

// Add a book review
regd_users.post("/auth/review/:isbn", (req, res) => {
  try {
    const book = Object.values(books).find(book => book.isbn === req.params.isbn);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const {title, comments, rating} = req.body;
    const username = req.user.username;

    if (!title || !rating) {
      return res.status(400).json({message: "Provide a valid review title and rating for the book"});
    }

    // Initialize reviews array if not present
    if (!Array.isArray(book.reviews)) {
      book.reviews = [];
    }

    const reviewObject = {
      username: username,
      title,
      comments: comments || "",
      rating
    };

    const reviewIdx = book.reviews.findIndex(review => review.username === username);
    if (reviewIdx !== -1) {
      // if user already reviewed the book
      book.reviews[reviewIdx] = reviewObject;
      res.status(200).json({ message: "Review updated successfully", book: book });
    } else {
      book.reviews.push(reviewObject);
      res.status(200).json({ message: "Review added successfully", book: book});
    } 
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }  
});

// Delete a review by the user
// This method will delete all reviews by the user for a particular book
regd_users.delete("/auth/review/:isbn", (req, res) => {
  try {
    const book = Object.values(books).find(book => book.isbn === req.params.isbn);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    console.log("book", book);

    const username = req.user.username;
    if (book.reviews.findIndex(review => review.username === username) === -1) {
      return res.status(404).json({message: "No review by the user is found"});
    }

    book.reviews = book.reviews.filter(review => review.username !== username);
    res.json({ message: "Review by the user deleted successfully", book: book });
  } catch (err) {
    console.log("error deleting the review from the user", err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
