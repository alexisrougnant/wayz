WAYZ

# Introduction

This game has been developed for I3Lab (Politecnico di Milano) as a master's thesis work. It is directed at children with neurodevelopmental disorder in order to assess and improve eye-motor perception disorder. 
It suits also adults NDD and children without NDD.

It consists in a for touch-ready devices (tablets peferably) in which a path is displayed on the screen between two figures. One has to link the two figures in drawing with its finger/stylus from one to the other within a path.
The quality of the line drawn is evaluated afterward and the result of the session can be logged on a server to be subsequently accessible.



# Use

Need of an internet connection to access to the server
Access via the url of the index
3 query variables :
	- SCREEN : size of the diagonal of the device screen (standard : 7")
	- SERVER_ID : index of the server (standard : "server_id")
	- CLIENT_ID : index of the client (standard : "client_id")



# Development Tools

	- javascript
	- HTML
	- CSS
	- Phaser.io
	- Abilia
	- Jquery

The project consists in a Phaser game using WEBGL or Canvas. It is complemented by few HTML elements.
The communication with the server is done using some JQuery requests.



# Main

Instantiation of abilia and definition of abilia request functions
Instantiation of the game and its states
Declaration of the global variables
Start of the first Phaser game state



# Phaser States

- BootState :
Initiate few game elements and set a background color
Start the Choose Activity State (--> ChooseActivityState)

- ChooseActivityState :
Get the list of all activities from Abilia and display them as a list of clickable application titles.
Get the chosen activity data on click (--> LoadState)

- LoadState :
Load all the UI assets and the activity assets.
When load is complete, goes to the menu state (--> MenuState)

- MenuState :
Allow to start the activity (--> PlayState)

- PlayState :
Play state that provide the activity
Set the game according to the activity paramaters
Allow to play the activity in drawing 
Allow to replay using the clear button
Allow to switch to the supervisor mode with the correponding button
Allow to finish the activity with the end button (--> ScoringState)

- ScoringState :
Use the evaluation functions to score what has been done in the play state
Display a hourglass while the processing and goes to the gameover state when the scoring is complete (--> go to GameOverState)

- GameOverState :
According to the score obtained, it provides or not a reward as a video/image/music.
Allow to replay (--> PlayState).
Allow to choose another activity (--> ChoosingState)



# Notes

	- The scoring is based on the Frostig criteria and the reward threshold correspond to 1 or 2 points out of 2 using this very scoring method
	- The video for the reward is handled using an html element on top of the game itself because the phaser video does not work well on tablet for some mysterious reason
	- The play state logic includes a tradeoff between precison and performance and can be adjusted. It uses some timers and threshold variable to enlight the bitmapdata refresh and improve the performances. The path data depends on some precision paramters as well as the drawing data.
	- The evaluation functions and the score criteria are using some threshold variables, to decide whether two points are part of the same stroke for example. Those threshold might be adjusted to refine the scoring element. Also they are linked in some extends to the precision of the drawing data as well as to the fps during the play state
	-  The visual feedback consisting in not displaying the drawing outside of the path has not given good results in an exploratory study on usability. It should be changed to a visual feedback changing the color of the path when drawing out of the path.
	- Make the source follow the drawing at the end of the activity could be an interesting engagement element.
	- Underlining the errors in changing the color of the concerned part of the drawing at the end of the activity could be good for the pedagogy 
