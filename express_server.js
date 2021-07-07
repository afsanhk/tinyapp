const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

// Helper Functions
// Generates random 6 length string
const generateRandomString = function() {
  let characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    randomString += characters[Math.floor(Math.random() * characters.length)];
  }
  return randomString; // Edge case: Improbably but this doesn't account for if string has already been generated for another URL.
};

// Check userDB for existingEmail (email as string, userDB)
const authenticateEmail = function (authEmail, userObj) {
  for (let key in userObj) {
    if (userObj.hasOwnProperty(key)) {
      if (authEmail === userObj[key]['email']) {
        return true;
      }
    }
  }
};

// "Databases" 
// URL Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Users Database
const users = {
  'userRandomID' : {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// GETS
// Home Page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Lists urls
app.get("/urls", (req, res) => {
 
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']]
  };
  
  res.render("urls_index", templateVars);
});

// Login page
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] };
  res.render("login", templateVars);
})

// Create new urls
app.get("/urls_new", (req,res) => {
  const templateVars = { user: users[req.cookies['user_id']] };
  res.render("urls_new", templateVars);
});

// Regustration page
app.get("/register", (req,res) => {
  const templateVars = { user: users[req.cookies['user_id']] };
  res.render("registration", templateVars);
});

// Shows corresponding long URL --> Make sure this is after urls_new.
app.get("/urls/:shortURL", (req,res) => {
  const templateVars = {
    shortURL : req.params.shortURL,
    longURL : urlDatabase[req.params.shortURL],
    user: users[req.cookies['user_id']]
  };

  res.render('urls_show', templateVars);
});

// Redirects short URL clicks to the long links
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// URLS JSON String -- Maybe delete at the end
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// POSTS
// Handles posts to /urls (for example: from /urls_new)
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const newShortURL = generateRandomString(); // Generates 6 char string
  urlDatabase[newShortURL] = req.body.longURL; // New key:value -- short:long
  
  res.redirect(`/urls/${newShortURL}`); // Redirects to /urls with the new string.
});

// Updates a URL resource; POST/urls/:id
app.post("/urls/:id", (req,res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.newLongURL;
  res.redirect(`/urls`); // Extra step to take user back to the URL list
});

// Deletes urls from the form on /urls
app.post("/urls/:shortURL/delete", (req,res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// Handles logins to the app, set a cookie and re-direct to /urls --> 
// Should be changed in the future
app.post("/login", (req,res) => {
  res.cookie('username',req.body.username);
  res.redirect('/urls');
});

// Handles logouts from the app, delets a cookie and re-direct to /urls
app.post("/logout", (req,res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// Handles registration form data
app.post("/register", (req,res) => {
  let randomID = generateRandomString();
  const inputEmail = req.body.email; // Assign to parameters for readability.
  const inputPassword = req.body.password;
  
  if(!inputEmail || !inputPassword) {
    res.statusCode = 400;
    res.send('Please ensure you have entered both an e-mail and password.')
  } else if (authenticateEmail(inputEmail,users)) {
    res.statusCode = 400;
    res.send(`${inputEmail} has already been used to register. Please use another e-mail address.`);
  } else {
    users[randomID] = {
      id: randomID,
      email: inputEmail,
      password: inputPassword
    };
    console.log(users);
    res.cookie('user_id', randomID);
    res.redirect('/urls');
  }
});


// 404 Error
app.get("*", (req,res) => {
  const templateVars = { user: users[req.cookies['user_id']] };
  res.statusCode = 404;
  res.render('404', templateVars);
});

app.post("*", (req,res) => {
  const templateVars = { user: users[req.cookies['user_id']] };
  res.statusCode = 404;
  res.render('404', templateVars);
});