### Superfast setup

1. Install Node.js.
2. Download this repository.
3. Run `npm install`.
4. Run `node index.js`.
5. Open http://127.0.0.1/.
6. **Enter your account credentials** at profile page.
7. Pick a booru.
8. Pick a project.
9. Start tagging.

# What is this
MTS is a browser-based tool that speeds up manual tagging on a selection of boorus, while giving the ability to add more boorus and custom tagging projects.\
This aims to make manual tagging on any booru less of a pain and more of a grind while still adding useful tags that posts often lack\
It's faster and easier, and helps boorus get the missing tags their posts need
# How does it work
This uses axios to call the selected booru API and send/retrieve data, that being searches and post updates.
The booru API is configured inside booruList.json, where you can manually edit and add any booru you want (given that you know how it works)
## Project
A project is a way of searching posts that lack tags that they need, and applying them, fast, easy, and moving to the next post in just seconds.
<details>
<summary>Examples</summary>
Take for example, number of characters. Many, MANY posts on all boorus lack proper number of characters tagging. either be solo, duo, trio, a group, or individual counts such as 1boy 1girl 1other etc etc, many posts lack these tags, making them impossible to find when searching.

Other example, is dimensions. Is the work 2d or 3d? many posts lack 2d or 3d tags, making it impossible to fully search for one or the other.

Other could be medium. Is it traditionally hand drawn, is it digital, is it ai generated? Again, many posts lack these tags

Is the gif animated? some posts uploaded as .gif are just a static image, mistagged as `animated`, or many animated posts lack the `animated` tag

Or just keep the most frequent tags at hand while still being able to manually write the tags you want to add

You can find more examples on the project lists on each booru project.json
</details>


# Prerequisites (one-time things)

## Node.js

You'll need Node.js installed to use this tool.\
Download it from [nodejs.org](https://nodejs.org/en/download). You can either use the installer or grab the standalone binary if you prefer.

## accounts.json

Rename `accounts.example.json` to `accounts.json`.
<details>
<summary>UA (User Agent)</summary>

Some boorus require a User-Agent, either to identify requests or to validate cookies.\
Every entry already includes an `UA` field.\
If its prefilled, try to not change it.\
If its empty, paste your own User Agent ([Google search](https://www.google.com/search?q=What%27s+my+user+agent))

</details>

<details>
<summary>Cookies</summary>

Not every booru needs cookies, so you won't always see a `cookies` field.\
The cookie you need is named inside the cookie entry.\
Cookies expire, so if access suddenly stops working, logging into the site again and updating the cookie usually fixes it.\
If a booru doesn't have a `cookie` field, leave it that way. There's no need to add one.

</details>

> [!IMPORTANT]
> Only boorus that already include a `cookie` field require one.

> [!TIP]
> Eventually this will be handled through an in-app editor, so you won't have to edit `accounts.json` by hand anymore.

# Using it
First, one time only:
1. Download this repo as a .zip
2. Extract in any empty folder
3. run `npm i` to install dependencies
-------
Then, everytime you want to start the tool:
1. Open CMD, Powershell, bash, or any console you use
2. Navigate to where the files are (or right click folder - "Open terminal here")
3. Run `node index.js` to start the server
4. Open a browser and go to http://127.0.0.1/
----------
This to save credentials:
1. Click Account Management
2. Fill your booru username and Api Keys
3. Save
4. Click MTS to go home
----------
After that, its only this:
1. Choose a booru
2. Choose a project
3. Select an option
4. Start tagging

# Adding more boorus
inside data/collection you will see a json file\
That file is one booru.\
To add more boorus, you need to create another json file, and put inside the same that's on the file that's already created, and edit it for that booru, things like name, api endpoints, response schema, etc.\
Once that is done, copypaste a random project from any other booru, editing it to suit that booru, and test it on the webpage.\
Or if you already have a file (shared, downloaded, created) just put it inside data/collection with their name as the file name plus `.json` and that's it.\
Test it and correct it until it works