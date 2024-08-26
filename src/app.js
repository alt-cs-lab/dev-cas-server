const path = require('path')
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

// The application
const app = express();

// preconfigured options for sending HTML files
const sendFileOpts = {
  root: path.join(__dirname, '../pages'),
  dotfiles: 'deny',
  headers: {
    'x-timestamp': Date.now(),
    'x-sent': true
  }
}

// In-memory storage of tickets.  There is no expiration mechanism
const tickets = {}

// Use bodyparser to parse incoming forms
app.use(bodyParser.urlencoded({
  extended: false
}));

// Serve a login form 
app.get('/login', (req, res) => {
  res.sendFile('login.html', sendFileOpts)
});

// Process a submitted login form
app.post('/login', (req, res) => {
  console.log(req.body, req.query, req.query.service);
  // Ensure the password matches
  if(req.body.password !== "password") 
    return res.status(403).send("Invalid username/password combination");
  // Create a new ticket
  const ticket = crypto.randomUUID();
  // Save the ticket so it can be validated later 
  tickets[ticket] = req.body.username;
  // Redirect the user back to the service url
  const url = `${req.query.service}?ticket=${ticket}`;
  res.redirect(url);
});

// Log the user out.  Since we aren't maintaining sessions,
// this only displays a page letting the user know they were 
// logged out.
app.get('/logout', (req, res) => {
  res.sendFile('logout.html', sendFileOpts)
});

// Validate tickets.  If the ticket matches one in the memory store,
// we respond with a success.  A production CAS server should do a 
// more stringent security check.
app.get('/serviceValidate', (req, res) => {
  const ticket = req.query.ticket;
  const username = tickets[ticket];
  if(!username) res.send(
`<cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'>
  <cas:authenticationFailure code="INVALID_TICKET">
      ticket ${ticket} not recognized
  </cas:authenticationFailure>
</cas:serviceResponse>
`
  )
  else {
    // We need to fake a WID, and ideally have it be unqiue
    // We'll generate an integer hash of the username and  
    // use the first 8 digits
    var hash = 0, len = username.length;
    for (var i = 0; i < len; i++) {
      hash  = ((hash << 5) - hash) + username.charCodeAt(i);
      hash |= 0; // to 32bit integer
    }
    // WIDs are 9 digits, and start with an 8
    var wid = parseInt(hash.toString().slice(0,8), 10) + 800000000;
    res.send(
      `<cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'>
        <cas:authenticationSuccess>
            <cas:user>${username}</cas:user>
            <cas:ksuPersonWildcatID>${wid}</cas:ksuPersonWildcatID>
            <cas:proxyGrantingTicket>${ticket}</cas:proxyGrantingTicket>
        </cas:authenticationSuccess>
      </cas:serviceResponse>`);
  }
});

module.exports = app;