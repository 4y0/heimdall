# Heimdall.js 
## _A simple null / empty checker_
Heimdall.js is a simple tool for null or undefined or falsey value checks in node.js apps. It provides a neat abstraction for if-else blocks and relieves the developer of the headaches that come with logic-fuzz.
### Example Use-case 1
**Typical flow**
```
var secure = req.param('secure');
if (!secure) {
    res.forbidden('This request has to be secure!');
}else{
  //other stuff here
}
```
**Heimdall flow**
```
var secure = req.param('secure');
res.Heimdall.emptyCheck(secure, 'This request has to be secure', 'forbidden');
//If secure is empty, code won't go beyond the Heimdall.emptyCheck call
// other stuff here
```

### Example Use-case 2
**Typical flow**
```
var client_id     = req.query.client_id;
var client_secret = req.query.client_secret;
//imagine we have more required (query) params 
if(!client_id || !client_secret){
   res.fail('client_id and client_Secret are required');
}
//other app stuff
```
**Heimdall flow**
```
res.Heimdall.multiArrayCheck(req.query, ['client_id','client_secret']); 
//Code won't go beyond the Heimdall.multiArrayCheck call if any of the passed values fail.
var client_id     = req.query.client_id;
var client_secret = req.query.client_secret;
```
### How to use
 Intall using npm `sudo npm install heimdall`
 
 Require heimdall in your code and init as a middleware before your route definitions
```
var heimdall = require('heimdall'),
    express  = require('express');
app.set('view engine', 'ejs');
app.set('views', './public/views');
var app = new express();
//Init heimdall
app.use(heimdall.initHeimdall);
//Example route using hemidall checks
app.get('/', function (req, res, next) {
    res.Heimdall.emptyCheck(req.query.access_token, 'Access token needed to view this page');
    res.Heimdall.callE('render','index', {user:'Heimdall',page:'Index'});
});
//Init heimdall's error handler
app.use(heimdall.initHeimdallErrorHandler);
```
_One caveat with using Heimdall. Unlike php where we can easily use `die()` / `exit()` to stop code execution. Node.js has no 'easily' implementable equivalent functions. calling res.render or any other response.end / response header change invoking functions after heimdall causes a 'header already sent' error. 
Heimdall handles this by using the `Heimdall.callE` wrapper for such functions described above. The only thing you need to do is include the function name as the first argument to Heimdall's callE function and subsequent ones as you would normally (and in the same order) pass to the function. So, `res.render('ejsfilename',ejstemplatepayload)` becomes `res.Heimdall.callE('render','ejsfilename',ejstemplatepayload)` AND `res.json({random:1234})` becomes `res.Heimdall.callE('json',{random:1234})`_

An example API project using Heimdall can be found here. Feel free to fork and play around. Also, contributions / issues / feature requests are welcome 


