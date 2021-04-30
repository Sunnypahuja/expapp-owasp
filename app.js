const helmet = require('helmet');
const express = require('express'),
  app = express(),
  mongoose = require('mongoose'),
  passport = require('passport'),
  bodyParser = require('body-parser'),
  LocalStrategy = require('passport-local'),
  passportLocalMongoose = require('passport-local-mongoose'),
  User = require('./models/user'),
  vote = require('./models/vote'),
  uservote = require('./models/uservotes'),
  mongoSanitize = require('express-mongo-sanitize'),
  rateLimit = require('express-rate-limit'),
  xss = require('xss-clean');
const { check, validationResult } = require('express-validator');
//Connecting database
mongoose.connect('mongodb://localhost/Voteapp');

const expSession = require('express-session')({
  secret: 'mysecret', //decode or encode session
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: true,
    maxAge: 1 * 60 * 1000, //10 minutes
  },
});

passport.serializeUser(User.serializeUser()); //session encoding
passport.deserializeUser(User.deserializeUser()); //session decoding
passport.use(new LocalStrategy(User.authenticate()));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(expSession);
app.use(express.static('public'));

//=======================
//      O W A S P
//=======================
//data sanitization against NoSQL injection Attacks
app.use(mongoSanitize());
const limit = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // ! hour of lock down
  message: 'Too many request',
});
//preventing DOS attacks - Body Parser
app.use(express.json({ limit: '10Kb' })); //Body limit is 10
//DAta sanitization agains XSS attack
app.use(xss());

//helmet to secure connection and data
app.use(helmet());
//=======================
//      R O U T E S
//=======================
app.get('/', limit, (req, res) => {
  res.render('login');
});
app.get('/userprofile', limit, (req, res) => {
  res.render('userprofile');
});
//Auth Routes
// app.get('/login', limit, (req, res) => {
//   res.render('login');
// });
app.get('/thankyou', limit, (req, res) => {
  res.render('thankyou');
});
app.get('/errorlogin', limit, (req, res) => {
  res.render('errorlogin');
});
app.get('/admin', limit, (req, res) => {
  res.render('admin');
});
app.get('/total_votes', limit, (req, res) => {
  res.render('total_votes');
});
app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/userprofile',
    failureRedirect: '/errorlogin',
  }),
  limit,
  function (req, res) {}
);
app.get('/register', limit, (req, res) => {
  res.render('register');
});
app.post('/process-vote',
  async (req, res) => {
    const postvote = new uservote({
      party: req.body.party
    })
    uservote.create(postvote).then(uservote => {
      res.send('Thank you for voting '  +  uservote.party );

    })
})
app.post(
  '/register',
  [
    check('phone')
      .isLength({ min: 10 })
      .withMessage('Please enter a valid phone'),
    check('email').isLength({ min: 1 }).withMessage('Please enter an email'),
    check('username')
      .isLength({ min: 1 })
      .withMessage('Please enter an username'),
    check('password')
      .isLength({ min: 5 })
      .withMessage('Password must be at least 5 chars long')
      .matches(/\d/)
      .withMessage('Password must contain a number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('Password must contain a special character'),
    check('firstname')
      .isLength({ min: 5 })
      .withMessage('Please enter your first name'),
    check('lastname')
      .isLength({ min: 5 })
      .withMessage('Please enter your Last name'),
    check('id')
      .isLength({ min: 5 })
      .withMessage('Please enter an Valid identification number'),
    check('dob')
      .isLength({ min: 1 })
      .withMessage('Please enter your date of birth'),
    check('city').isLength({ min: 2 }).withMessage('Please enter your city'),
    check('state').isLength({ min: 1 }).withMessage('Please enter your state'),
  ],
  limit,
  (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      User.register(
        new User({
          username: req.body.username,
          email: req.body.email,
          phone: req.body.phone,
          voterId: req.body.id
        }),
        req.body.password,
        function (err, user) {
          if (err) {
            console.log(err);
            res.render('register');
          }
          passport.authenticate('local')(req, res, function () {
            res.redirect('/');
          });
        }
      );
    } else {
      console.log(errors.array());
      res.render('register', {
        errors: errors.array(),
        data: req.body,
      });
    }
  }
  
);

// app.get('/votes', limit, (req, res) => {
//   res.render('votes');
// });

  // app.get('/votes', (req, res) => {
  //   console.log(req.body);
  // }),

  app.get(
    '/votes',
    ((req, res) => {
      vote.find()
        .then((vote) => {
          res.render('votes', {
            title: 'Listing votes',
            vote,
          });
        })
        .catch(() => {
          res.send('Sorry! Something went wrong.');
        });
    })
);
  
app.post('/vote', (req, res) => {
  console.log(req.body);
});

  app.use(function (req, res, next) {
    res.setHeader(
      'Content-Security-Policy',
      "script-src 'self' https://cdnjs.cloudflare.com"
    );
    next();
  });


app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

//Listen On Server
app.listen(process.env.PORT || 3000, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Server Started At Port 3000');
  }
});
