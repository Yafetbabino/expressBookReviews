const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        if (!isValid(username)) {
            users.push({"username":username,"password":password});
            return res.status(200).json({message:`User ${username} registered`});
        }
        else {
            return res.status(400).json({message:`User ${username} already registered`});
        }
    }
    else {
        return res.status(404).json({message: "Must provide username and password"});
    }
});

function getBookList (){
    return  new Promise((resolve,reject) => {
    if(books != null){
        resolve(books)
    }
    else{
        reject ({
            "Error": "No Book Avaliable"})
    }
})}
// Get the book list available in the shop
public_users.get('/', function (req, res) {
    getBookList()    
    .then((bookList) => res.send(bookList));
});


function isbnInfo(isbn){
    return  new Promise((resolve,reject) => {
       
        if(books[isbn]){
            resolve(JSON.stringify(books[isbn]))
        }
        else{
            reject (new Error(`ISBN ${isbn} not found`))
        }
})}

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    let isbn = req.params.isbn
    isbn = parseInt(isbn)
    if (isNaN(isbn)){
        res.status(400).json({message: "Please enter a valid number" });
    }
    isbnInfo(isbn)
    .then((isbn) =>res.send(isbn))
    .catch(error => {
        res.status(500).json({ message: error.message });
    });
});


function getInfo() {
    return new Promise((resolve, reject) => {
        resolve(books);
    });
}


// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    //Write your code here
    const author = req.params.author;
    getInfo()
        .then((bookEntries) => Object.values(bookEntries))
        .then((books) => books.filter((book) => book.author === author))
        .then((filteredBooks) => res.send(filteredBooks));
});



// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    getInfo()
        .then((bookEntries) => Object.values(bookEntries))
        .then((books) => books.filter((book) => book.title === title))
        .then((filteredBooks) => res.send(filteredBooks));
});


function getByISBN(isbn) {
    return new Promise((resolve, reject) => {
        let isbnNum = parseInt(isbn);
        if (books[isbnNum]) {
            resolve(books[isbnNum]);
        } else {
            reject({status:404, message:`ISBN ${isbn} not found`});
        }
    })
}
//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    getByISBN(req.params.isbn)
        .then(
            result => res.send(result.reviews),
            error => res.status(error.status).json({ message: error.message })
        );
});

module.exports.general = public_users;
