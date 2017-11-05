var express   = require('express'),
    router    = express.Router(),
    sqlite3 = require('sqlite3').verbose();

//Agent view page logic
router.get('/agent', function(request, response){
    response.render('../views/agent', {message : request.flash("error"), message: request.flash("success")});
});

//Set up a deliver
router.post('/agentsetupdelivery', function(request, response){
    
});

//Update a delivery
router.post('/updatedelivery', function(request, response){
    
});

//List orders
router.post('/agentaddtostock', function(request, response){
    
});

router.get('/agentlogout', function(request, response){
    db.close();
    request.flash('success', 'Agent Logged Out!');
    response.redirect('/');
});

module.exports = router;