var express   = require('express'),
    router    = express.Router(),
    sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database('291.db');

var cid = "";
var aid = "";

//Main Page
router.get('/', function(request, response){
    response.render('../views/main', {message : request.flash("error"), message: request.flash("success")}); 
});

//------------------------------------------------>Login Logic

//Login page
router.get('/login', function(request, response){
    response.render('../views/login', {message : request.flash("error"), message: request.flash("success")}); 
});
    
//User clicks on register so we take all their fields
//a) Check for unique id
//b) Insert customer data in
//c) Redirect to customer page if successful otherwise reload page with error
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
        
        db.each("SELECT cid FROM customers", function(err, row) {
            console.log(row);
            
            if(err){
                return;
            }
            
            if(id == row.cid){
                isUnique = false;
                return;
            }
            
        }, function(err, rows){
            if(err) {
                request.flash('error', "Customer Tables Query Error: " + err + "!");
                response.redirect('/login');
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
                        request.flash('success', 'Registration Successful! Login to proceed.');
                        response.redirect('/customer');
                    }
                    isUnique = true;
                });
            }
        });
    });
});    

//User clicks on login so we take all their fields: 
//a) Log in customer checking for cid and password 
//b) We redirect to the customer menu. Otherwise reload page with error.
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
        
        db.each("SELECT cid, pwd FROM customers", function(err, row) {
            console.log(row);
            
            if (err) {
                return;
            }
            
            if(id == row.cid && password == row.pwd){
                foundMatch = true;
                return;
            }
            
        }, function(err, rows){
            if(err){
                request.flash('error', 'Customers Table Query Error!');
                response.redirect('/login');
            } else if(foundMatch){
                request.flash('success', 'Customer Login Successful!');
                // Here we send the id of the customer to the customers page.
                // We need that to identify them when we list the orders.
                cid = id;
                response.redirect('/customer/?cid=' + id);
            } else {
                request.flash('error', 'Incorrect credentials or no such customer with that cid exists!');
                response.redirect('/login');
            }
        });
    });
});

//User clicks on login so we take all their fields: 
//a) Log in agent checking for aid and password 
//b) We redirect to the agent menu. Otherwise reload page with error.
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
        
        db.each("SELECT aid, pwd FROM agents", function(err, row) {
            console.log(row);
            
            if (err) {
                return;
            }
            
            if(id == row.aid && password == row.pwd){
                foundMatch = true;
                return;
            }
        }, function(err, rows){
            if(err){
                request.flash('error', 'Agents Table Query Error!');
                response.redirect('/login');
            } else if(foundMatch){
                request.flash('success', 'Agent Login Successful!');
                // Here we send the id of the agent to the agents page.
                aid = id;
                response.redirect('/agent/?aid=' + aid);
            } else {
                request.flash('error', 'Incorrect credentials or no such agent with that aid exists!');
                response.redirect('/login');
            }
        });
        
    });
});

//------------------------------------------------------------->Customer Logic

//Customer Page
router.get('/customer', function(request, response){
    cid = request.query.cid;
    console.log(cid);
    if(cid == "" || cid == undefined){
        request.flash('error', 'You\'re not logged in!');
        response.redirect('/login');
    } else {
        response.render('../views/customer', {cid : cid, message : request.flash("error"), message: request.flash("success")});
    }
});

//Search For Products
router.post('/customersearch', function(request, response){
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
                return;
            }
            console.log(row);
            for(var i = 0; i < keywords_Array.length; i++){
                if(row.name.contains(json_Dictionary[keywords[i]])){
                    json_Dictionary[keywords[i]] = json_Dictionary[keywords[i]]++;
                }
            }
        }, function(err, rows){
            if(err){
                request.flash('error', 'Customer Search Query Error! ' + err);
                response.redirect('/customer');
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

//------------------------------------------------------------->Agent Logic

//Agent view page logic
router.get('/agent', function(request, response){
    response.render('../views/agent', {message : request.flash("error"), message: request.flash("success")});
});

//Set up a delivery
router.post('/agentsetupdelivery', function(request, response){
    
});

//Update a delivery
router.post('/updatedelivery', function(request, response){
    
});

//List orders
router.post('/agentaddtostock', function(request, response){
    
});

//------------------------------------------------------------->Logout Logic

router.get('/logout', function(request, response){
    cid = "";
    aid = "";
    request.flash('success', 'Logged Out!');
    response.redirect('/');
});

//------------------------------------------------------------->Create Tables and Insert Values Logic

//Create Tables and Insert Values Page
router.get('/createandinsert', function(request, response){
    response.render('../views/createandinsert', {message : request.flash("error"), message: request.flash("success")});
});

//Create Table Statements for the database
router.post('/createtablesandinsertvalues', function(request, response){
    
    var array = request.body.querystring.split(';');
    
    //Since it's asynchronous serialize makes sure everything executes correctly.
    db.serialize(function(){
        
        //Split statements into an array by ';' and then execute each statement
        for(var i = 0; i < array.length-1; i++){
            console.log(i + ":" + array[i]);
            var count = 0;
            db.run(array[i], function(err){
                
                //If any errors, reload the page and display error message
                if(err) {
                    console.log(i + ":" + err);
                    stop(request, response, err);
                    return;
                }
                
                //Move to the next page when done all the statements via callback.
                count++;
                if(count == array.length-1){
                    moveOn(request, response);
                    return;
                }
            });
        }
    });
});

//Reload page error function
function stop(request, response, err){
    request.flash('error', 'Error In Creating Tables: ' + err);
    response.redirect('/createandinsert');
}

//Move onto the next page function
function moveOn(request, response){
    request.flash('success', 'Success In Creating Tables And Inserting Values!');
    response.redirect('/');
}

module.exports = router;