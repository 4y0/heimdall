# mosh.js 
## _A simple null / empty checker_
mosh.js is a simple tool for null or undefined or falsey value checks in node.js apps. It provides a neat abstraction for if-else blocks and relieves the developer of the headaches that come with logic-fuzz.


### How to use
 Intall using npm `sudo npm install mosh`
 
 Require mosh in your code and init as a middleware before your route definitions
```
var mosh = require('mosh'),
    express  = require('express');
app.set('view engine', 'ejs');
app.set('views', './public/views');
var app = new express();
//Init mosh
app.use(mosh.initMosh);

//Example route using mosh checks
app.get('/', function (req, res, next) {
    res.mosh.emptyCheck(req.query.access_token, 'Access token needed to view this page');
    res.mosh.callE('render','index', {user:'mosh',page:'Index'});
});

//Init mosh's error handler
app.use(mosh.initMoshErrorHandler);
```
_One caveat with using mosh. Unlike php where we can easily use `die()` / `exit()` to stop code execution. Node.js has no 'easily' implementable equivalent functions. calling res.render or any other response.end / response header change invoking functions after mosh causes a 'header already sent' error. 
mosh handles this by using the `mosh.callE` wrapper for such functions described above. The only thing you need to do is include the function name as the first argument to mosh's callE function and subsequent ones as you would normally (and in the same order) pass to the function. So, `res.render('ejsfilename',ejstemplatepayload)` becomes `res.mosh.callE('render','ejsfilename',ejstemplatepayload)` AND `res.json({random:1234})` becomes `res.mosh.callE('json',{random:1234})`_

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
**mosh flow**
```
var secure = req.param('secure');
res.mosh.emptyCheck(secure, 'This request has to be secure', 'forbidden');
//If secure is empty, code won't go beyond the mosh.emptyCheck call
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
**mosh flow**
```
res.mosh.multiArrayCheck(req.query, ['client_id','client_secret']); 
//Code won't go beyond the mosh.multiArrayCheck call if any of the passed values fail.
var client_id     = req.query.client_id;
var client_secret = req.query.client_secret;
```
### Example Use-case 3
**Typical flow**
```
var user_id = req.params.user_id;
if(!user_id)
{
	res.fail('User  id is required');	
}
else
{
	
	UserModel.findOne(user_id, function(user, err){
		if(!user){
		   res.fail('User not found');
		}
		else
		{
			//other stuff to happen if user is found
	    }
	});

}
```
**mosh flow**
```
res.mosh.emptyCheck(req.params.user_id, 'User id is required', 'fail');
var user_id = req.params.user_id;
UserModel.findOne(user_id, function(user, err){
	res.mosh.emptyCheck(user, 'User not found', 'fail');
	//other stuff to happen here
});
```

### Example Use-case 4
**Typical flow**
```
if(req.body.IGUser && req.body.IGuser.handle){
	var IGUserHandle = req.body.IGUser.handle;
}
else{
	res.fail('Required handle property not found in USER');
}
```
**mosh flow**
```
res.mosh.multiDepthCheck(req.body, ['IGuser', 'handle'],'Required handle property not found in USER');
var IGUserHandle = req.body.IGUser.handle
```





