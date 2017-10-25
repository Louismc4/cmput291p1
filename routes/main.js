var express   = require('express'),
    router    = express.Router();
    
router.get('/', function(request, response){
    response.render('../views/home'); 
});    

router.post('/registercustomer', function(request, response){
    var name = request.body.custregistername;
    var password = request.body.registercustpassword;
    
    if(typeof name == 'undefined' || typeof password == 'undefined') response.send('??');
    
});

router.post('/registeragent', function(request, response){
    var name = request.body.custregistername;
    var password = request.body.registercustpassword;
    
    if(typeof name == 'undefined' || typeof password == 'undefined') response.send('??');
});

router.post('/logincustomer', function(request, response){
    var name = request.body.custregistername;
    var password = request.body.registercustpassword;
    
    if(typeof name == 'undefined' || typeof password == 'undefined') response.send('??');
});

router.post('/loginagent', function(request, response){
    var name = request.body.custregistername;
    var password = request.body.registercustpassword;
    
    if(typeof name == 'undefined' || typeof password == 'undefined') response.send('??');
});

module.exports = router;