const express = require('express');
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const { generateToken } = require("../utils/authUtils");


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;
  
  if ((!username || !password) 
    || (username && username === "")
    || (password && password === "")) {
    return res.status(400).json({message: "Username or Password is missing"});
  }

  const minPasswordLength = 6; // Min length
  if (password.length < minPasswordLength) {
    return res.status(400).json({ message: "Password is too weak" });
  }

  // Check if user already exists
  if (isValid(username)) {
    return res.status(400).json({ message: "User already exists" });
  }

  try {
    // Create a new user
    const userId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    users[username] = { id: userId, username, password, reviews: {} };
    // Generate JWT token
    const token = generateToken(users[username]);
    return res.status(201).json({ message: "User registered", token: token });
  } catch (error) {
    console.error("Error during user registration", error);
    return res.status(500).json({ message: 'Error during user registration' });
  }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  try {
    return res.status(200).json(books);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch books', details: err.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  try {
    const book = Object.values(books).find(book => book.isbn === req.params.isbn);
    book ? res.json(book) : res.status(404).json({ message: "Book not found" });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }  
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  try {
    const book = Object.values(books).find(book => book.author.toLowerCase().includes(req.params.author.toLowerCase()));
    book ? res.json(book) : res.status(404).json({ message: "Book not found" });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  try {
    const book = Object.values(books).find(book => book.title.toLowerCase().includes(req.params.title.toLowerCase()));
    book ? res.json(book) : res.status(404).json({ message: "Book not found" });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  try {
    const book = Object.values(books).find(book => book.isbn === req.params.isbn);
    if (book) {
      const reviews = book.reviews || [];      
      reviews.length ? res.json(reviews) : res.status(200).json({ message: "No Reviews found for the searched book"});
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Using axios
const API_URL = `http://localhost:${process.env.PORT}`;

public_users.get("/books", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving books", error: error.message });
  }
});

public_users.get("/books/isbn/:isbn", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/isbn/${req.params.isbn}`);
    res.json(response.data);
  } catch (error) {
    res.status(404).json({ message: "Book not found", error: error.message });
  }
});

public_users.get("/books/author/:author", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/author/${req.params.author}`);
    res.json(response.data);
  } catch (error) {
    res.status(404).json({ message: "No books found for this author", error: error.message });
  }
});

public_users.get("/books/title/:title", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/title/${req.params.title}`);
    res.json(response.data);
  } catch (error) {
    res.status(404).json({ message: "No books found for this title", error: error.message });
  }
});

module.exports.general = public_users;
