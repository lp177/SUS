'use strict';

const confirmBeforeSave177 = false;

function purposeUrl(url)
{
	return (confirmBeforeSave177)?confirm( 'Do you want switch url:\n' + url ):true;
}

function extractTwitchWithCurrentTime()
{
	var ct = document.querySelector('p[data-a-target="player-seekbar-current-time"]'),
		urlGenerated = document.querySelector('meta[property="og:url"]') && document.querySelector('meta[property="og:url"]').content.split('?')[0],
		tc = '';

	if (!ct || !urlGenerated)
		return;

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
	s.innerText = "const getVideoUrl177 = (document.getElementById('movie_player')) ? document.getElementById('movie_player').getVideoUrl() : null;document.body.setAttribute( 'getvideourl177', getVideoUrl177 )";
	(document.head||document.documentElement).appendChild(s);
	return document.body.getAttribute( 'getvideourl177' );
}

function extractURL()
{
	var generatedUrl = null;

	if (window.location.href.startsWith('https://soundcloud.com/'))
		generatedUrl = extractSoundcloudWithCurrentTime();
	else if (window.location.href.startsWith('https://www.twitch.tv/'))
		generatedUrl = extractTwitchWithCurrentTime();
	else if (window.location.href.startsWith('https://youtube.com/') || window.location.href.startsWith('https://www.youtube.com/') || window.location.href.startsWith('https://m.youtube.com/'))
		generatedUrl = extractYoutubeWithCurrentTime();

	if (!generatedUrl)
	{
		if (purposeUrl(window.location.href))
			generatedUrl = window.location.href;
		else
			return;
	}

	chrome.runtime.sendMessage(
		{action: 'extractedURL', generatedUrl: generatedUrl},
		function(response)
		{
			console.info('Extension response: ', response.reply);
		}
	)
}
if (window.urlSwapperInjected !== true)
{
	window.urlSwapperInjected = true
	chrome.runtime.onMessage.addListener(function(msg)
	{
		if (msg.action === "extractURL")
			extractURL();
	});
}