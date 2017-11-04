var express   = require('express'),
    router    = express.Router(),
    sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database('291.db');

//Main Page
router.get('/', function(request, response){
        response.render('../views/main', {message : request.flash("error"), message: request.flash("success")}); 
});

//Logout user
router.get('/logout', function(request, response){
    request.flash('success', 'Logged Out!');
    response.redirect('/');
});

module.exports = router;