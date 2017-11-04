var express   = require('express'),
    router    = express.Router(),
    sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database('291.db');
    
//Reload page
router.get('/login', function(request, response){
    response.render('../views/login', {message : request.flash("error"), message: request.flash("success")}); 
});
    
//User clicks on register so we take all their fields: 
//a) Check for unique ID
//b) Insert the rest of the values - ***NOT DONE
router.post('/registercustomer', function(request, response){
    var id = request.body.custregisterid;
    var name = request.body.custregistername;
    var address = request.body.custregisteraddress;
    var password = request.body.customerregisterpassword;
    
    if(typeof name == 'undefined' || name == '' || typeof password == 'undefined' || password == '',
        typeof id == 'undefined' || id == '' || typeof address == 'undefined' || address == '') {
        request.flash('error', 'Please fill out all four fields!');
        response.redirect('/login');
        return;
    }
    
    db.serialize(function() {
        
        db.each("SELECT cid FROM customers", function(err, row) {
            if(id == row.cid){
                request.flash('error', 'ID is not unique!');
                response.redirect('/login');
                return;
            }
        });
        
        
    });
    
    db.close();
    
    console.log('Register Customer: ' + name);
    console.log('Register Customer: ' + id);
    console.log('Register Customer: ' + address);
    console.log('Register Customer Password: ' + password);
});    

//User clicks on register so we take all their fields: 
//a) Log in customer checking for id and password
router.post('/logincustomer', function(request, response){
    var id = request.body.custloginid;
    var password = request.body.custloginpassword;
    
    if(typeof id == 'undefined' || id == '' || typeof password == 'undefined' || password == '') {
        request.flash('error', 'Please fill out both of the name and password fields!');
        response.redirect('/login');
        return;
    }
    
    db.serialize(function() {
        
        var foundid = false;
        var foundpassword = false;
        
        db.each("SELECT cid FROM customers", function(err, row) {
            if (err) {
                request.flash('error', 'Customers ID query error ' + err);
                response.redirect('/login')
                return;
            }
            if(id == row.cid){
                foundid = true;
                return;
            }
        });
        
        db.each("SELECT pwd FROM customers", function(err, row) {
            if (err) {
                request.flash('error', 'Customers password query error ' + err);
                response.redirect('/login')
                return;
            }
            if(password == row.pwd && foundid){
                foundpassword = true;
                return;
            }
        });
        
        if(foundid && foundpassword){
            request.flash('success', 'Logged In Customer!');
            response.redirect('/customer');
        } else {
            request.flash('error', 'Incorrect Credentials!');
            response.redirect('/login');
        }
        
    });
    
    db.close();
    
    console.log('Login Customer ID: ' + id);
    console.log('Login Customer Password: ' + password);
});

//User clicks on register so we take all their fields: 
//a) Log in agent checking for an id and password match
router.post('/loginagent', function(request, response){
    var id = request.body.agentloginname;
    var password = request.body.agentloginpassword;
    
    if(typeof id == 'undefined' || id == '' || typeof password == 'undefined' || password == '') {
        request.flash('error', 'Please fill out both of the name and password fields!');
        response.redirect('/login');
        return;
    }
    
    db.serialize(function() {
        
        var foundid = false;
        var foundpassword = false;
        
        db.each("SELECT aid FROM agents", function(err, row) {
            if (err) {
                request.flash('error', 'Agent ID query error ' + err);
                response.redirect('/login')
                return;
            }
            if(id == row.aid){
                foundid = true;
                return;
            }
        });
        
        db.each("SELECT pwd FROM agents", function(err, row) {
            if (err) {
                request.flash('error', 'Agents password query error ' + err);
                response.redirect('/login')
                return;
            }
            if(password == row.pwd && foundid){
                foundpassword = true;
                return;
            }
        });
        
        if(foundid && foundpassword){
            request.flash('success', 'Logged In Agent!');
            response.redirect('/agent');
        } else {
            request.flash('error', 'Incorrect Credentials!');
            response.redirect('/login');
        }
        
    });
    
    db.close();
    
    console.log('Login Agent ID: ' + id);
    console.log('Login Agent Password: ' + password);
});

module.exports = router;