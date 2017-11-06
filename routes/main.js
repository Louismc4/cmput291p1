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
                        response.redirect('/login');
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
                
                var dropTableQuery = "drop table if exists basket;";
    
                var createTableQuery = "create table basket (" +
                "pid           char(6)," +
                "qty            int," + 
                "sname          text," + 
                "cid            text," + 
                "primary key (pid));";
                
                db.each(dropTableQuery, function(err, row) {
                    if(err) return;
                }, function(err, rows){
                    if(err) return;
                    db.each(createTableQuery, function(err, row) {
                        if(err) return;
                    }, function(err, rows){
                        if(err){
                            request.flash('error', 'Basket table error: ' + err);
                            response.redirect('/login');
                            return;
                        }
                        response.redirect('/customer/?cid=' + cid);     
                    }); 
                });
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
        var basketQuery = "SELECT pid, sname, qty, cid FROM basket;";
        var basketArray = [];
        db.run(basketQuery, function(err, row) {
            if(err) return;
            basketArray.push(row);
        }, function(err, rows){
            if(err) {
                request.flash('error', 'Basket Query Error: ' + err);
                response.redirect('/customer/?cid=' + cid);
                return;
            }
            response.render('../views/customer', {basketArray : basketArray, cid : cid, productArray : {}, message : request.flash("error"), message: request.flash("success")});
        });
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
    
    var productArray = [];

    db.serialize(function() {
        
        var query1 = "";
        var query2 = "";
        var query3 = "";
        var query4 = "";
        
        var iteration = 0;
        
        searchProductsQuery(iteration);
        
        function searchProductsQuery(currentIteration){
                
            // Product id, name, unit, category, number of stores that carry it, min carry price
            query1 = "SELECT p.pid as productID, p.name as productName, p.unit as productUnit, p.cat as productCategory, COUNT(ca.sid) as storesCarry, MIN(ca.uprice) as minCarryPrice" + 
            " FROM products p, carries ca, stores s" + 
            " WHERE p.pid = ca.pid AND p.name LIKE '%" + keywords_Array[currentIteration] + "%' AND s.sid = ca.sid" +
            " ORDER BY s.name DESC;";
            
            // Selects the number of stores that have the product in stock and 
            // The minimum price among the stores that have the product in stock
            query2 = "SELECT p.pid as productID, COUNT(ca.sid) as numStoresWithStock, MIN(ca.uprice) as minCarryPriceWithStock" + 
            " FROM products p, carries ca" +
            " WHERE ca.pid = p.pid AND ca.qty<>0 AND p.name LIKE '%" + keywords_Array[currentIteration] + "%';";
    
            /* The number of orders within the past 7 days */
            query3 = "SELECT p.pid as productID, COUNT(o.oid) as ordersPast7" +
            " FROM orders o, olines ol, products p" +
            " WHERE o.oid = ol.oid AND ol.pid = p.pid AND p.name LIKE '%" + keywords_Array[currentIteration] + "%' AND date(o.odate, '+7 day') >= date('now');";
            
            /*Selecting a product for more detail
            Also need to display the number of orders w/in the past 7 days. This is 
            computed with the last query. Store that into a variable and display with
            these results */
            query4 = "SELECT *, s.name as storeName, ca.uprice as unitPrice, ca.qty as carriesQuantity" +
		    " FROM products p, carries ca, stores s" +
		    " WHERE ca.pid = p.pid AND ca.qty != 0 AND s.sid = ca.sid;"; 
		    
		    var productDictionary = {
                matches : 0,
                productID: "",
                productName: "",
                productUnit: "",
                productCategory: "",
                numStoresCarry: 0,
                minCarryPrice : 0,
                numStoresWithStock : 0,
                minCarryPriceWithStock : 0,
                listOfStores : [],
                ordersPast7 : 0
            }
		    
            db.each(query1, function(err, row) {
                if (err) return;
                var foundMatch = false;
                for(var i = 0; i < productArray.length; i++){
                    if(productArray[i].productID == row.productID) {
                        productArray[i].matches = productArray[i].matches + 1;
                        foundMatch = true;
                        break;
                    }
                }
                if(!foundMatch && row.productID != null){
                    productDictionary.matches = 1;
                    productDictionary.productID = row.productID;
                    productDictionary.productName = row.productName;
                    productDictionary.productUnit = row.productUnit;
                    productDictionary.productCategory = row.productCategory;
                    productDictionary.numStoresCarry = row.storesCarry;
                    productDictionary.minCarryPrice = row.minCarryPrice;
                    productArray.push(productDictionary);
                }
            }, function(err, rows){
                if(err) return;
                db.each(query2, function(err, row) {
                    if(err) return;
                    for(var i = 0; i < productArray.length; i++){
                        if(productArray[i].productID == row.productID && productArray[i].productID != null) {
                            productArray[i].numStoresWithStock = row.numStoresWithStock;
                            productArray[i].minCarryPriceWithStock = row.minCarryPriceWithStock;
                            break;
                        }
                    }
                }, function(err, rows){
                    if(err) return;
                    db.each(query3, function(err, row) {
                        if(err) return;
                        for(var i = 0; i < productArray.length; i++){
                            if(productArray[i].productID == row.productID && productArray[i].productID != null) {
                                productArray[i].ordersPast7 = row.ordersPast7;
                                break;
                            }
                        }
                    }, function(err, rows){
                        if(err) return;
                        db.each(query4, function(err, row) {
                            if(err) return;
                            for(var i = 0; i < productArray.length; i++){
                                var skip = false;
                                if(productArray[i].productID == row.pid && productArray[i].productID != null) {
                                    for(var j = 0; j < productArray[i].listOfStores.length; j++){
                                        if(productArray[i].listOfStores[j].storeName == row.storeName){
                                            skip = true;
                                        }
                                    }
                                    if(skip) break;
                                    productArray[i].listOfStores.push({
                                        storeName : row.storeName,
                                        unitPrice : row.unitPrice,
                                        carriesQuantity : row.carriesQuantity
                                    });
                                    break;
                                }
                            }
                        }, function(err, rows){
                            if (err) {
                                request.flash('error', 'Query Error: ' + err);
                                response.redirect('/customer/?cid=' + cid);
                                return;
                            } else {
                                currentIteration++;
                                if(currentIteration < keywords_Array.length){
                                    
                                    //Recursive callback since it's asynchronous. That's why we don't loop through the keywords.
                                    searchProductsQuery(currentIteration);
                                } else {
                                    
                                    //All keywords are done.
                                    //Sort product matches in descending order using function closure.
                                    productArray.sort(function(key1, key2) {
                                        return (key2.matches) - (key1.matches);
                                    });
                                    
                                    for(var i = 0; i < productArray.length; i++){
                                        var tempArrayInStock = [];
                                        var tempArrayNotInStock = [];
                                        for(var j = 0; j < productArray[i].listOfStores.length; j++){
                                            if(productArray[i].listOfStores[j].carriesQuantity > 0){
                                                tempArrayInStock.push(productArray[i].listOfStores[j]);
                                            } else {
                                                tempArrayNotInStock.push(productArray[i].listOfStores[j]);
                                            }
                                            // console.log(productArray[i].listOfStores[j]);
                                        }
                                        tempArrayInStock.sort(function(key1, key2) {
                                            return (key1.matches) - (key2.matches);
                                        });
                                        tempArrayNotInStock.sort(function(key1, key2) {
                                            return (key1.matches) - (key2.matches);
                                        });
                                        
                                        productArray[i].listOfStores[j] = tempArrayInStock.concat(tempArrayNotInStock);
                                    }
                                    
                                    var basketQuery = "SELECT pid, sname, qty, cid FROM basket;";
                                    var basketArray = [];
                                    db.run(basketQuery, function(err, row) {
                                        if(err) return;
                                        basketArray.push(row);
                                    }, function(err, rows){
                                        if(err) {
                                            request.flash('error', 'Basket Query Error: ' + err);
                                            response.redirect('/customer/?cid=' + cid);
                                            return;
                                        }
                                        response.render('../views/customer', {basketArray : basketArray, cid : cid, productArray : productArray, message : request.flash("error"), message: request.flash("success")});
                                        console.log(productArray);
                                    });
                                }
                            }
                        });
                    });
                });
            });
        }
    });
});

//Place an order
router.post('/customerorder', function(request, response){
    
    var dropTableQuery = "drop table if exists basket;";
    
    var createTableQuery = "create table basket (" +
    "pid           char(6)," +
    "qty            int," + 
    "sname          text," + 
    "cid            text," + 
    "primary key (pid));";
    
    console.log(request.body.basketArray);
    
    db.run(dropTableQuery, function(err, row) {
        if(err) return;
    }, function(err, rows){
        if(err) return;
        db.run(createTableQuery, function(err, row) {
            if(err) return;
        }, function(err, rows){
            if(err) {
                response.send("Error");
                return;
            }
            
            var iteration = -1;
            orderInsertion(iteration);
            
            function orderInsertion(iteration){
                iteration++;
                if(iteration < request.body.basketArray.length){
                        
                        var insertionQuery = "INSERT INTO basket VALUES('" + request.body.basketArray[iteration].pid + "','" + 
                        request.body.basketArray[iteration].qty + "','" + 
                        request.body.basketArray[iteration].storeName + "','" +
                        request.body.basketArray[iteration].cid + "');";
                        
                        db.run(insertionQuery, function(err, row) {
                            if(err) return;
                        }, function(err, rows){
                            if(err) return;
                            
                            var orderQuery = "INSERT INTO orders VALUES(strftime('%s', 'now'),'" + request.body.basketArray[iteration].cid + "',date('now'),'Stanford University')";
                            
                            db.run(orderQuery, function(err, row) {
                                if(err) return;
                            }, function(err, rows){
                            if(err) {
                                response.send("Error");
                                return;
                            }
                            orderInsertion(iteration);
                        });
                    });
                } else {
                    db.run("drop table if exists basket;", function(err, row) {
                        if(err) return;
                    }, function(err, rows){
                        if(err) {
                            response.send("Error");
                            return;
                        }
                        response.send("Good");
                    });
                }
            }
        });
    });
});

var orderList = {
    orderID : 0,
    orderDate: "",
}

//List orders
router.post('/customerlist', function(request, response){
    
    var query1 = "SELECT o.oid, o.date, COUNT(ol.pid), SUM(ol.uprice * ol.qty)" + 
	" FROM orders o, customers c, olines ol" + 
	" WHERE o.cid = " + cid + " AND o.oid = ol.oid"
	" ORDER BY o.odate DESC;" 
    
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
    db.run("delete from basket;", function(err, row) {
        if(err) return;
    }, function(err, rows){
        if(err){
            request.flash('error', 'Log Out Error: ' + err);
            response.redirect('/login');
        } else {
            request.flash('success', 'Logged Out!');
            response.redirect('/');
        }
    });
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