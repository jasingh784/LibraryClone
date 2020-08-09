const bodyParser        = require("body-parser"),
    methodOverride      = require("method-override"),
    mongoose            = require("mongoose"),
    express             = require("express"),
    passport            = require("passport"),
    LocalStrategy       = require("passport-local"),
    User                = require("./models/user");

const app = express();

const PORT = 3000;

const Book = require("./models/book");
const user = require("./models/user");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Who controls the past controls the future. Who controls the present controls the past.",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//connect to database
// mongoose.connect("mongodb://localhost:27017/library_db", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })
// .then( () => console.log("Connected to DB!"))
// .catch( error => console.log(error.message));

mongoose.connect("mongodb+srv://dbAdmin:Singh775!@cluster0.m1kqa.mongodb.net/library_db?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then( () => console.log("Connected to DB!"))
.catch( error => console.log(error.message));




//add a book to the db
// Book.create({
//     author: "Orwell, George",
//     title: "1984",
//     publisher: "[Ashland, Or.] : Blackstone Audio, p2007",
//     ISBN: 9781433202469,
//     summary: `Portrays a terrifying vision of life in the future when a totalitarian government, considered a "Negative Utopia," watches over all citizens and directs all activities, becoming more powerful as time goes by.`,
//     image: "https://solomon.io/wp-content/uploads/2018/01/1984-Cover.png"

// }, (err, book) => {
//     if(err) {
//         console.log(err);
//     } else {
//         console.log("Book saved to db");
//         console.log(book);
//     }
// });

//routes
//index route
app.get("/books", (req, res) => {
    Book.find({}, (err, books) => {
        if(err) {
            console.log(err);
        } else {
            console.log("found books")
            res.render("index", {books: books});
        }
    })
    
});
//new route 
app.get("/books/new", (req, res) =>{
    res.render("new");
});

//show route
app.get("/books/:id", (req, res) => {
    console.log("inside show route");
    Book.findById(req.params.id, (err, foundBook) => {
        if(err) {
            res.redirect("/");
        } else {
            res.render("show", {book: foundBook});
        }
    })
    
});

//create route
app.post("/books", (req, res) => {
    //create book
    Book.create(req.body.book, (err, newBook)=> {
        if(err) {
            res.render("new");
        } else {
            res.redirect("/books");
        }
    });
});

//edit route
app.get("/books/:id/edit", (req, res) => {
    Book.findById(req.params.id, (err, foundBook) => {
        if(err) {
            res.redirect("/books");
        } else {
            res.render("edit", {book: foundBook});
        }
    });
});

app.get("/books/:id/checkout", (req, res) => {
    Book.findById(req.params.id, (err, foundBook) => {
        if(err) {
            res.redirect("/books");
        } else {
            res.render("checkout", {book: foundBook});
        }
    });
});


//update route
app.put("/books/:id", (req, res) => {
    Book.findByIdAndUpdate(req.params.id, req.body.book, (err, updatedBook) => {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/books/" + updatedBook._id);
        }
    });
}); 

//checkout

app.put("/books/:id/checkout", (req, res) => {
    //update the quantity field in the database to subtract 1 book being checkedout
    Book.findByIdAndUpdate(req.params.id, {$inc : {quantity: - 1} }, {new : true}, (err, updatedBook) => {
        if(err) {
            console.log(err);
        } else {
            //res.redirect("/books/" + updatedBook._id);
            User.findByIdAndUpdate( (err, foundUser) => {
                if(err) {
                    console.log(err);
                } else {
                    foundUser.books.push(updatedBook);
                    foundUser.save((err, data) => {
                        if(err) {
                            console.log(err);
                        } else {
                            console.log(data);
                        }
                    })
                }
            })
        }
    });
}); 

//delete route
app.delete("/books/:id", (req, res) => {
    //destroy the book in the database
    Book.findByIdAndRemove(req.params.id, (err) => {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/books");
        }
    })
});

//=======================
//AUTH
//=======================
//show register form
app.get("/register", (req, res) => {
    res.render("register");
});

//handle sign up logic
app.post("/register", (req, res) => {
    let newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, (err, user) => {
        if(err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, () => {
            res.redirect("/books");
        });
    });
});

//show login form
app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/books",
    failureRedirect: "/login"
}) ,(req, res) => {

});

//logout route
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/books");
});

app.listen(PORT, () => {
    console.log("Server is listening");
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    } 
    res.redirect("/login");
}