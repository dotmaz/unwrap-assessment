// Library Management API - Unwrap.AI Technical Assessment
// Author: Mazin Abubeker

import { existsSync, readFileSync, writeFileSync } from 'fs';
const express = require("express");
const cors = require("cors");

const PORT = 3000;
const DB_PATH = './db.json';
const BLANK_DB = {
    customers: [],
    books: [],
    checkouts: []
}

const app = express();
app.use(express.json());
app.use(cors());


/* ----- DB Helper Functions ----- */

function initializeDB() {
    if (!existsSync(DB_PATH)) {
        writeFileSync(DB_PATH, JSON.stringify(BLANK_DB));
    }
}

function readDB(): any {
    return JSON.parse(readFileSync(DB_PATH, 'utf-8'));
}

function writeDB(data: any): void {
    writeFileSync(DB_PATH, JSON.stringify(data));
}

// Create DB if it doesn't exist yet
initializeDB()

/* ----- Types & Classes ----- */

// Used for graceful errors to include an error code
class ApiError extends Error {
    code: number;
    constructor(code: number, message: string) {
        super(message);
        this.code = code;
    }
}

interface Book {
    title: string;
    author: string;
    isbn: string;
    copies: number;
    available_copies?: number
}

interface Customer {
    name: string;
    email: string;
    customer_id: string;
}

interface Checkout {
    isbn: string;
    due_date: string;
    title?: string;
    author?: string;
    checkout_date?: string;
    checkout_id?: string;
    customer_id?: string;
}

/* ----- Book Helper Functions ----- */

// Check validity of a book
// Must contain: title (string), author (string), isbn (string), and copies (int)
function isValidBook(book: any): boolean {
    return (
        typeof book.title === 'string' &&
        typeof book.author === 'string' &&
        typeof book.isbn === 'string' &&
        typeof book.copies === 'number' &&
        Number.isInteger(book.copies)
    );
}

// Add a valid book to the library
function addBook(newBook: Book): Book {
    const db = readDB();
    const existingBook = db.books.find((book: Book)=>book.isbn === newBook.isbn);

    if(existingBook){
        // Check for existing books with inconsistency in title/author
        if(existingBook.title !== newBook.title || existingBook.author !== newBook.author){
            throw new ApiError(400, "ISBN already exists with a different title/author.");
        }else{
            existingBook.copies += newBook.copies;
            existingBook.available_copies += newBook.copies;
            writeDB(db);
            return existingBook;
        }
    }else{
        newBook.available_copies = newBook.copies;
        db.books.push(newBook);
        writeDB(db);
        return newBook;
    }
}

/* ----- Customer Helper Functions ----- */

// Check validity of a customer
// Must contain: name (string), email (string), customer_id (string)
function isValidCustomer(customer: any): boolean {
    return (
        typeof customer.name === 'string' &&
        typeof customer.email === 'string' &&
        typeof customer.customer_id === 'string'
    );
}

// Add a valid customer to the library
function addCustomer(newCustomer: Customer): Customer {
    const db = readDB();
    const existingCustomer = db.customers.find((customer: Customer)=>customer.customer_id === newCustomer.customer_id);

    if(existingCustomer){
        // Check for existing customers with an identical ID
        throw new ApiError(400, "Customer with provided ID already exists.");
    }else{
        db.customers.push(newCustomer);
        writeDB(db);
        return newCustomer;
    }
}

/* ----- Checkout Helper Functions ----- */

// Check validity of a new checkout
// Must contain: isbn (string), customer_id (string), due_date (string)
function isValidCheckout(checkout: any): boolean {
    return (
        typeof checkout.isbn === 'string' &&
        typeof checkout.customer_id === 'string' &&
        typeof checkout.due_date === 'string'
    );
}

// Checkout a book
function checkoutBook(newCheckout: Checkout): Checkout {
    const db = readDB();
    const foundCustomer: Customer = db.customers.find((customer: Customer)=>customer.customer_id === newCheckout.customer_id);
    if(!foundCustomer){
        throw new ApiError(404, "No customer could be found with provided customer_id.")
    }

    const foundBook: Book = db.books.find((book: Book)=>book.isbn === newCheckout.isbn);
    if(!foundBook){
        throw new ApiError(404, "No book could be found with the provided ISBN.");
    }
    if(!foundBook.available_copies || foundBook.available_copies <= 0){
        // There should never be less than 0 copies available; it is checked anyways for graceful degredation
        throw new ApiError(400, "There are currently no available copies of this book.");
    }

    const foundCustomerCheckouts: Checkout[] = db.checkouts.filter((checkout: Checkout)=>checkout.customer_id === foundCustomer.customer_id);
    if(foundCustomerCheckouts.length >= 5){
        // A customer should never have more than 5 copies checked out; it is checked anyways for graceful degredation
        throw new ApiError(400, "This customer has already checked out 5 or more books.");
    }

    foundBook.available_copies--;

    // Fill in all other checkout information; include title/author for ease of access through Checkout API
    newCheckout.title = foundBook.title;
    newCheckout.author = foundBook.author;
    newCheckout.checkout_id = generateCheckoutId();
    newCheckout.checkout_date = todayAsFormattedDate();
    db.checkouts.push(newCheckout);
    writeDB(db);

    return newCheckout;
}

// Generate a checkout ID in a stateless manner
function generateCheckoutId(): string {
    const db = readDB();
    let newId: string = "";
    do {
        let newIdNumber = Math.floor(10000 + Math.random() * 90000); // 10000 -> 99999
        newId = `CKO${newIdNumber}`;
    } while (db.checkouts.find((checkout: Checkout)=>checkout.checkout_id === newId))
    return newId;
}

// Return todays date in the following format: YYYY-MM-DD. Always in UTC.
function todayAsFormattedDate(): string {
    return new Date().toISOString().slice(0, 10);
}

/* ----- Return Helper Functions ----- */

// Check validity of a return
// Must contain: isbn (string), customer_id (string)
function isValidReturn(ret: any): boolean {
    return (
        typeof ret.isbn === 'string' &&
        typeof ret.customer_id === 'string'
    );
}

// Return a book
function returnBook(isbn: string, customer_id: string): any {
    const db = readDB();

    const foundCustomer: Customer = db.customers.find((customer: Customer)=>customer.customer_id === customer_id);
    if(!foundCustomer){
        throw new ApiError(404, "No customer could be found with provided customer_id.")
    }

    const foundBook: Book = db.books.find((book: Book)=>book.isbn === isbn);
    if(!foundBook){
        throw new ApiError(404, "No book could be found with the provided ISBN.");
    }

    const foundMatchingCustomerCheckouts: Checkout[] = db.checkouts.filter((checkout: Checkout)=>{
        return checkout.customer_id === customer_id && checkout.isbn === isbn
    });

    if(foundMatchingCustomerCheckouts.length === 0){
        throw new ApiError(400, "This customer has no checked out books with the provided ISBN.");
    }else{
        const deleteIndex = db.checkouts.find((checkout: Checkout)=>{
            return checkout.customer_id === customer_id && checkout.isbn === isbn
        });
        if(deleteIndex !== -1){
            db.checkouts.splice(deleteIndex, 1);
        }
        if(foundBook.available_copies !== undefined){
            foundBook.available_copies++;
        }
        writeDB(db);
        return {
            message: "Book returned successfully",
            isbn,
            customer_id,
            return_date: todayAsFormattedDate()
        };
    }
}

/* ----- Express API Setup ----- */

// Start server
app.listen(PORT, ()=>{
    console.log(`Library management API started on port ${PORT}.`)
});

// Get a book's details
// GET /api/books/:isbn
app.get('/api/books/:isbn', (req: any, res: any)=>{
    const {isbn} = req.params;
    const db = readDB()
    const foundBook: Book = db.books.find((book: Book)=>book.isbn === isbn);
    if(foundBook){
        return res.status(200).json(foundBook)
    }else{
        return res.status(404).json({
            message: "No book could be found with the provided ISBN."
        })
    }
});

// Create a book
// POST /api/books/
app.post('/api/books', (req: any, res: any)=>{
    if(req.body && isValidBook(req.body)){
        try {
            const {title, author, isbn, copies} = req.body; // Ignore any extra properties passed in req.body
            const newBook: Book = {title, author, isbn, copies};
            const addedBook: Book = addBook(newBook);
            return res.status(201).json(addedBook);
        }catch(err: any){
            return res.status(err.code || 400).json({
                message: err.message
            });
        }
    }else{
        return res.status(400).json({
            message: "Invalid book format. Must include: title (string), author (string), isbn (string), copies (integer)"
        })
    }
});

// Get a customer's details
// GET /api/customers/:customer_id
app.get('/api/customers/:customer_id', (req: any, res: any)=>{
    const {customer_id} = req.params;
    const db = readDB()
    const foundCustomer: Customer = db.customers.find((customer: Customer)=>customer.customer_id === customer_id);
    if(foundCustomer){
        return res.status(200).json(foundCustomer)
    }else{
        return res.status(404).json({
            message: "No customer could be found with the provided customer_id."
        })
    }
});

// Create a customer
// POST /api/customers
app.post('/api/customers', (req: any, res: any)=>{
    if(req.body && isValidCustomer(req.body)){
        try {
            const {name, email, customer_id} = req.body; // Ignore any extra properties passed in req.body
            const newCustomer: Customer = {name, email, customer_id};
            const addedCustomer: Customer = addCustomer(newCustomer);
            return res.status(201).json(addedCustomer);
        }catch(err: any){
            return res.status(err.code || 400).json({
                message: err.message
            });
        }
    }else{
        return res.status(400).json({
            message: "Invalid customer format. Must include: name (string), email (string), customer_id (string)"
        })
    }
});

// Get a customer's checked out books
// GET /api/customers/:customer_id/books
app.get('/api/customers/:customer_id/books', (req: any, res: any)=>{
    const {customer_id} = req.params;
    const db = readDB()
    const foundCustomer: Customer = db.customers.find((customer: Customer)=>customer.customer_id === customer_id);
    if(foundCustomer){
        const foundCustomerCheckouts = db.checkouts.filter((checkout: Checkout)=>checkout.customer_id === foundCustomer.customer_id);
        foundCustomerCheckouts.forEach((checkout: Checkout)=>{ // Delete customer_id and checkout_id from checkouts response to match API spec
            delete checkout.customer_id;
            delete checkout.checkout_id;
        })
        return res.status(200).json(foundCustomerCheckouts)
    }else{
        return res.status(404).json({
            message: "No customer could be found with the provided customer_id."
        })
    }
});

// Checkout a book
// POST /api/checkouts
app.post('/api/checkouts', (req: any, res: any)=>{
    if(req.body && isValidCheckout(req.body)){
        try {
            const {isbn, customer_id, due_date} = req.body; // Ignore any extra properties passed in req.body
            const newCheckout: Checkout = {isbn, customer_id, due_date};
            const addedCheckout: Checkout = checkoutBook(newCheckout);
            delete addedCheckout.author; // Delete author from checkout response to match API spec
            return res.status(201).json(addedCheckout);
        }catch(err: any){
            return res.status(err.code || 400).json({
                message: err.message
            });
        }
    }else{
        return res.status(400).json({
            message: "Invalid checkout format. Must include: isbn (string), customer_id (string), due_date (string)"
        })
    }
});

// Return a book
// POST /api/returns
app.post('/api/returns', (req: any, res: any)=>{
    if(req.body && isValidReturn(req.body)){
        try {
            const {isbn, customer_id} = req.body; // Ignore any extra properties passed in req.body
            const newReturn = returnBook(isbn, customer_id);
            return res.status(200).json(newReturn);
        }catch(err: any){
            return res.status(err.code || 400).json({
                message: err.message
            });
        }
    }else{
        return res.status(400).json({
            message: "Invalid return format. Must include: isbn (string), customer_id (string)"
        })
    }
});

// Reset system
// POST /api/reset
app.post('/api/reset', (req: any, res: any)=>{
    try{
        writeDB(BLANK_DB)
        return res.status(200).json({
            message: "System reset successful"
        })
    }catch(err: any){
        return res.status(400).json({
            message: err.message
        })
    }
});