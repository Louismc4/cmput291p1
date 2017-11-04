var express   = require('express'),
    router    = express.Router(),
    sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database('291.db');

//Insert Values Page
router.get('/insert', function(request, response){
    response.render('../views/createandinsert/insert', {message : request.flash("error"), message: request.flash("success")});
});

//Insert Table Statements for the database
router.post('/insertvalues', function(request, response){
    
    var array = request.body.querystring.split(';');
    
    db.serialize(function(){
        for(var i = 0; i < array.length-1; i++){
            
            var count = 0;
            
            //Split statements into an array by ';' and then execute each statement
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
    request.flash('error', 'Error In Inserting Values: ' + err);
    response.redirect('/insert');
}

//Move back to main page function
function moveOn(request, response){
    request.flash('success', 'Success In Inserting Values!');
    response.redirect('/');
}

module.exports = router;