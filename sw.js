'use strict';
if (typeof browser==='undefined')
	var browser=chrome;
function postNewURL(url,token,server)
{
	if (token===undefined||token.length<1||server===undefined||server.length<1)
		return browser.runtime.openOptionsPage();
	fetch(
		server+'/swap.php?nocache='+Date.now(),
		{
			method: "POST",
			cache: "no-cache",
			// mode: "no-cors",
			redirect: "follow",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: 'auth_key='+encodeURIComponent(token)+'&data='+encodeURIComponent(url)
		}
	)
	.then(function(response)
	{
		response.text().then((responseText)=>{
			if(response.ok)
				console.log('save response: ', response.responseText);
			else
				console.error(
					'Receiving from save page\nHTTP status: ', response.status,
					'\nText: ', response.responseText
				);
		});
	})
	.catch(function(error)
	{
		console.error('Network problem=',error.message);
	});
}
browser.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	if (request.action==='extractedURL')
		browser.storage.sync.get(
			['token','server'],
			(data)=>postNewURL(request.url,data['token'],data['server'])
		);
	else if (request.query==='setToken')
		browser.storage.sync.set({'token':request.value});
	if (sendResponse!=undefined)
		sendResponse({
			reply:'Thx'
		});
});
function watchSavedUrl()
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
function openHere()
{
	browser.storage.sync.get(
		['token','server'],
		(data)=>{
			if (data['server']===undefined||data['server'].length<1)
				return browser.runtime.openOptionsPage();
			browser.tabs.create({url:data['server']+'/swap.html?nocache='+Date.now()});
		}
	);
}
function initUrlExtracting(tab)
{
	browser.scripting.executeScript(
		{
			target: {tabId:tab.id},
			files: ['/inject.js']
		},
	).then(()=>browser.tabs.query({active: true, currentWindow: true}, tabs=>{
		browser.tabs.sendMessage(tabs[0].id, {action: 'extractURL'});
	}));
}
browser.contextMenus.removeAll();
browser.contextMenus.create({
	id: "1",
	title: "Open here",
	contexts: ["action"]
});
browser.contextMenus.create({
	id: "2",
	title: "Save this url",
	contexts: ["action"]
});
browser.contextMenus.create({
	id: "3",
	title: "Watch saved url",
	contexts: ["action"]
});
browser.action.onClicked.addListener(initUrlExtracting);
browser.contextMenus.onClicked.addListener((data, tab)=>{
	if(data['menuItemId']=='1')
		openHere();
	if(data['menuItemId']=='2')
		initUrlExtracting();
	if(data['menuItemId']=='3')
		watchSavedUrl();
});