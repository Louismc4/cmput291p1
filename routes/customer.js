var express   = require('express'),
    router    = express.Router(),
    sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database('291.db');

var customerBaskbetDB = new sqlite3.Database(':memory:');

//Customer Page
router.get('/customer', function(request, response){
    response.render('../views/customer', {message : request.flash("error"), message: request.flash("success")});
});

//Search For Products
router.post('/customersearch', function(request, response){
    
});

//Place an order
router.post('/customerorder', function(request, response){
    
});

//List orders
router.post('/customerlist', function(request, response){
    
});

module.exports = router;