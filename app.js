var express   = require('express'),
    app       = express(),
    session   = require('express-session'),
    bodyParser = require('body-parser');
    
    
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static(__dirname));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

// session.use({
//     timeout:10000,
//     secret : 'cmput291LHR'
// });

var main = require('./routes/main');

app.use(main);

app.get('*', function(request, response){
    response.send('Invalid URL!'); 
});

app.listen(process.env.PORT, process.env.IP, function(request, response){
    console.log('Server Started');
});