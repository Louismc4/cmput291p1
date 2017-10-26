var express   = require('express'),
    router    = express.Router();

router.get('*', function(request, response){
    response.render('Invalid URL'); 
});

module.exports = router;