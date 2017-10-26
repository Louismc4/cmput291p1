var express   = require('express'),
    router    = express.Router();

router.post('/logincustomer', function(request, response){
    var name = request.body.custloginname;
    var password = request.body.custloginpassword;
    
    if(typeof name == 'undefined' || name == '' || typeof password == 'undefined' || password == '') {
        request.flash('error', 'Please fill out both of the name and password fields!');
        response.redirect('/login');
        return;
    }
    
    console.log('Login Customer: ' + name);
    console.log('Login Customer Password: ' + password);
    response.redirect('/customer');
});

router.post('/loginagent', function(request, response){
    var name = request.body.agentloginname;
    var password = request.body.agentloginpassword;
    
    if(typeof name == 'undefined' || name == '' || typeof password == 'undefined' || password == '') {
        request.flash('error', 'Please fill out both of the name and password fields!');
        response.redirect('/login');
        return;
    }
    
    console.log('Login Agent: ' + name);
    console.log('Login Agent Password: ' + password);
    response.redirect('/agent');
});

module.exports = router;