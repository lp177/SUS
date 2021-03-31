'use strict';
if (typeof browser==='undefined')
	var browser=chrome;
function initUrlExtracting()
{
	browser.tabs.executeScript(
		null,
		{file:'/inject.js'},
		function()
		{
			browser.tabs.query({active: true, currentWindow: true}, tabs => {
				browser.tabs.sendMessage(tabs[0].id, {action: 'extractURL'});
			});
		}
	);
}
browser.browserAction.onClicked.addListener(function()
{
	initUrlExtracting();
});
function postNewURL(url,token,server)
{
	if (token===undefined||token.length<1||server===undefined||server.length<1)
		return browser.runtime.openOptionsPage();
	var http = new XMLHttpRequest();
	http.open('POST', server, true);
	http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	http.onreadystatechange = function()
	{
		if (http.readyState == 4)
		{
			if (http.status == 200)
				console.log('save response: ', http.responseText);
			else
				console.error('Receiving from save page\nHTTP status: ', http.status, '\nText: ', http.responseText);
		}
	}
	http.send('auth_key='+encodeURIComponent(token)+'&data='+encodeURIComponent(url));
}
browser.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	if (request.action==='extractedURL')
		browser.storage.sync.get(
			['token','server'],
			(data)=>postNewURL(request.generatedUrl,data['token'],data['server'])
		);
	else if (request.query==='setToken')
		browser.storage.sync.set({'token':request.value});
	if (sendResponse!=undefined)
		sendResponse({
			reply:'Thx'
		});
});
browser.contextMenus.removeAll();
browser.contextMenus.create({
	title: "Open here",
	contexts: ["browser_action"],
	onclick: function()
	{
		browser.storage.sync.get(
			['token','server'],
			(data)=>{
				if (data['server']===undefined||data['server'].length<1)
					return browser.runtime.openOptionsPage();
				browser.tabs.create({url:data['server']+'/swap.html'});
			}
		);
	}
});
browser.contextMenus.create({
	title: "Save this url",
	contexts: ["browser_action"],
	onclick: initUrlExtracting
});
browser.contextMenus.create({
	title: "Watch saved url",
	contexts: ["browser_action"],
	onclick: function()
	{
		browser.storage.sync.get(
			['token','server'],
			(data)=>{
				if (data['server']===undefined||data['server'].length<1)
					return browser.runtime.openOptionsPage();
				browser.tabs.create({url:data['server']+'/swap.txt'});
			}
		);
	}
});