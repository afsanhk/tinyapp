const {getUserID} = require('./helpers')
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

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
const authenticateEmail = function(authEmail, userObj) {
  for (let key in userObj) {
    if (userObj.hasOwnProperty(key)) {
      if (authEmail === userObj[key]['email']) {
        return true;
      }
    }
  }
};


// Returns URLs for userID
const urlsForUser = function(id) {
  let output = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key]['userID'] === id) {
      output[key] = urlDatabase[key]['longURL'];
    }
  }
  return output;
};

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
  if (req.session.user_id) {
    const templateVars = {
      urls: urlsForUser(req.session.user_id),
      user: users[req.session.user_id]
    };
    res.render("urls_index", templateVars);
  } else {
    const templateVars = { user: users[req.session.user_id] };
    res.render('redirect_url.ejs', templateVars);
  }
  
});

// Login page
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render("login", templateVars);
});

// Create new urls
app.get("/urls_new", (req,res) => {
  if (req.session.user_id) {
    const templateVars = { user: users[req.session.user_id] };
    res.render("urls_new", templateVars);
  } else {
    const templateVars = { user: users[req.session.user_id] };
    res.render("redirect_url.ejs", templateVars);
  }
});

// Registration page
app.get("/register", (req,res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render("registration", templateVars);
});

// Shows corresponding long URL --> Make sure this is after urls_new.
// Change so only person who is logged in can see this?
app.get("/urls/:shortURL", (req,res) => {
  
  const userID = req.session.user_id;
  let shortURL = req.params.shortURL;
  
  if (userID) { // Checks login
    if (urlDatabase[shortURL]) { // Checks if short URL exists
      const idUrls = urlsForUser(userID);
      if (idUrls[shortURL]) { // Cheks if short url exists for this user
        const templateVars = {
          shortURL : req.params.shortURL,
          longURL : urlDatabase[req.params.shortURL]['longURL'],
          user: users[req.session.user_id]
        };
      
        res.render('urls_show', templateVars);
      } else {
        res.send('You are not authorized to update or delete this URL.');
      }
    } else {
      res.send(`Error: This short URL does not exist.`);
    }
  } else {
    const templateVars = { user: users[req.session.user_id] };
    res.render('redirect_url.ejs', templateVars);
  }

});

// Redirects short URL clicks to the long links
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL]['longURL'];
    res.redirect(longURL);
  } else {
    res.send(`Error: This short URL does not exist.`);
  }
  
});

// URLS JSON String -- Maybe delete at the end
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// POSTS
// Handles posts to /urls (for example: from /urls_new)
app.post("/urls", (req, res) => {
  
  if (req.session.user_id) {
    console.log(req.body);  // Log the POST request body to the console
    const newShortURL = generateRandomString(); // Generates 6 char string
    urlDatabase[newShortURL] = {longURL:'', userID: req.session.user_id};
    urlDatabase[newShortURL]['longURL'] = req.body.longURL; // New key:value -- short:long
    res.redirect(`/urls/${newShortURL}`); // Redirects to /urls with the new string.
  } else {
    const templateVars = { user: users[req.session.user_id] };
    res.render('redirect_url.ejs', templateVars);
  }
  
});

// Updates a URL resource; POST/urls/:id
app.post("/urls/:id", (req,res) => {

  const userID = req.session.user_id;
  const id = req.params.id;

  if (userID) { // Checks login
    if (urlDatabase[id]) { // Checks if short URL exists
      const idUrls = urlsForUser(userID);
      if (idUrls[id]) { // Checks if short URL exists for this user
        urlDatabase[id]['longURL'] = req.body.newLongURL;
        res.redirect('/urls');
      } else {
        res.send('You are not authorized to update or delete this URL.');
      }
    } else {
      res.send(`Error: This short URL does not exist.`);
    }
  } else {
    const templateVars = { user: users[req.session.user_id] };
    res.render('redirect_url.ejs', templateVars);
  }
  
});

// Deletes urls from the form on /urls
app.post("/urls/:shortURL/delete", (req,res) => {
  const userID = req.session.user_id;
  let shortURL = req.params.shortURL;
  
  if (userID) { // Checks login
    if (urlDatabase[shortURL]) { // Checks if short URL exists
      const idUrls = urlsForUser(userID);
      if (idUrls[shortURL]) { // Cheks if short url exists for this user
        delete urlDatabase[shortURL];
        res.redirect('/urls');
      } else {
        res.send('You are not authorized to update or delete this URL.');
      }
    } else {
      res.send(`Error: This short URL does not exist.`);
    }
  } else {
    const templateVars = { user: users[req.session.user_id] };
    res.render('redirect_url.ejs', templateVars);
  }
    
});

// Handles logins to the app
app.post("/login", (req,res) => {
  let loginEmail = req.body.email;
  let loginPassword = req.body.password;

  if (authenticateEmail(loginEmail,users)) {
    const userID = getUserID(loginEmail, users);
    if (bcrypt.compareSync(loginPassword,users[userID]['password'])) { //compares hashed password on the left to already hashed password on right
      req.session.user_id = userID;
      res.redirect('/urls');
    } else {
      res.statusCode = 403;
      res.send(`Password does not match the records for ${loginEmail}. Please try another password.`);
    }
  } else {
    res.statusCode = 403;
    res.send(`${loginEmail} can not be found. Please register or try another e-mail.`);
  }
  
});

// Handles logouts from the app, delets a cookie and re-direct to /urls
app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect('/urls');
});

// Handles registration form data
app.post("/register", (req,res) => {
  let randomID = generateRandomString();
  const inputEmail = req.body.email; // Assign to parameters for readability.
  const inputPassword = req.body.password;// Hashed password
  
  if (!inputEmail || !inputPassword) {
    res.statusCode = 400;
    res.send('Please ensure you have entered both an e-mail and password.');
  } else if (authenticateEmail(inputEmail,users)) {
    res.statusCode = 400;
    res.send(`${inputEmail} has already been used to register. Please use another e-mail address.`);
  } else {
    users[randomID] = {
      id: randomID,
      email: inputEmail,
      password: bcrypt.hashSync(inputPassword,10)
    };
    
    req.session.user_id = randomID;
    res.redirect('/urls');
  }
});


// 404 Error
app.get("*", (req,res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.status(404).render('404', templateVars);
});

app.post("*", (req,res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.status(404).render('404', templateVars);
});