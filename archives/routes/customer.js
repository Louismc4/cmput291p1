// var express   = require('express'),
//     router    = express.Router(),
//     sqlite3 = require('sqlite3').verbose();

// var db;
// var id;
// var customerBaskbetDB = new sqlite3.Database(':memory:');

// //Customer Page
// router.get('/customer', function(request, response){
//     id = request.query.cid;
//     console.log(id);
//     if(id == "" || id == undefined){
//         request.flash('error', 'You\'re not logged in!');
//         response.redirect('/login');
//     } else {
//         db = new sqlite3.Database('291.db');
//         response.render('../views/customer', {id : id, message : request.flash("error"), message: request.flash("success")});
//     }
// });

// //Search For Products
// router.post('/customersearch', function(request, response){
//     db = new sqlite3.Database('291.db');
//     var keywords = request.body.search_products_keywords;
    
//     if(typeof keywords == 'undefined' || keywords == '') {
//         request.flash('error', 'Please fill product search field!');
//         response.redirect('/customer');
//         return;
//     }
    
//     var keywords_Array = keywords.split(' ');
//     var json_Dictionary = []; //Array of key value pairs
    
//     for(var i = 0; i < keywords_Array.length; i++){
//         json_Dictionary[keywords_Array[i]] = 0;
//     }
    
//     console.log(json_Dictionary);
    
//     db.serialize(function() {
        
//         var hitError = false;
//         var query = "SELECT products.name FROM products, carries, stores WHERE products.pid = carries.pid AND carries.qty > 0 AND stores.sid = carries.sid;"
        
//         db.run(query, function(err, row) {
//             if (err) {
//                 hitError = true;
//                 return;
//             }
//             console.log(row);
//             for(var i = 0; i < keywords_Array.length; i++){
//                 if(row.name.contains(json_Dictionary[keywords[i]])){
//                     json_Dictionary[keywords[i]] = json_Dictionary[keywords[i]]++;
//                 }
//             }
//         }, function(err, rows){
//             if(hitError || err){
//                 request.flash('error', 'Customer Search Query Error! ' + err);
//                 response.redirect('/customer');
//                 hitError = false;
//             } else {
//                 console.log(json_Dictionary);
//                 response.send('lol');
//                 // response.send('');
//             }
//             console.log('Number of rows from query: ' + rows);
//         });
//     });
// });

// //Place an order
// router.post('/customerorder', function(request, response){
    
// });

// //List orders
// router.post('/customerlist', function(request, response){
    
// });

// router.get('/customerlogout', function(request, response){
//     request.flash('success', 'Customer Logged Out!');
//     response.redirect('/');
// });

// module.exports = router;