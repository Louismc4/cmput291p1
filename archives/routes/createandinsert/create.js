var express   = require('express'),
    router    = express.Router(),
    sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database('291.db');

//Create Tables Page
router.get('/create', function(request, response){
    response.render('../views/createandinsert/create', {message : request.flash("error"), message: request.flash("success")});
});

//Create Table Statements for the database
router.post('/createtables', function(request, response){
    
    var array = request.body.querystring.split(';');
    
    //Since it's asynchronous serialize makes sure everything executes correctly.
    db.serialize(function(){
        
        //Split statements into an array by ';' and then execute each statement
        for(var i = 0; i < array.length-1; i++){
            var count = 0;
            console.log(i + ":" + array[i]);
            db.run(array[i], function(err){
                
                //If any errors, reload the page and display error message
                if(err) {
                    console.log(i + ":" + err);
                    stop(request, response, err);
                    return;
                }
                
                //Move to the next page when done all the statements.
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
    response.redirect('/create');
}

//Move onto the next page function
function moveOn(request, response){
    request.flash('success', 'Success In Creating Tables!');
    response.redirect('/insert');
}

module.exports = router;