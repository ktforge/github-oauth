/*
 * Package Imports
 */

const path = require("path");
// loads the github client id and secret from .env
require("dotenv").config();
const express = require("express");
const partials = require("express-partials");
// keeps the user logged in between page loads
const session = require("express-session");
const passport = require("passport");
// .Strategy is the github login plugin passport uses
const GitHubStrategy = require("passport-github2").Strategy;

const app = express();

/*
 * Variable Declarations
 */

const PORT = 3000;
// read from .env so the secret never sits in the code
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

/*
 * Passport Configurations
 */

// these have to match the oauth app settings on github
passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      // github sends the user back here after they approve
      callbackURL: "http://localhost:3000/auth/github/callback",
    },
    // runs once github hands back the profile, no database here so just pass it along
    function (accessToken, refreshToken, profile, done) {
      return done(null, profile);
    },
  ),
);

// saves the whole github profile into the session
passport.serializeUser(function (user, done) {
  done(null, user);
});

// pulls the profile back out so it shows up as req.user
passport.deserializeUser(function (user, done) {
  done(null, user);
});

/*
 *  Express Project Setup
 */

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(partials());
app.use(express.json());
app.use(express.static(__dirname + "/public"));

// session has to be set up before passport.session() or logins won't stick
app.use(
  session({
    secret: "codecademy",
    resave: false,
    // no session gets saved until someone actually logs in
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

/*
 * Routes
 */

app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

// ensureAuthenticated runs first and sends logged out users to /login
app.get("/account", ensureAuthenticated, (req, res) => {
  res.render("account", { user: req.user });
});

app.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});

app.get("/logout", (req, res) => {
  // passport 0.4 lets logout run without a callback
  req.logout();
  res.redirect("/");
});

// sends the user to github to log in, scope "user" asks for their profile
app.get("/auth/github", passport.authenticate("github", { scope: ["user"] }));

// github redirects here with a code, passport trades it for a token and the profile
app.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    successRedirect: "/",
  }),
);

/*
 * Listener
 */

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

/*
 * ensureAuthenticated Callback Function
 */
// declared as a function so it's hoisted and works in the /account route above
function ensureAuthenticated(req, res, next) {
  // isAuthenticated() comes from passport and checks the session
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
