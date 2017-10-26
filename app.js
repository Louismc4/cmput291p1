var express    = require('express'),
    app        = express(),
    session    = require('express-session'),
    bodyParser = require('body-parser'),
    sqlite3    = require('sqlite3'),
    flash      = require("connect-flash");
    
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static(__dirname));
app.use(express.static(__dirname + '/public'));
app.use(flash());
app.set('view engine', 'ejs');

app.use(session({
    secret: "Secret Louis",
    resave: false,
    saveUninitialized: false
}));

app.use(function(request, response, next){
    //Inside ejs templates
    response.locals.error = request.flash("error");
    response.locals.success = request.flash("success");
    next();
});

var main     = require('./routes/main'),
    login    = require('./routes/login');

app.use(main);
app.use(login);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log('Server Started');
});