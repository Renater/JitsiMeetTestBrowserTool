# <p align="center">JitsiTestBrowserTool</p>

<hr />

This tools allows you to take a release for Jitsi test browser page (minify js/css files, pack in one file the app).

<p align="center">
<img src="https://raw.githubusercontent.com/Renater/JitsiMeetTestBrowserTool/master/readme-img1.png" width="500" alt="App screenshot 1" />
</p>

<hr />

> #### /!\ Not working yet!
>
> We are currently working on it, stay in touch ;)


# Getting started
## Environment
### Requirements

To make a release, you need to have at lease:
* php (7.x)
* composer (1.10+)

Then, use **composer install** to get the dependencies.


## Make a new release

To make a new release, you need to run the **make-release.php** scripts.

> To get more information, use **"php make-release.php --help"**

Once done, you will find your unique index.html file containing the test tool. 


## Translate the App

By default, this app is on **english**.
Supported translations are:
* fr (French)
* en (English)

If you want have your own translation, just copy the **lang/en.php** file into your language (example: **du.php**).

Then, re run the make-release.php script with the parameter **--lang=du**