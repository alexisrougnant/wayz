
/* main :
- creation of the gae instance and the different states and start the boot state
- creation of an abilia instance and definition of several request functions
- instantiation of the different global variables
- get query variables : device diagonal sizem, server id and client id : /?SCREEN=xxxxxx&CLIENT_ID=xxxxxxx&SERVER_ID=xxxxxx
- handle the fullscreen button
- handle the rotate screen screen
- handle the destruction of the game logo screen after the game is created and the first state started
- definition of some functions related to the video playing used in the gameover state as a wrokaround to the phaser video element which does not work well on tablet..
*/



// Create a new game instance 
//Surface : 1920 x 1080
//tablets : 1024 x 768
//Galaxy tab 3 : 1024 x 600 169ppi
//var game = new Phaser.Game(1920, 1080, Phaser.AUTO, '');
//var game = new Phaser.Game(1024, 600, Phaser.AUTO, ''); //original resolution galxy tab 3
var game = new Phaser.Game(512, 300, Phaser.AUTO, '#game'); //1/2 original resolution galaxy tab 3

// First parameter is how our state will be called.
// Second parameter is an object containing the needed methods for state functionality
//game.state.add('SplashScreen', SplashScreen);
game.state.add('Boot', bootState);
game.state.add('ChooseActivity',chooseActivityState);
game.state.add('Load', loadState);
game.state.add('Menu', menuState);
game.state.add('Play', playState);
game.state.add('GameOver', gameOverState);
game.state.add('Scoring',scoringState);

$(document).ready(function(){
	//current time
	var t = Date.now();
	//DEVICE ORIENTATION ALERT
	//orientation events
	$(document).on('click', "#icon-fs",function(event) {
		toggleFullScreen();
	});
	window.addEventListener("orientationchange", function() {
	  // Announce the new orientation number
	  orientationAlert(window.orientation);
	}, false);
	//call the orientation alert at the beginning
	orientationAlert(window.orientation);

	//VIDEO HANDLING
	$(document).on('click', "#video",function(event) {
		togglePlayVid();
	});
	//SOME MOBILE DEVICE PREVENTION
	//enable the vibrate API
	if (("vibrate" in navigator || "mozVibrate" in navigator) && !("vibrate" in navigator)){
	    navigator.vibrate = navigator.mozVibrate;
	}
	//enable the fast click api
	$(function() {
		FastClick.attach(document.body);
	});
	//prevent standard behaviour
	$(document).on('dragstart', function(event) {
		event.preventDefault();
	});
	 $(document).on('click', function(event){
		event.preventDefault();
	});
	//START THE GAME
	//update the id of the activity, the server id, the client id, 
	//for the study we don't need that game.global.activity_id = getQueryVariable("ACT_ID");
	server_id = getQueryVariable("SERVER_ID");
	if(server_id.length  > 0){
		game.global.server_id = server_id; 
	}
	client_id = getQueryVariable("CLIENT_ID");
	if(client_id.length > 0){
		game.global.client_id = client_id;
	}

	//SCREEN SIZE
	var screenSize = getQueryVariable("SCREEN");
	if(screenSize.length == 0){
		//screenSize = 12.9; //Dimension of the bigger screen among the most common tablets (iPad Pro)
		screenSize = 7; //Dimension of the galaxy tab 3
	}
    //convert the inch value to cm
    var diag = screenSize*2.54;
    //ratio width/height of the screen
    var r = screen.width/screen.height;
    //width of the screen in cm
    var screenWidth = diag*Math.sqrt(1/(1+1/(r*r)));
    //pixel per cm ratio
    game.global.pxpcm = game.width/screenWidth;

	//create an instance of abilia and set credentials
	window.abilia = new Abilia();
	abilia.setCredentials("email","token");
	//get the activities of the app
	getActivitiesFromApp(
		function(){
			//time from the start of the game and now
			var delta = Date.now() - t;
			//delay after which the first state is started (independant of the time it took to access abilia or whatever)
			var timeOut = Math.max(0,1000-delta);
			setTimeout( function(){
				game.state.start('Boot');
				//fade out of the WAYZ image
				$("#wayz-img").fadeTo(1000,0,function(){
					$("#wayz-screen").remove();
				})
			}
				, timeOut)
			
		}
	);
});

//global data
game.global = {
	//SESSION INFORMATION
	app_id : "APP_19HSRV",
	activity_id: "« activity_id* »",
	server_id: "« server_id* »",
	client_id: "« client_id* »",
	start_configuration: "« start_configuration »",
	live_configuration: "« live_configuration »",
	notes: "« notes »",
	data: "« data* »", //session log and result 
	dateStart: "« dateStart* »",
	dateEnd: "« dateEnd* »",

	//ACTIVITIES
	//list of levels activity ids, ordered in the order they have to be played
	actList : [],
	//correspinding title of the activites
	actTitle :[],
	//pointer used in the choosing state to store the first activity displayed on the current screen
	activityPointer : 0,

	//PATH
    //TYPE=BOOL -- i,f the path is displayed or not (if not it is considered entirely flat)
    showPath : true,
    //TYPE=BOOL -- show the outline of the path
    outlinePath : true,
    //TYPE=INT -- number of each pattern in the path 
    nTriangle : 1,
	nFlat : 1,
	nCurve : 1,
    //TYPE={"Normal", "Alternate", "Random"} -- Order of the pattern in the paths "Normal", "Alternate" or "Random"
    //Normal = The patterns are grouped by kind ex: Curves -> Flats -> Triangles
    //Alternate = The patterns are alternating ex: curve -> flat -> triangle -> curve -> flat -> ...
    //Random = the patterns are postioning randomly
    patternOrder : "Normal",
    //TYPE=INT[1,3] -- Position of each pattern for the "Alternate" and "Normal" ordering
    //Two different patterns can't have the same position
    pTriangle : 1,
	pFlat : 2,
	pCurve : 3,
	//TYPE=BOOL -- Add or not an flat part at the beginning/end of the path 
	initialFlat : false,
	endFlat : false,
    //TYPE=INT[0,10] -- height of the path 
    patternHeight : 5,
	//TYPE=INT[0,10] -- length of the path 
    pathLength : 10,
	//TYPE=INT[0,10] -- size of the path 
    pathSize : 3,
    //TYPE=INT[0,10] -- size of the path outline
    outlinePathSize : 0.3,
    //TYPE="#HEXHEX" -- color of the path
    pathColor : "white",
    //TYPE="#HEXHEX" -- color of the path outline
    outlinePathColor : "#A25B58",

	//DRAWING
    //TYPE=INT[0,10] -- size of the drawing 
    drawingSize : 1,
    //TYPE="#HEXHEX" -- color of the child drawing 
    drawingColor : '#d61b0a',
    //TYPE="#HEXHEX" -- color of the supervisor drawing
    drawingColorSupervisor : 'white',

	//FEEDBACKS
    //TYPE=BOOL -- if it is true, the source image can be dragged
    drag : false,
    //TYPE=BOOL -- if it is true, at the end of the game, the source image follows the path til the destination
    endSourceAnimation : false,
    //TYPE=BOOL -- if it is true, the game ends when you draw around the destination position
    automaticEnd : false,
    //TYPE=BOOL -- if it is true, the audio is enable (buzzer when drawing out of the path)
    audioEnable : false,
    //TYPE=BOOL -- if it is true, the vibration is enable (vibrate when drawing out of the path)
    vibrationEnable : true,
    //TYPE=BOOL -- if it is true, the drawing out of the path is displayed
    displayOutDrawing : true,
    //TYPE=BOOL -- if it is true, the drawing is displayed
    displayDrawing : true,

	//REWARDS
    //some conflicts might appear if several are selected at the same time 
    //TYPE=BOOL -- enable the video reward
    videoReward : false,
    //TYPE=BOOL -- enable the image reward
	imageReward : true,
	//TYPE=BOOL -- enable the audio reward
	audioReward : true,
	//TYPE=STRING -- path to access the image that is displayed at the end of the game
    rewardImageLocation : './img/minion1.png',
   //TYPE=STRING -- path to access the video that is played at the end of the game
    rewardVideoLocation : "./video/minions1.mp4",
    //TYPE=STRING -- path to access the sound that is played at the end of the game
    rewardAudioLocation : "./sounds/reward.wav",

	//EVALUATION DATA
	//TYPE=ARRAY(INT,INT) -- variable to store the path for each player
	path : [],
	//TYPE=ARRAY(INT,INT) -- reduced data of the path, useful to perform quick computation
	pathReduced : [],
	//TYPE=ARRAY(INT,INT) -- tangent vectors of the reduced path
	pathTangentVectors : [],
	//TYPE=ARRAY(INT,INT) -- variables to store the drawing data for each of the players
	drawing : [],
	//TYPE=INT -- variable to store the evaluation criteria for each of the players
	nbMissing : 1000,
	rateMissing : 100,
	distanceMissing : 0,
	nbOut : 0,
	rateOut : 100,
	distanceOut : 0,
	drawingNbStrokes : 0,
	lengthDrawing : 0,
	drawingDiscontinuity : 0,
	drawingAngle : 0,
	nbEdge : 0,
	result : 0,
	//OTHERS
    //TYPE="#HEXHEX" -- the color of the background and the path
	backgroundColor : "#aded80",//"#000000",//
	//TYPE=STRING -- path to access the source image
	sourceImage : "./img/bug.png",
	//TYPE=FLOAT(>=0) -- size of the source figure in cm (if height and width are not equals, it is the size of the biggest)
	sourceImageSize : 2,
	//TYPE=FLOAT(>=0) -- width of the source figure in cm (if height and width are not equals, it is the size of the biggest)
	//it is a standard value, it's been re-computer aftewards.
	sourceImageWidth : 0.5,
	//TYPE=STRING -- path to access the end image
	endImage : "./img/house-mushroom.png",
	//TYPE=FLOAT(>=0) -- size of the end figure in cm (if height and width are not equals, it is the size of the biggest)
	endImageSize : 2,
	//TYPE=FLOAT(>=0) -- width of the end figure in cm (if height and width are not equals, it is the size of the biggest)
	//it is a standard value, it's been re-computer aftewards.
	endImageWidth : 0.5,
	//maximum width of the images source and destination, has a security role if the activity comes with two big images width parameters
	widthImageMax : 1.2,
	//padding before the source and after the destination
	padding : 1.7 
}


//update the configuration of the activity with respect to the configuration json of the activity
function applyConfiguration(configuration,callback){
	var json = JSON.parse(configuration);
	//path
	game.global.showPath = json.path.show;
	game.global.outlinePath = json.path.showOutline;
	game.global.nTriangle = json.path.nTriangle;
	game.global.nFlat = json.path.nFlat;
	game.global.nCurve = json.path.nCurve;
	game.global.patternOrder =json.path.patternOrder;
	game.global.pTriangle = json.path.pTriangle;
	game.global.pFlat = json.path.pFlat;
	game.global.pCurve = json.path.pCurve;
	game.global.initialFlat = json.path.initialFlat;
	game.global.endFlat = json.path.endFlat;
	game.global.patternHeight = json.path.height;
	game.global.pathLength = json.path.length;
	game.global.pathSize = json.path.size;
	game.global.outlinePathSize = json.path.outlineSize;
	game.global.pathColor = json.path.color;
	game.global.outlinePathColor = json.path.outlineColor;
	//drawing
	game.global.drawingSize = json.drawing.size;
	game.global.drawingColor = json.drawing.colorChild;
	game.global.drawingColorSupervisor = json.drawing.colorSupervisor;
	//feedbacks
	game.global.drag = json.feedbacks.drag;
	game.global.endSourceAnimation = json.feedbacks.endSourceAnimation;
	game.global.automaticEnd = json.feedbacks.automaticEnd;
	game.global.audioEnable = json.feedbacks.audioEnable;
	game.global.vibrationEnable = json.feedbacks.vibrationEnable;
	game.global.displayOutDrawing = json.feedbacks.displayOutDrawing;
	game.global.displayDrawing = json.feedbacks.displayDrawing;
	//rewards
	game.global.videoReward = json.rewards.videoReward;
	game.global.imageReward = json.rewards.imageReward;
	game.global.audioReward = json.rewards.audioReward;
    game.global.rewardImageLocation = json.rewards.rewardImageLocation;
    game.global.rewardVideoLocation = json.rewards.rewardVideoLocation;
    game.global.rewardAudioLocation = json.rewards.rewardAudioLocation;
    //other
    game.global.backgroundColor = json.backgroundColor;
    game.global.sourceImage = json.sourceImage;
    game.global.sourceImageSize = json.sourceImageSize;
    game.global.endImage = json.endImage;
    game.global.endImageSize = json.endImageSize;
    callback();
    return false;
}

//enable/disable fullscreen
function toggleFullScreen() {
        var doc = window.document;
        var docEl = doc.documentElement;

        var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
            requestFullScreen.call(docEl);
        }
        else {
            cancelFullScreen.call(doc);
        }
    }

//display an alert that asks the user to rotate its device
function orientationAlert(orientation){
	if(orientation==0){
		$("#orientation-alert").fadeTo(0.5,0.9);
	}
	else{
		$("#orientation-alert").fadeTo(0.5,0);
	}
};


//get a variable from the url 
function getQueryVariable(variable)
{
   var query = window.location.search.substring(1);
   var vars = query.split("&");
   for (var i=0;i<vars.length;i++) {
           var pair = vars[i].split("=");
           if(pair[0] == variable){return pair[1];}
   }
   return "";
}

//get an activity from its id and start it
function startActivity(activity_id){
	getActivity(activity_id,function(){
		applyConfiguration(game.global.start_configuration, function(){
			//game.state.start('Boot');
			game.state.start('Load');
	    });
	});
}

//get an activity from its id and call a callback function
function getActivity(activity_id,callback){
	//get the corresponding activity
	var request="getActivity";
	var data= JSON.stringify(
		{
		"id": activity_id
		});
	abilia.query(request,data,success,error);

	//succcess callback
	function success(response){
	    console.log(response);
	    //store the configuration
	    game.global.start_configuration = response.data[0].configuration;

	    callback();
	};
	//error callback
	function error(request, error){
	    console.log(request+" : "+error);
	};
	return false;
}

//log a single activity session
function logSession(app_id,activity_id,server_id,client_id,start_configuration,live_configuration,notes,data,dateStart,dateEnd){
    var request = "logSession";
    var dataRequest = JSON.stringify(
    {
        "app_id": app_id,
        "activity_id": activity_id,
        "server_id": server_id,
        "client_id": client_id,
        "start_configuration": start_configuration,
        "live_configuration": live_configuration,
        "notes": notes,
        "data": data,
        "dateStart": dateStart,
        "dateEnd": dateEnd
    });

    abilia.query(request,dataRequest,success,error);

    //succcess callback
    function success(response){
        console.log(response);
    };
    //error callback
    function error(request, error){
        console.log(request+" : "+error);
    };
    return false;
}

//get all the activities of the application
function getActivitiesFromApp(callback){
    var request = "getAllActivitiesFromApp";
    var dataRequest = JSON.stringify(
    {
	"app_id": game.global.app_id
    });

    abilia.query(request,dataRequest,success,error);

    //succcess callback
    function success(response){
        console.log(response);
        var responseData = response.data;
        for(var i=0; i<responseData.length; i++){
			game.global.actList.push((responseData[i]).id);
			game.global.actTitle.push((responseData[i]).title);
		}
		callback();
    };
    //error callback
    function error(request, error){
        console.log(request+" : "+error);
        alert("Abilia access problem, please verify your internet connection");
    };
    return false;
}

//VIDEO
//start/stop the video media
function togglePlayVid(){
	var vid = document.getElementById("video");
	if(vid.paused){
	    vid.play(); 
	    $('#videoDiv').css('width','100%');
	    $('#videoDiv').fadeTo(0,1);
	    $('#videoCommand').fadeTo(0,0);
	}
	else{
		vid.pause();
		$('#videoDiv').css('width','75%');
		$('#videoCommand').fadeTo(0,0.7);
	}
}

//scale down and fade the video media
function videoEnd(){
	$('#videoDiv').css('width','75%');
	$('#videoCommand').fadeTo(0,0.7);
}