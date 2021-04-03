Switch to many devices like computer and smartphones fluidly and quickly:
for example continue to watch your youtube/soundcloud in keeping the current progression from your current device to another in 2 click.

One left click to the extension icon save the current page to the selected server in option (with current timestamp if managed for this website).

You can now open it by visiting the swap.html file of your server on all other device who you don't have / can't install browser extension  (quick tip: you have mobile browser like Kiwi for install browser extension in android) or rigth click on the extension button and select open here.

You can build your own server in folowing this basic exemple (need to replace MY_TOKEN_KEY_HERE with your random selected token put in extension settings) for [server]/swap.php containing:

 ```php
<?php
$myToken = 'MY_TOKEN_KEY_HERE';
if (isset($_POST['auth_key'],$_POST['data']) && $_POST['auth_key'] === $myToken)
{
	file_put_contents('swap.txt', $_POST['data'], LOCK_EX);
	file_put_contents('swap.html', '<html><body><script>window.location = "'.$_POST['data'].'";</script><body></html>', LOCK_EX);
	header('Access-Control-Allow-Origin: *');
	echo 'ok';
}
else
	header('Location: swap.txt');
```

Curently managed for keep media time (on other website we just save the current url):

https://soundcloud.com
https://www.twitch.tv
https://youtube.com
https://www.franceinter.fr