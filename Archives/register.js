var express   = require('express'),
    router    = express.Router();

router.post('/registercustomer', function(request, response){
    var name = request.body.custregistername;
    var password = request.body.customerregisterpassword;
    
    if(typeof name == 'undefined' || name == '' || typeof password == 'undefined' || password == '') {
        request.flash('error', 'Please fill out both of the name and password fields!');
        response.redirect('/register');
        return;
    }
    
    console.log('Register Customer: ' + name);
    console.log('Register Customer Password: ' + password);
});

router.post('/registeragent', function(request, response){
    var name = request.body.agentregistername;
    var password = request.body.agentregisterpassword;
    
    if(typeof name == 'undefined' || name == '' || typeof password == 'undefined' || password == '') {
        request.flash('error', 'Please fill out both of the name and password fields!');
        response.redirect('/register');
        return;
    }
    
    console.log('Register Agent: ' + name);
    console.log('Register Agent Password: ' + password);
});

module.exports = router;