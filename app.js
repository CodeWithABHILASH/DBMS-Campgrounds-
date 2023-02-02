if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


const express = require('express')
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const Campground = require('./models/campground')
const Book = require('./models/book')


const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const { campgroundSchema } = require('./schemas');

mongoose.connect('mongodb://localhost:27017/camp', {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
    // useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)


app.get('/', (req, res) => {
    res.render('home')
});

app.get('/search', async (req, res) => {
    const campgrounds = await Campground.find({});
    result = [];
    for (let campground of campgrounds) {
        let location1 = campground.location.toLowerCase(); 
        let title1 = campground.title.toLowerCase();
        if ( title1.includes(req.query.location.toLocaleLowerCase()) || location1.includes(req.query.location.toLocaleLowerCase()))
            result.push(campground)
    }


    res.render('filter', result);

});

app.get('/history', async (req, res) => {
    const id =req.user._id;
    let books = await Book.find({userid:id});
    const camps=[];
   
    for(let book of books )
    {
        bid=book.campid;
        c = await Campground.findById(bid);
         camps.push({title:c.title,url:c.images[0].url});
    }
  res.render('history.ejs',{camps,books})

});


app.get('/lth', async (req, res) => {
    const campgrounds = await Campground.find({});
    arr = []
    result = [];
    for (let campground of campgrounds) {
        arr.push({ id: campground._id, price: campground.price });
        arr.sort((a, b) => {
            return a.price - b.price;
        })
    }
    for (let campground of arr) {
        const camp = await Campground.findById(campground.id);
        result.push(camp)
    }
    res.render('filter', result);

});
app.get('/htl', async (req, res) => {
    const campgrounds = await Campground.find({});
    arr = []
    result = [];
    for (let campground of campgrounds) {
        arr.push({ id: campground._id, price: campground.price });
        arr.sort((a, b) => {
            return b.price - a.price;
        })
    }
    for (let campground of arr) {
        const camp = await Campground.findById(campground.id);
        result.push(camp)
    }
    res.render('filter', result);

});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})



app.get('/get-room-data', async (req, resp) => {
    try {
      const details = await RoomBooked.find({});
      resp.send(details);
    } catch (error) {
      console.log(error);
    }
  });

  

app.listen(3000, () => {
    console.log('Serving on port 3000')
})

