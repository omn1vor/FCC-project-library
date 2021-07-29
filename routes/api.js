/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const mongoose = require('mongoose');

let Book;

mongoose.set('useFindAndModify', false);
mongoose.connect(process.env['DB'], { useNewUrlParser: true, useUnifiedTopology: true });


const { Schema } = mongoose;
const bookSchema = new Schema({
  title: { type: String, required: true },
  comments: [String]
});

Book = mongoose.model('Book', bookSchema);


module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]

      Book.find({}, (err, data) => {
        if (err) return res.type('txt').send('could not get books from DB: ' + err);
        res.json(data.map(i => ({ _id: i._id, title: i.title, commentcount: i.comments.length })));
      });
    })
    
    .post(function (req, res){
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      
      if (!title) {
        return res.type('txt').send('missing required field title');
      }
      
      const newBook = new Book({
        title: title
      });
      
      newBook.save((err, data) => {
        if (err) return res.json({ error: err });        
        res.json(data);
      });
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      Book.deleteMany({}, (err, data) => {
        if (err) return res.type('txt').send('could not delete books: ' + err);
        if (!data.deletedCount) return res.type('txt').send('no books to delete');
        res.type('txt').send('complete delete successful');
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      
      Book.findById(bookid, (err, data) => {
        if (err) return res.type('txt').send('could not get books from DB: ' + err);
        if (!data) return res.type('txt').send('no book exists');        
        
        res.json(data);
      });
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get

      if (!comment) {
        return res.type('txt').send('missing required field comment');
      }  

      Book.findById(bookid, (err, data) => {
        if (err) return res.type('txt').send('could not get books from DB: ' + err);
        if (!data) return res.type('txt').send('no book exists');        
        
        data.comments.push(comment);
        data.save((err, data) => {
          if (err) return res.type('txt').send('could not save the comment: ' + err);
          res.json(data);
        })        
      });

    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'

      Book.deleteOne({ _id: bookid }, (err, data) => {
        if (err) return res.type('txt').send('could not delete the book: ' + err);
        if (!data.deletedCount) return res.type('txt').send('no book exists');
        res.type('txt').send('delete successful');
      });

    });
  
};
