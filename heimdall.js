//Class Heimdall
function Heimdall (res){
	this.res          = res;
	this.headers_sent = false;
}


/*
@value
@default_value
Return value if not empty, otherwise return default_value
*/
Heimdall.prototype.initValue = function (value, default_value)
{
	default_value = default_value || null;
	return value || default_value;
}


/*
@data    - Object | Array | String 
@status  - success | error
@message - Information about / reason for dump
Heimdall's default json dump.
*/
Heimdall.prototype.jsonSend = function (data, status, message)
{
	this.res.json({
		'status':status,
		'message':message,
		'data':data
	});
}

/*
@data    - Object | Array | String  
@message - Information about / reason for dump
Heimdall's default fail dump. Status is always error
*/
Heimdall.prototype.fail = function (data, message)
{
	data    = this.initValue(data, []);
	message = this.initValue(message, "Some error occured");
	this.jsonSend(data, 'error', message);
}

//Not sure why I left this here
Heimdall.prototype.success = function (data, message)
{
	data    = this.initValue(data, []);
	message = this.initValue(message, "Action successful");
	this.jsonSend(data, 'success', message);

}

/*
@func_name - Node's response.end()-ish function to call
callE helps avert the 'headers already sent error'
Where a check has failed, subsequent calls to methods
that may re-set response headers or call the end() method
would trigger a 'headers already sent error' 
Usage: 
res.render('/views/index', {view_data:{ name:'Heimdall', version:'1.0.0' }});
Becomes:>>
res.Heimdall.callE('render', '/views/index', {view_data:{ name:'Heimdall', version:'1.0.0' }});
*/
Heimdall.prototype.callE = function (func_name) {
	if(!this.headers_sent){
		this.res[func_name].apply(this.res, Array.prototype.slice.apply(arguments, [1]));
	}
}

/*
Heimdall's watch function
Simply end code execution when required
values / conditions are empty / fail
[Expects value passed to be falsey / undefined before ending program flow.]
@value - Value to check if empty / undefined
@message - Message to fail with
@other - Internally Heimdall dumps json (res.json) data by default. The format is as follows:
{
	status:'success|error',
	message:'success|error message',
	data:[payload]
}
If the user doesn't wish to use the inbuilt res.json function, they can pass a value for the @other param
This will be used to end execution . Sails users for e.g. can pass 'forbidden' =>> res.forbidden(message)
or 'ok' or 'fail' e.t.c.
@strictly_undefined - By default Heimdall checks that a value is undefined or falsey before ending execution.
This allows for an edgecase where we simply want to check that a variable is defined regardless of it's
falsey nature.
var x = 'false';
Default way, doing Heimdall.emptyCheck(x, 'Value is empty');
The script ends with the message value is empty. But we only want to check if 
x is undefined. The internal condition typeof x == 'undefined' || !x will always evalute 
truthy as !'false' == true
With strictly_undefined set to true, we remove the falsey check bit and only use the undefined check
var x = 'false';
Heimdall.emptyCheck(x, 'Value is empty', null, true); //Only check if x is defined
@callback if user doesn't want to use heimdall's inbuilt payload structure, they can pass a callback function to handle failure
*/
Heimdall.prototype.emptyCheck = function(value, message, other, strictly_undefined, callback)
{
	/*
	If we have sent an error message to the user.. we shouldn't do any checks again
	*/
	if(!this.headers_sent)
	{
		message            = this.initValue(message, 'Value is expected');
		strictly_undefined = this.initValue(strictly_undefined, false);
		var valueAssertion = strictly_undefined ? true : !value;

		if(typeof value == 'undefined' || valueAssertion){
			this.headers_sent = 1;
			if(callback)
			{
				callback(message);
				return;
			}
			if(other)
			{
				this.res[other](message);
			}
			else
			{  
				this.fail(message);
			}
			throw new HeimdallError('Heimdall Precludes Exec from proceeding because: ' + message);
		}
	}
}

/*
@keys         - Array of keys to lookup in @array_source
@array_source - Array source to run check against
*/
Heimdall.prototype.multiArrayCheck = function(array_source, keys)
{
	var error_messages = [];
	function keys_foreach_cb (key) 
	{
		if(typeof array_source[key] == 'undefined' || !array_source[key])
		{
			error_messages.push( 'required ' + key + ' value not provided' );
		}
	}
	keys.forEach( keys_foreach_cb );

	//if error_messages is populated, fail with error_messages
	this.emptyCheck(error_messages.length < 1, error_messages.join(' , '));
}


/*
@func function to extend Heimdall with
@name Property name to assign func to.
*/
Heimdall.prototype.extendHeimdall = function (func, name)
{
	var getFuncName = function (name)
	{
		var name_pattern = /\s*function\s*([a-zA-Z_]+[0-9]*[a-zA-Z_]*)\s*\(\s*/;
		var matches = name.match(name_pattern);
		if(matches && matches[1]){
			return matches[1];
		}

		return false;
	};
	name = name || getFuncName(name);
	if(name === false)
	{
		return null; //anonymous function passed
	}
	Heimdall.prototype[name] = func;
}

//Not sure why this one is here
Heimdall.prototype.forbidden = function (value, message)
{
	message = this.initValue(message, 'Access denied');
	this.emptyCheck(value, message, 'forbidden');
}

Heimdall.initHeimdall = function(req, res, next)
{
	res.Heimdall = new Heimdall(res);
	next();
}

Heimdall.initHeimdallErrorHandler = function(err, req, res, next)
{
	if(err.name == 'HeimdallError')
	{
		console.log('Heimdal Says: ' + err.message);
	}
	else
	{
		if(res.headersSent)
		{
			return next(err);
		}
		next(err);
	}
}

module.exports = Heimdall;

