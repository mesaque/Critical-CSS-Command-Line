var penthouse = require('penthouse'),
	path = require('path');
	fs = require('fs'),
	url = require('url'),
	request = require('request'),
	args = process.argv,
	config = require(args[2]),
	sites = config.sites;

function criticalCSS(_site, _localCss, _output, fn){
	// getFile(_localCss, function(file){		
		writeFile('./static/main.css',  _localCss, function(){
			var settings = {
				url : _site,
				css : path.join( './static/main.css' ),
				width : 1300,
				height : 900,
				forceInclude : [
				  '.keepMeEvenIfNotSeenInDom',
				  /^\.regexWorksToo/
				],
				timeout: 60000,
				strict: false,
				maxEmbeddedBase64Length: 10000000000000000 
			};
			penthouse(settings, function(err, criticalCss) {
				if (err) { 
					console.log('ERROR =>', err)
				}
				writeFile(_output, criticalCss, function(){
					console.log('Writen in file =>', _output);
					fn();
				});
			});			
		});
	// });
}

function getFile(_url, fn){
	request(_url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			// console.log('MYBODY =>', body);
			fn(body);
		}
	})
};

function writeFile(_file, _contents, fn){
	fs.writeFile(_file, _contents,function (err) {
		if (err) console.log(err);
		fn();
	});
};

function processList( _list, fn ){
	var fname = '';
	for( var i in _list ){

		var site = _list[i];

		for( var j = 0; j< _list[i].css.length; j++ ){
			fname = './tmp/'+(+new Date())+'.css';
			getFile( _list[i].css[j], function(body){
				writeFile(fname, body, function(){
					criticalCSS(
					_list[i].url, 
					fname,
					'./critical-'+url.parse(_list[i].url).host+'.css', function(){
						console.log('done!');
					});			
				})	
			} );
		}
		if( i +1 == _list.length ){
			fn();			
		}
	}	
}

processList( sites, function(){
	console.log('Everything is done!')
});

