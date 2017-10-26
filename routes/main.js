var express   = require('express'),
    router    = express.Router(),
    sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database(':memory:');

router.get('/', function(request, response){
    response.render('../views/main', {message : request.flash("error"), message: request.flash("success")}); 
});

router.get('/login', function(request, response){
    response.render('../views/login', {message : request.flash("error"), message: request.flash("success")}); 
});

router.get('/logout', function(request, response){
    request.flash('success', 'Logged Out!');
    response.redirect('/');
});

router.get('/customer', function(request, response){
    response.render('../views/customer', {message : request.flash("error"), message: request.flash("success")});
    db.serialize(function() {
        db.run("CREATE TABLE Test (info TEXT)");

        var stmt = db.prepare("INSERT INTO Test VALUES (?)");
        for (var i = 0; i < 10; i++) {
            stmt.run("Test " + i);
        }
        stmt.finalize();

        db.each("SELECT rowid AS id, info FROM Test", function(err, row) {
            console.log(row.id + ": " + row.info);
        });
    });
 
    db.close();
});

router.get('/agent', function(request, response){
    response.render('../views/agent', {message : request.flash("error"), message: request.flash("success")});
});

module.exports = router;