const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

// Generates random 6 length string
const generateRandomString = function () {
  let characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    randomString += characters[Math.floor(Math.random() * characters.length)];
  }
  return randomString; // Edge case: Improbably but this doesn't account for if string has already been generated for another URL.
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Home Page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Lists urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Create new urls
app.get("/urls_new", (req,res) => {
  res.render("urls_new");
});


// Handles posts to /urls (for example: from /urls_new)
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  
  const newShortURL = generateRandomString(); // Generates 6 char string
  urlDatabase[newShortURL] = req.body.longURL // New key:value -- short:long
  console.log(urlDatabase);

  res.redirect(`/urls/${newShortURL}`); // Redirects to /urls with the new string.
});

// Deletes urls from the form on /urls
app.post("/urls/:shortURL/delete", (req,res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
})

// Shows corresponding long URL --> Make sure this is after urls_new.
app.get("/urls/:shortURL", (req,res) => {
  const templateVars = { shortURL : req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render('urls_show', templateVars);
});

// Redirects short URL clicks to the long links
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// URLS JSON String
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

