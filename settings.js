'use strict';
if (typeof browser==='undefined')
	var browser=chrome;
document.querySelector('button').addEventListener('click',()=>{
	browser.storage.sync.set({'token':document.querySelector('input[name="token"]').value});
	browser.storage.sync.set({'server':document.querySelector('input[name="server"]').value});
});
const hideSwitch = document.querySelector('.switchide');
hideSwitch.addEventListener('click',()=>{
	if (hideSwitch.innerText==='👀')
	{
		hideSwitch.innerText='👓';
		document.querySelector('input[name="token"]').type='text'
	}
	else
	{
		hideSwitch.innerText='👀';
		document.querySelector('input[name="token"]').type='password'
	}
});
browser.storage.sync.get(
	['token','server'],
	(data)=>{
		if (data['token']!=undefined)
			document.querySelector('input[name="token"]').value=data['token'];
		if (data['server']!=undefined)
			document.querySelector('input[name="server"]').value=data['server'];
	}
);