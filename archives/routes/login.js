var express   = require('express'),
    router    = express.Router(),
    sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database('291.db');
    

//------------------------------------------------>Login Logic

//Reload page
router.get('/login', function(request, response){
    response.render('../views/login', {message : request.flash("error"), message: request.flash("success")}); 
});
    
//User clicks on register so we take all their fields
//a) Check for unique id
//b) Insert customer data in
//c) Redirect to customer page if successful and close the database.
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
    
    console.log('-------');
    console.log('Register Customer: ' + name);
    console.log('Register Customer: ' + id);
    console.log('Register Customer: ' + address);
    console.log('Register Customer Password: ' + password);
    console.log('-------');
    
    db.serialize(function() {
        
        var isUnique = true;
        var hitError = false;
        
        db.each("SELECT cid FROM customers", function(err, row) {
            if(err){
                hitError = true;
                return;
            }
            
            if(id == row.cid){
                isUnique = false;
                return;
            }
            
        }, function(err, rows){
            if(hitError || err) {
                hitError = false;
                return;
            }
            if(!isUnique) {
                request.flash('error', 'ID is not unique!');
                response.redirect('/login');
            } else {
                
                var query = "INSERT INTO customers VALUES(\'" +  id + "\',\'" + name + "\',\'" + address +  "\',\'" + password +  "\');" ;
                
                db.run(query, function(err){
                    if(err) {
                        request.flash('error', "Customer Insert Values Error: " + err + "!");
                        response.redirect('/login');
                        return;
                    } else {
                        request.flash('success', 'Registration Successful!');
                        response.redirect('/customer');
                        // db.close();
                    }
                    isUnique = true;
                    console.log('Number of rows from query: ' + rows);
                });
            }
        });
    });
});    

//User clicks on register so we take all their fields: 
//a) Log in customer checking for id and password
//b) Log in customer checking for id and password if there's a match then close the database.
router.post('/logincustomer', function(request, response){
    
    var id = request.body.custloginid;
    var password = request.body.custloginpassword;
    
    if(typeof id == 'undefined' || id == '' || typeof password == 'undefined' || password == '') {
        request.flash('error', 'Please fill out both of the name and password fields!');
        response.redirect('/login');
        return;
    }
    
    console.log('-------');
    console.log('Login Customer ID: ' + id);
    console.log('Login Customer Password: ' + password);
    console.log('-------');
    
    db.serialize(function() {
        
        var foundMatch = false;
        var hitError = false;
        
        db.each("SELECT cid, pwd FROM customers", function(err, row) {
            if (err) {
                hitError = true;
                return;
            }
            console.log(row);
            if(id == row.cid && password == row.pwd){
                foundMatch = true;
                return;
            }
        }, function(err, rows){
            if(hitError || err){
                request.flash('error', 'Customers Query Error!');
                response.redirect('/login');
                hitError = false;
            } else if(foundMatch){
                request.flash('success', 'Customer Login Successful!');
                response.redirect('/customer/?cid=' + id);
                // db.close();
            } else {
                request.flash('error', 'Incorrect credentials or no such customer with that cid exists!');
                response.redirect('/login');
            }
            console.log('Number of rows from query: ' + rows);
        });
    });
});

//User clicks on register so we take all their fields: 
//a) Log in agent checking for an id and password match
//b) Log in agent checking for id and password if there's a match then close the database.
router.post('/loginagent', function(request, response){
    
    var id = request.body.agentloginname;
    var password = request.body.agentloginpassword;
    
    if(typeof id == 'undefined' || id == '' || typeof password == 'undefined' || password == '') {
        request.flash('error', 'Please fill out both of the name and password fields!');
        response.redirect('/login');
        return;
    }
    
    console.log('-------');
    console.log('Login Agent ID: ' + id);
    console.log('Login Agent Password: ' + password);
    console.log('-------');
    
    db.serialize(function() {
        
        var foundMatch = false;
        var hitError = false;
        
        db.each("SELECT aid, pwd FROM agents", function(err, row) {
            if (err) {
                hitError = true;
                return;
            }
            console.log(row);
            if(id == row.aid && password == row.pwd){
                foundMatch = true;
                return;
            }
        }, function(err, rows){
            if(hitError || err){
                request.flash('error', 'Agents Query Error!');
                response.redirect('/login');
                hitError = false;
            } else if(foundMatch){
                request.flash('success', 'Agent Login Successful!');
                response.redirect('/agent');
                // db.close();
            } else {
                request.flash('error', 'Incorrect credentials or no such agent with that aid exists!');
                response.redirect('/login');
            }
            console.log('Number of rows from query: ' + rows);
        });
        
    });
});

//------------------------------------------------------------->Customer Logic

var id;
//Customer Page
router.get('/customer', function(request, response){
    id = request.query.cid;
    console.log(id);
    if(id == "" || id == undefined){
        request.flash('error', 'You\'re not logged in!');
        response.redirect('/login');
    } else {
        db = new sqlite3.Database('291.db');
        response.render('../views/customer', {id : id, message : request.flash("error"), message: request.flash("success")});
    }
});

//Search For Products
router.post('/customersearch', function(request, response){
    db = new sqlite3.Database('291.db');
    var keywords = request.body.search_products_keywords;
    
    if(typeof keywords == 'undefined' || keywords == '') {
        request.flash('error', 'Please fill product search field!');
        response.redirect('/customer');
        return;
    }
    
    var keywords_Array = keywords.split(' ');
    var json_Dictionary = []; //Array of key value pairs
    
    for(var i = 0; i < keywords_Array.length; i++){
        json_Dictionary[keywords_Array[i]] = 0;
    }
    
    console.log(json_Dictionary);
    
    db.serialize(function() {
        
        var hitError = false;
        var query = "SELECT products.name FROM products, carries, stores WHERE products.pid = carries.pid AND carries.qty > 0 AND stores.sid = carries.sid;"
        
        db.run(query, function(err, row) {
            if (err) {
                hitError = true;
                return;
            }
            console.log(row);
            for(var i = 0; i < keywords_Array.length; i++){
                if(row.name.contains(json_Dictionary[keywords[i]])){
                    json_Dictionary[keywords[i]] = json_Dictionary[keywords[i]]++;
                }
            }
        }, function(err, rows){
            if(hitError || err){
                request.flash('error', 'Customer Search Query Error! ' + err);
                response.redirect('/customer');
                hitError = false;
            } else {
                console.log(json_Dictionary);
                response.send('lol');
                // response.send('');
            }
            console.log('Number of rows from query: ' + rows);
        });
    });
});

//Place an order
router.post('/customerorder', function(request, response){
    
});

//List orders
router.post('/customerlist', function(request, response){
    
});

router.get('/customerlogout', function(request, response){
    request.flash('success', 'Customer Logged Out!');
    response.redirect('/');
});

module.exports = router;