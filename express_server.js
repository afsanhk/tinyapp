// Requiring external functions, packages and modules
const {getUserID, generateRandomString, authenticateEmail, urlsForUser} = require('./helpers');
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const methodOverride = require('method-override');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

// override with POST having ?_method=DELETE or ?_method=PUT
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['someRandomKeyWooooo'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// "Databases"
// URL Database
const urlDatabase = {
  "b2xVn2" : {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK" : {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};

// Users Database
const users = {
  'userRandomID' : {
    id: 'userRandomID',
    email: 't@t.com',
    password: bcrypt.hashSync('123',10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "2@2.com",
    password: bcrypt.hashSync('2',10)
  }
};

// GETS
// Home Page
app.get("/", (req, res) => {
  
  const userID = req.session.user_id;
  
  if (userID) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// URL List
app.get("/urls", (req, res) => {
  
  const userID = req.session.user_id;
  
  if (userID) {
    const templateVars = {
      urls: urlsForUser(userID,urlDatabase),
      user: users[userID]
    };
    res.render("urls_index", templateVars);
  } else {
    const templateVars = { user: users[userID] };
    res.render('redirect_url.ejs', templateVars);
  }
});

// Login page
app.get("/login", (req, res) => {
  
  const userID = req.session.user_id;

  if (userID) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[userID] };
    res.render("login", templateVars);
  }
});

// Create new urls
app.get("/urls/new", (req,res) => {
  
  const userID = req.session.user_id;

  if (userID) {
    const templateVars = { user: users[userID] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// Registration page
app.get("/register", (req,res) => {
  
  const userID = req.session.user_id;

  if (userID) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[userID] };
    res.render("registration", templateVars);
  }
});

// Shows corresponding long URL -> Ensure this is always after urls/new
app.get("/urls/:shortURL", (req,res) => {
  
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  
  if (userID) { // Checks login
    if (urlDatabase[shortURL]) { // Checks if short URL exists
      const idUrls = urlsForUser(userID,urlDatabase);
      if (idUrls[shortURL]) { // Cheks if short url belongs to this user
        const templateVars = {
          shortURL,
          longURL : urlDatabase[req.params.shortURL]['longURL'],
          user: users[userID]
        };
        res.render('urls_show', templateVars);
      } else {
        res.send('You are not authorized to update or delete this URL.');
      }
    } else {
      res.send(`Error: This short URL does not exist.`);
    }
  } else {
    const templateVars = { user: users[userID] };
    res.render('redirect_url.ejs', templateVars);
  }
});

// Redirects short URL clicks to the long links
app.get("/u/:shortURL", (req, res) => {
 
  const shortURL = req.params.shortURL;

  if (urlDatabase[shortURL]) { // Check if short URL exists
    const longURL = urlDatabase[shortURL]['longURL'];
    res.redirect(longURL);
  } else {
    res.send(`Error: This short URL does not exist.`);
  }
});

// POSTS
// Handles posts to /urls (for example: from /urls_new)
app.post("/urls", (req, res) => {

  const userID = req.session.user_id;

  if (userID) { // Check login
    const newShortURL = generateRandomString(); // Generates 6 char string
    urlDatabase[newShortURL] = {longURL:'', userID};
    urlDatabase[newShortURL]['longURL'] = req.body.longURL; // New key:value -- short:long
    res.redirect(`/urls/${newShortURL}`); // Redirects to /urls with the new string.
  } else {
    const templateVars = { user: users[userID] };
    res.render('redirect_url.ejs', templateVars);
  }
});

// Handles logins to the app
app.post("/login", (req,res) => {
  
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;

  if (authenticateEmail(loginEmail,users)) { // Check e-mail
    const userID = getUserID(loginEmail, users);
    if (bcrypt.compareSync(loginPassword,users[userID]['password'])) { // Check hashed password
      req.session.user_id = userID;
      res.redirect('/urls');
    } else { // Password doesn't match
      res.status(403).send(`Password does not match the records for ${loginEmail}. Please try another password.`);
    }
  } else { // E-mail not found
    res.status(403).send(`${loginEmail} can not be found. Please register or try another e-mail.`);
  }
});

// Handles logouts from the app, delets a cookie and re-direct to /urls
app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect('/urls');
});

// Handles registration form data
app.post("/register", (req,res) => {

  const userID = generateRandomString();
  const inputEmail = req.body.email; // Assign to parameters for readability.
  const inputPassword = req.body.password;// Hashed password
  
  if (!inputEmail || !inputPassword) { // Empty strings
    res.status(400).send('Please ensure you have entered both an e-mail and password.');
  } else if (authenticateEmail(inputEmail,users)) { // Check if e-mail is present in users DB
    res.status(400).send(`${inputEmail} has already been used to register. Please use another e-mail address.`);
  } else { // Create a new entry in users DB
    users[userID] = {
      id: userID,
      email: inputEmail,
      password: bcrypt.hashSync(inputPassword,10)
    };
    req.session.user_id = userID;
    res.redirect('/urls');
  }
});

// PUTS
// Updates a URL resource in a collection; POST/urls/:id
app.put("/urls/:id", (req,res) => {

  const userID = req.session.user_id;
  const id = req.params.id;

  if (userID) { // Checks login
    if (urlDatabase[id]) { // Checks if short URL exists
      const idUrls = urlsForUser(userID,urlDatabase); // Returns object with short:long url pairs for user
      if (idUrls[id]) { // Checks if short URL exists for this user
        urlDatabase[id]['longURL'] = req.body.newLongURL;
        res.redirect('/urls');
      } else { // URL belongs to another account
        res.send('You are not authorized to update or delete this URL.');
      }
    } else { // URL not created
      res.send(`Error: This short URL does not exist.`);
    }
  } else { // Not logged in
    const templateVars = { user: users[userID] };
    res.render('redirect_url.ejs', templateVars);
  }
});

// DELETES
// Deletes urls from the form on /urls
app.delete("/urls/:shortURL/delete", (req,res) => {
  
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  
  if (userID) { // Checks login
    if (urlDatabase[shortURL]) { // Checks if short URL exists
      const idUrls = urlsForUser(userID,urlDatabase); // Returns object with short:long url pairs for user
      if (idUrls[shortURL]) { // Cheks if short url exists for this user
        delete urlDatabase[shortURL];
        res.redirect('/urls');
      } else { // URL belongs to another account
        res.send('You are not authorized to update or delete this URL.');
      }
    } else { // URL not created
      res.send(`Error: This short URL does not exist.`);
    }
  } else { // Not logged in
    const templateVars = { user: users[userID] };
    res.render('redirect_url.ejs', templateVars);
  }
});


// 404 Errors
app.get("*", (req,res) => {
  const userID = req.session.user_id;
  const templateVars = { user: users[userID] };
  res.status(404).render('404', templateVars);
});

app.post("*", (req,res) => {
  const userID = req.session.user_id;
  const templateVars = { user: users[userID] };
  res.status(404).render('404', templateVars);
});