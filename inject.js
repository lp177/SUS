'use strict';
var verbose=false,debugIsFun=console.info;
function purposeUrl(url)
{
	return true;
	// return confirm( 'Do you want switch url:\n' + url );
}

function extractTwitchWithCurrentTime()
{
	const shareButton=document.querySelector('.channel-info-content div[data-test-selector="toggle-balloon-wrapper__mouse-enter-detector"] button:not([data-a-target="follow-button"])');
	if(shareButton)
	{
		if(verbose===true)
			debugIsFun('Probably on video page')
		var tw=document.querySelector('input[data-a-target="tw-input"][readonly]');
		if(!tw)
			shareButton.click();
		const timestampToggler=document.querySelector('#video-share-timestamp-toggle');
		if(!timestampToggler)
			console.warn('timestampToggler not found');
		if(timestampToggler&&timestampToggler.checked!==true)
			timestampToggler.click();
		if(!tw)
			tw=document.querySelector('input[data-a-target="tw-input"][readonly]');
		if(tw)
			return document.querySelector('input[data-a-target="tw-input"][readonly]').value;
		else
			console.warn('No tw input');
	}
	else
		console.warn('Share button not found');
	if(verbose===true)
		debugIsFun('Probably on streamer homepage')
	document.querySelector('.home a.tw-link');
	var ct = document.querySelector('p[data-a-target="player-seekbar-current-time"]'),
	urlGenerated = document.querySelector('.home a.tw-link')&&document.querySelector('.home a.tw-link').href,
	tc = '';

	if (!ct || !urlGenerated)
	{
		if(verbose===true)
			debugIsFun('!ct || !urlGenerated')
		return;
	}

	ct = ct.innerText.split(':');

	if (ct.length >= 3)
		tc += ct[0] + 'h';
	if (ct.length >= 2)
		tc += ct[1] + 'm';
	if (ct.length >= 1)
		tc += ct[2] + 's';

	if (tc.length > 0)
		urlGenerated += '?t=' + tc;

	return urlGenerated;
}

function extractSoundcloudWithCurrentTime()
{
	const lk = document.querySelector('.playControls .playbackSoundBadge__title a'),
		timev = document.querySelector('.playbackTimeline__timePassed span[aria-hidden]');

	if (!lk || !timev)
		return console.warning('Fail to found current track metadata');

	const urlGenerated = lk.href + '#t=' + timev.innerText;
	if (!purposeUrl(urlGenerated))
		return;
	return urlGenerated;
}

function extractYoutubeWithCurrentTime()
{
	var s = document.createElement('script');
	s.id = 'script177';
	s.src = chrome.runtime.getURL('integrations/youtube.js');
	s.onload = function(){this.remove()};
	(document.head||document.documentElement).appendChild(s);
	const video_url = document.body.getAttribute('getvideourl177');
	return (video_url==='null'||video_url==='https://www.youtube.com/watch')?window.location.href:video_url;
}

function extractGenericAudioWithCurrentTime(timelineSelector,timelineElementToSeconds=(element)=>parseFloat(element.value)*60)
{
	const audioElement = document.querySelector('audio'),timelineElement = document.querySelector(timelineSelector);

	if (!audioElement||!timelineElement)
		return console.warn('Fail to found current track metadata');
	const current_time = timelineElementToSeconds(timelineElement);
	if (!current_time)
		return;
	const urlGenerated = audioElement.src + '#t=' + current_time;
	if (!purposeUrl(urlGenerated))
		return;
	return urlGenerated;
}

function extractURL()
{
	var url = null;

	if (window.location.href.startsWith('https://soundcloud.com/'))
		url = extractSoundcloudWithCurrentTime();
	else if (window.location.href.startsWith('https://www.twitch.tv/'))
		url = extractTwitchWithCurrentTime();
	else if (window.location.href.startsWith('https://youtube.com/') || window.location.href.startsWith('https://www.youtube.com/') || window.location.href.startsWith('https://m.youtube.com/'))
		url = extractYoutubeWithCurrentTime();
	else if (window.location.href.startsWith('https://www.radiofrance.fr/'))
		url = extractGenericAudioWithCurrentTime('div[data-zone="COMPONENT_TIME_START"]', (timelineElement)=>{
			const times = timelineElement.innerText.split(' ')[0].split(':');
			if (times.length>2)
				return (parseInt(times[0])*60*60)+(parseInt(times[1])*60)+parseInt(times[2]);
			else if (times.length==2)
				return parseInt(times[0])*60+parseInt(times[1]);
			return parseInt(times[0]);

		});
	saveUrl(url);
}
function saveUrl(url)
{
	if (!url)
	{
		if (purposeUrl(window.location.href))
			url = window.location.href;
		else
			return;
	}
	chrome.runtime.sendMessage({action: 'extractedURL', url: url})
}
if (window.urlSwapperInjected !== true)
{
	window.urlSwapperInjected = true;
	chrome.runtime.onMessage.addListener(function(msg)
	{
		if (msg.action === "extractURL")
			extractURL();
	});
}