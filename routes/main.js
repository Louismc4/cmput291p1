var express   = require('express'),
    router    = express.Router(),
    sqlite3 = require('sqlite3').verbose();

var db;

databaseAssign();

function databaseAssign(){
    if(process.argv.length > 2){
        if(process.argv.slice(2)[0].includes('.db')){
            db = new sqlite3.Database(process.argv.slice(2)[0]);
        }
    } else {
        db = new sqlite3.Database('291.db');
    }
}

/*
 * Why didn't we split these into multiple routes? Well splitting them across files requires us to close 
 * and load new instances of the database which gives us segmentation fault problems... 
 */


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
            response.render('../views/customer', {basketArray : basketArray, orderList : [], cid : cid, productArray : {}, message : request.flash("error"), message: request.flash("success")});
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
    
    //For all keywords we use recursive async and check for matches
    var qStr = keywords + ' ';
    var keywords_Array = keywords.split(' ');
    console.log(keywords_Array);
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
            
            //Query for products for each keyword
		    
		    //Query1
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
                //Query2
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
                    //Query3
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
                        //Query4
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
                                    
                                    //Here we sort by those in stock first and append to those stores who don't have stock.
                                    for(var i = 0; i < productArray.length; i++){
                                        var tempArrayInStock = [];
                                        var tempArrayNotInStock = [];
                                        for(var j = 0; j < productArray[i].listOfStores.length; j++){
                                            if(productArray[i].listOfStores[j].carriesQuantity > 0){
                                                tempArrayInStock.push(productArray[i].listOfStores[j]);
                                            } else {
                                                tempArrayNotInStock.push(productArray[i].listOfStores[j]);
                                            }
                                        }
                                        tempArrayInStock.sort(function(key1, key2) {
                                            return (key1.matches) - (key2.matches);
                                        });
                                        tempArrayNotInStock.sort(function(key1, key2) {
                                            return (key1.matches) - (key2.matches);
                                        });
                                        
                                        //Finally we concatenate them
                                        productArray[i].listOfStores[j] = tempArrayInStock.concat(tempArrayNotInStock);
                                    }
                                    
                                    //When the user reloads the page we reload the basket...
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
                                        response.render('../views/customer', {orderList : [], basketArray : basketArray, cid : cid, productArray : productArray, message : request.flash("error"), message: request.flash("success")});
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
    
    //Delete and create a fresh basket when they order.
    var dropTableQuery = "drop table if exists basket;";
    
    var createTableQuery = "create table basket (" +
    "pid           char(6)," +
    "qty            int," + 
    "sname          text," + 
    "cid            text," + 
    "primary key (pid));";
    
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
            
            //Since there are a lot of statements potentially we need to use recursive async
            var iteration = -1;
            orderInsertion(iteration);
            
            function orderInsertion(iteration){
                iteration++;
                if(iteration < request.body.basketArray.length){
                        
                    //Insert into the basket in case something fails
                    var insertionQuery = "INSERT INTO basket VALUES('" + request.body.basketArray[iteration].pid + "','" + 
                    request.body.basketArray[iteration].qty + "','" + 
                    request.body.basketArray[iteration].storeName + "','" +
                    request.body.basketArray[iteration].cid + "');";
                    
                    db.run(insertionQuery, function(err, row) {
                        if(err) return;
                    }, function(err, rows){
                        if(err) return;
                        
                        //Insert into the orders
                        var orderQuery = "INSERT INTO orders VALUES(strftime('%s', 'now'),'" + request.body.basketArray[iteration].cid + "',date('now'),'Stanford University')";
                        
                        db.run(orderQuery, function(err, row) {
                            if(err) return;
                        }, function(err, rows){
                            if(err) {
                                response.send("Error");
                                return;
                            }
                            
                            var olinesQuery = "INSERT INTO orders VALUES(strftime('%s', 'now'),'" + request.body.basketArray[iteration].cid + "',date('now'),'Stanford University')";
                            
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
    
    var orderList = [];
    var query = "SELECT oid, cid, odate, address FROM orders;";
    
	db.each(query, function(err, row){
        if(err) return;
        if(row.cid == cid){
            orderList.push({oid : row.oid, cid : row.cid, odate : row.odate, address : row.address});
        }
    }, function(err, rows){
        if(err){
            request.flash('error', 'View Error!');
            response.redirect('/customer/?cid=' + cid);
            return;
        } else {
            response.render('../views/customer', {cid : cid, orderList : orderList, basketArray : [], productArray: [], message : request.flash("error"), message: request.flash("success")});
        }
    });
    
});

//------------------------------------------------------------->Agent Logic

//Agent view page logic
router.get('/agent', function(request, response){
    
    //Here we don't really need to assign aid but we can use it for "auth"...
    aid = request.query.aid;
    console.log(aid);
    if(aid == "" || aid == undefined){
        request.flash('error', 'You\'re not logged in!');
        response.redirect('/login');
    } else {
        response.render('../views/agent', {aid : aid, orderList : [], message : request.flash("error"), message: request.flash("success")});
    }
});

//Set up a delivery
router.post('/agentsetupdelivery', function(request, response){
    
    var oid = request.body.oid;
    var time = request.body.time;
    
    if(typeof oid == 'undefined' || oid == '') {
        request.flash('error', 'Please fill out oid');
        response.redirect('/agent/?aid=' + aid);
        return;
    }
    
    var query;
    
    if(time == '' || time == undefined){
        query = "INSERT INTO deliveries VALUES(strftime('%s', 'now')," + oid  + ",null,null)"
    } else {
        query = "INSERT INTO deliveries VALUES(strftime('%s', 'now')," + oid  + ",'" + time + "',null)"
    }
    
    db.run(query, function(err, row){
        if(err) return;
    }, function(err, rows){
        if(err) return;
        request.flash('success', 'Successfully set up!');
        response.redirect('/agent/?aid=' + aid);
    });
});

//Update a delivery
//View the orders
router.post('/agentvieworders', function(request, response){
    var tno = request.body.trackingNo;
    
    if(typeof tno == 'undefined' && tno == '') {
        request.flash('error', 'Please fill tracking number!');
        response.redirect('/agent/?aid=' + aid);
        return;
    }
    var orderList = [];
    var query = "SELECT oid, pickUpTime, dropOffTime FROM deliveries WHERE trackingNo = " + tno + ";";
    
    db.each(query, function(err, row){
        if(err) return;
        orderList.push({oid : row.oid, pickuptime : row.pickUpTime, dropofftime : row.dropOffTime});
    }, function(err, rows){
        if(err){
            request.flash('error', 'View Error!');
            response.redirect('/agent/?aid=' + aid);
            return;
        } else {
            response.render('../views/agent', {aid : aid, orderList : orderList, message : request.flash("error"), message: request.flash("success")});
        }
    });
});

router.post('/agentupdatedelivery', function(request, response){
    var tno = request.body.trackingNo;
    var pickup = request.body.pickuptime;
    var dropoff = request.body.dropofftime;
    
    if(typeof tno == 'undefined' || tno == '') {
        request.flash('error', 'Please fill tracking number!');
        response.redirect('/agent/?aid=' + aid);
        return;
    }
    
    //If only update dropoff
    if(dropoff == '' || typeof dropoff == 'undefined' && pickup != '' && typeof pickup != undefined){
        var query1 = "UPDATE deliveries" + 
	    " SET pickUpTime = '" + pickup + "' WHERE trackingNo = " + tno + ";";
	    
        db.run(query1, function(err, row){
            if(err) return;
        }, function(err, rows){
            if(err){
                request.flash('error', 'Update Pickup Error!');
                response.redirect('/agent/?aid=' + aid);
                return;
            } else {
                request.flash('success', 'Update Pickup Success!');
                response.redirect('/agent/?aid=' + aid);
            }
        });
        
        //If only update pickup
    } else if(dropoff != '' && typeof dropoff != 'undefined' && pickup == '' || typeof pickup == 'undefined'){
        var query2 = "UPDATE deliveries" + 
	                " SET dropOffTime = '" + dropoff + "' WHERE trackingNo = " + tno + ";";
	    
        db.run(query2, function(err, row){
            if(err) return;
        }, function(err, rows){
            if(err){
                request.flash('error', 'Update Dropoff Error!');
                response.redirect('/agent/?aid=' + aid);
                return;
            } else {
                request.flash('success', 'Update Dropoff Success!');
                response.redirect('/agent/?aid=' + aid);
            }
        });
    
        //Otherwise update both
    } else if(pickup != '' && typeof pickup != 'undefined'){
        
        var query1 = "UPDATE deliveries" + 
	    " SET pickUpTime = '" + pickup + "' WHERE trackingNo = " + tno + ";";

        db.run(query1, function(err, row){
            if(err) return;
        }, function(err, rows){
            if(err) {
                request.flash('error', 'Update Pickup Error!');
                response.redirect('/agent/?aid=' + aid);
                return;
            } else {
                
                if(dropoff != '' && typeof dropoff != 'undefined'){ 
                    
                    var query2 = "UPDATE deliveries" + 
	                " SET dropOffTime = '" + dropoff + "' WHERE trackingNo = " + tno + ";";
                    
                    db.run(query2, function(err, row){
                        if(err) return;
                    }, function(err, rows){
                        if(err){
                            request.flash('error', 'Update Dropoff Error!');
                            response.redirect('/agent/?aid=' + aid);
                            return;
                        }
                        request.flash('success', 'Update Pickup and Dropoff Success!');
                        response.redirect('/agent/?aid=' + aid);
                    });
                } else {
                    request.flash('success', 'Update Pickup Success!');
                    response.redirect('/agent/?aid=' + aid);
                }
            }
        });
    } else {
        response.redirect('/agent/?aid=' + aid);
    }
});


//Delete the delivery via tracking num
router.post('/agentdeletedelivery', function(request, response){
    var tno = request.body.trackingNo;
    
    if(typeof tno == 'undefined' || tno == '') {
        request.flash('error', 'Please fill tracking number!');
        response.redirect('/agent/?aid=' + aid);
        return;
    }
    
    var query1 = "DELETE FROM deliveries" + 
	" WHERE trackingno = " + tno + ";";
	
    db.run(query1, function(err, row){
        if(err) return;
    }, function(err, rows){
        if (err){
            request.flash('error', 'Delete Error!');
            response.redirect('/agent/?aid=' + aid);
        }
        request.flash('success', 'Successfully deleted!');
        response.redirect('/agent/?aid=' + aid);
    });
});

//List orders
router.post('/agentaddtostock', function(request, response){
    
    var pid = request.body.productid;
    var sid = request.body.storeid;
    var qty = request.body.quantity;
    var unitprice = request.body.unitprice;
    
    if(typeof pid == 'undefined' || pid == '' || typeof sid == 'undefined' || sid == ''
        || typeof qty == 'undefined' || qty == '') {
        request.flash('error', 'Please fill the top 3 fields!');
        response.redirect('/agent/?aid=' + aid);
        return;
    }
    
    //Update the quantity stock
    
    var query1 = "UPDATE carries" + 
	" SET qty = (qty + " + qty + ")" + 
    " WHERE carries.pid = '" + pid + "' AND carries.sid = " + sid + ";"
    
    db.run(query1, function(err, row){
        if(err) return;
    }, function(err, rows){
        if(err) return;
        if(unitprice != '' && typeof unitprice != undefined){
            
            //Update the unit price
            
            var query2 = "UPDATE carries" +
	        " SET uprice = " + unitprice + 
	        " WHERE carries.pid = '" + pid + "' AND carries.sid = " + sid + ";";
            
            db.run(query2, function(err, row){
                if(err) return;
            }, function(err, rows){
                if(err) {
                    request.flash('error', 'Update Error!');
                    response.redirect('/agent/?aid=' + aid);
                    return;
                }
                request.flash('success', 'Successfully updated w/ price!');
                response.redirect('/agent/?aid=' + aid);
            });
        } else {
            request.flash('success', 'Successfully updated!');
            response.redirect('/agent/?aid=' + aid);
        }
    });
});

//------------------------------------------------------------->Logout Logic
//Delete basket and remove cid and aid from authentication
router.get('/logout', function(request, response){
    cid = "";
    aid = "";
    db.run("delete from basket;", function(err, row) {
        if(err) return;
    }, function(err, rows){
        if(err){
            request.flash('error', 'Logout Error!');
            response.redirect('/agent/?aid=' + aid);
            return;
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
    
    var array = request.body.querystring.split(' ');
    
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