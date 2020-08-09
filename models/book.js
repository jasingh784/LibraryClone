const mongoose = require("mongoose");


//book schema
const bookSchema = new mongoose.Schema({
    author: String,
    title: String,
    publisher: String,
    ISBN: Number,
    summary: String,
    image: String,
    quantity: Number
});

//create a model for the book schema
const Book = mongoose.model("Book", bookSchema);


module.exports = mongoose.model("Book", bookSchema);