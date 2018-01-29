/* playState : Principal state of the game, it allows to draw on the screen and presents a path, two figures and some UI buttons.
Tha path is displayed as a bitmapdata on which the drawing will be added.
At every frame, the positon of the input is considered and can be added to the drawing, also its position with respect to the path might lead to some feedbacks and an automatic end of the game
The creation of the state includes the declaration of several vriable related to the precision of the path, the drawing, also some time variables used to improve the performances of the game.
The bitmapdata are first created then the path is added, the source and destination sprites as well as the UI buttons are created afterwards.
*/

var playState = {

    update : function() {
    	//check if the player is drawing inside the path and perform some feedbacks actions (audios, display, vibration)
    	this.goalFct();
        //handle the automatic end if enable
    	if(game.input.activePointer.isDown && this.automaticEnd){
	    	this.reachedDest();
	    }
        //If the player is drawing, it stores the coordinates of the drawing.
        //After one point is stored, we wait drawingTimeStep before to store th next time so that the data is not too big.
        if(game.time.time >this.tStart){ //delay after this state started to prevent unvoluntary input
    		if (game.input.activePointer.isDown && this.t<game.time.time) {
            	if(this.drawingEnable){
                    var x = game.input.activePointer.x;
                    var y = game.input.activePointer.y;
                    if(this.inDrawingArea(x,y)){
                        this.addToDrawing();
                    }
                    else{
                        this.strokeOpen=false;
                    }
                }
            }

        }
    },

    create: function () {       
    	//DRAWING PARAMETERS
        //variables that will be used to delay the call of the drawing method in order to enhance the performances and enlight the data
        //will store the current time
        this.t = 0;
        //store the current time plus a delay - that blocks the drawign at the very beginning of the game to prevent some issues
        this.tStart = game.time.time + 500;
        //time variables useful for the vibration
        this.tVibration = 0;
        this.durationVibration = 100;
        //duration, in ms, between two calls of the drawing method
        this.drawingTimeStep = 0;
        //In the drawing process, algorithm interpolate between points to create a single stroke. This distance is the max between two points to be considered the same stroke
        this.strokeDistance2Pts = 1000;
        //precision rate of the interpolation for storing the drawing data
        this.drawingDataPrecision = 1/10;

        //PATH PARAMETERS
        //precision rate of the interpolation for the creation of the path
        this.pathPrecision = 1/1000;
        this.pathReducedPrecision = 1/1000;

    	//FEEDBACK
        //initiate the audio feedback
    	this.wrong = game.add.audio('wrong');
    	this.wrong.loopFull();
    	this.wrong.pause();
        //audio feedback 
        this.audioEnable = game.global.audioEnable;
        //vibration feedback
        this.vibrationEnable = game.global.vibrationEnable;

        //STROKE COUNTER
        //Count the number of strokes composing the drawing
        //We count a line when it took at list a given time to be drawn so that we avoid to count some random point as a line
        this.strokeDurationMin = 100;
        //stroke counter
        this.nbStrokes=0;
        //store the last input time
        this.inputDownTime=0;
        //boolean that says if a stroke is open, after too long or after a tpo far input, a stroke is considered closed 
        this.strokeOpen=false;
        //input up event
        game.input.onUp.add(this.inputUp,this);
        //variables that will store the last input
        this.xPrev;
        this.yPrev;

        //GOALS
        //define the goal value aka the distance from the middle of the path below which a point is considered inside the path
        this.goal=game.global.pathSize/2;

        //DRAWING VARIABLES
        //variable where the drawings will be saved
        this.drawing=[];
        this.displayDrawing=game.global.displayDrawing;
        //color of the drawings
        this.drawingColor=game.global.drawingColor;
        //if the child mode is enable
        this.childModeEnable=true;
        //if the drawing is enable
        this.drawingEnable=true;
        //automatic End Mode
        this.automaticEnd=game.global.automaticEnd;

        //BMD
        //variables of images data used to display the path and the drawing
        //blank bmd keep a state of the image without any drawing, useful to clear the board
        //drawing bmd will be modified while drawing
        this.bmdBlank = this.add.bitmapData(this.game.width, this.game.height);
        var backgroundColor = Phaser.Color.hexToColor(game.global.backgroundColor);
        this.bmdBlank.fill(backgroundColor.r,backgroundColor.g,backgroundColor.b);
        this.bmdDrawing = this.add.bitmapData(this.game.width, this.game.height);

        //UI SPRITES DIMENSION
        var coefBtn = 11;
        this.btnSize = Math.min(game.width/coefBtn, game.height/coefBtn);

        //FIGURES WIDTH
        //compute the width of the figure from its size (maximum between width and height)
        //maximum width allowed
        var widthMax = game.global.widthImageMax;
        var spriteSourceName = 'source';
        var spriteDestName = 'destination';
        //set width for the source
        if(this.game.cache.checkImageKey(spriteSourceName)){
            var image = game.add.sprite(0,0,spriteSourceName);
            //get the width and height of the file 
            var width = image.width;
            var height = image.height;
            //maximum size in pixel of height and width
            var imgSize = game.global.sourceImageSize;
            //compute the value in pixel 
            var newWidth;
            if(width>height){
                newWidth = Math.min(imgSize,widthMax);
            }
            else{
                newWidth = Math.min(imgSize*width/height,widthMax);
            }
            game.global.sourceImageWidth=newWidth;
            image.destroy(true);
        }
        //set width for the destination
        if(this.game.cache.checkImageKey(spriteDestName)){
            var image = game.add.sprite(0,0,spriteDestName);
            //get the width and height of the file 
            var width = image.width;
            var height = image.height;
            //maximum size in pixel of height and width
            var imgSize = game.global.endImageSize;
            //compute the value in pixel 
            var newWidth;
            if(width>height){
                newWidth = Math.min(imgSize,widthMax);
            }
            else{
                newWidth = Math.min(imgSize*width/height,widthMax);
            }
            game.global.endImageWidth=newWidth;
            image.destroy(true);
        }

        //PATHS
        //draw the path on bmdBlank
        this.setPaths();
        //copy the data of bmdBlank to bmdDrawing
        this.bmdDrawing.copy(this.bmdBlank);
        //display bmdDrawing and thus the paths
        this.bmdDrawing.addToWorld();

        //SPRITES
        //set the sprites source and destination
        this.setSprites();

        //UI
        //set the END button
        this.endBtn();
        //Set the CLEAR button
        this.clearBtn();
        //Set the CHILDMODE button
        this.childModeBtn();

        //set the start date
        var d = new Date();
        dString = d.getFullYear()+'/'+(d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours() + ':' +d.getMinutes() + ':'+d.getSeconds();
        game.global.dateStart = dString;    
    },



    setPaths: function(){
        //creation of the two sets of data describing the path, the second one is reduced to offer better performances for some demanding computations
        var nTriangle = game.global.nTriangle;
        var nFlat = game.global.nFlat;
        var nCurve = game.global.nCurve;
        var pTriangle = game.global.pTriangle;
        var pFlat = game.global.pFlat;
        var pCurve = game.global.pCurve;
        var pathLength = game.global.pathLength;
        var patternHeight = game.global.patternHeight;
        var patternOrder = game.global.patternOrder;
        var initialFlat = game.global.initialFlat;
        var endFlat = game.global.endFlat;
        var outlinePath = game.global.outlinePath;
        //padding before and after the figures
        var padding = game.global.padding;
        //size of the source sprite plus a padding
        var xmin = padding+game.global.sourceImageWidth;
        //size of the screen minus the size of the destination sprite minus a padding
        var xmax = game.width-padding-game.global.endImageWidth;

        //an invisible path is assumed a flat path
        var showPath = game.global.showPath;
        if(!showPath){
            nTriangle = 0;
            nFlat = 1;
            nCurve = 0;
        }
        var vSource=10/20;
        var vDest=10/20;            
        var y0 = vSource*game.height;
        var yf = vDest*game.height;
        //length of the path in px
        var lpx = Math.min(xmax-xmin, pathLength);
        //horizontal coordinates of the beginning and end of the path, centered between xmin and xmax
        var x0 = xmin + ((xmax-xmin)-lpx)/2;
        var xf = xmin + ((xmax-xmin)-lpx)/2 + lpx;

        //create the path using the different parameters 
        var paths = createPath(this,x0,y0,xf,yf,game.height,game.width,nTriangle,nFlat,nCurve,pTriangle,pFlat,pCurve,patternHeight,patternOrder,initialFlat,endFlat,this.pathPrecision, this.pathReducedPrecision);
        //path with better precision for the display purpose
        this.path=paths[0];
        //path with a lower precision for quick computations purpose
        this.pathReduced=paths[1];
        //tangent of the path coorepsonding to the reduced data
        this.pathTangentVectors=paths[2];

        //display the path
        var pathSize = game.global.pathSize;
        var insidePathSize = Math.max(1,pathSize - 2*game.global.outlinePathSize);
        var path = this.path;
        var pathColor = game.global.pathColor;
        var outlinePathColor = game.global.outlinePathColor;
        var backgroundColor = game.global.backgroundColor;
        var xPrev = 0;
        var yPrev = 0;
        //the 2 loops are used to set the outline then the path. Basically the outline is drawn on the bmd as a plain path and the path is drawn on top of it afterwards
        for (var k=0; k<2; k++){
            //loop over the path points, every point is drawn as  circle and a line is drawn between two consecutive points
            for (var j=0; j<path.length; j+=1){
                var x = path[j][0];
                var y = path[j][1];
                if(j>0 && showPath){ //check if the path has to be displayed and start to diplay from the second point of the path
                    if(!outlinePath && k==0){ //if there is no outline and if it is the first loop, draw the path
                        //draw a line between each point of the path
                        this.bmdBlank.line(xPrev,yPrev,x,y,pathColor,pathSize);
                        //draw a circle for each point of the path
                        this.bmdBlank.circle(x,y,pathSize/2,pathColor);
                        if(j==1){
                            //draw the first circle 
                            this.bmdBlank.circle(xPrev,yPrev,pathSize/2,pathColor);
                        }
                    }
                    else{
                        //draw the outline
                        if(k==0){ 
                            //draw a line between each point of the path
                            this.bmdBlank.line(xPrev,yPrev,x,y,outlinePathColor,pathSize);
                            //draw a circle for each point of the path
                            this.bmdBlank.circle(x,y,pathSize/2,outlinePathColor);
                            if(j==1){
                                //draw the first circle 
                                this.bmdBlank.circle(xPrev,yPrev,pathSize/2,outlinePathColor);
                            }
                        }
                        //draw the path 
                        else{
                            //draw a line between each point of the path
                            this.bmdBlank.line(xPrev,yPrev,x,y,pathColor,insidePathSize);
                            //draw a circle for each point of the path
                            this.bmdBlank.circle(x,y,insidePathSize/2,pathColor);
                            if(j==1){
                                //draw the first circle 
                                this.bmdBlank.circle(xPrev,yPrev,insidePathSize/2,pathColor);
                            }
                        }
                    }
                }
                xPrev = x;
                yPrev = y;
            }
        }

        //clear the begining and the end of the path on the screen so that the figures and the path are not overlapping
        var x = path[0][0]-pathSize;
        var y = 0;
        var w = pathSize;
        var h = game.height;
        this.bmdBlank.rect(x,y,w,h, backgroundColor);
        x = path[path.length-1][0];
        this.bmdBlank.rect(x,y,w,h, backgroundColor);
    },

    //SET SPRITES
    setSprites: function(){
        //boolean for the drag feature 
		var drag = game.global.drag;
        var pathLength = game.global.pathLength;
		//sprites name
		var spriteSourceName = 'source';
		var spriteDestName = 'destination';

		//horizontal positions
        //padding before and after the images in pixels
        var padding = game.global.padding;
        //size of the source sprite
        var xmin = padding+game.global.sourceImageWidth;
        //size of the screen minus the UI minus the size of the destination sprite
        var xmax = game.width-padding-game.global.endImageWidth;
        //lentgh in pixel of the path taking into account the constraints xmin and xmax
        var lpx = Math.min(xmax-xmin, pathLength);
        this.xSource = xmin +((xmax-xmin)-lpx)/2;
        this.xDest = xmin + ((xmax-xmin)-lpx)/2 + lpx;

    	//vertical positions
        var vSource=5/10;
        var vDest=5/10;
		this.ySource = vSource*game.height;
		this.yDest = vDest*game.height;

		//set the source sprite
        if(this.game.cache.checkImageKey(spriteSourceName)){ //check if the figure is defined
    		this.source = game.add.sprite(this.xSource,this.ySource,spriteSourceName);
        	this.source.anchor.setTo(1,0.5);
            //set the scale
            var width = this.source.width;
            var height = this.source.height;
            var imgWidth = game.global.sourceImageWidth;
            var scale = imgWidth/width;
	        this.source.scale.setTo(scale);
            //enable the drag of the source
            if(drag){
                this.source.inputEnabled = true;
                this.source.input.enableDrag();
            }
        }
        //set the destination sprite
        if(this.game.cache.checkImageKey(spriteDestName)){ //check if the figure is defined
            this.dest = game.add.sprite(this.xDest,this.yDest,spriteDestName);
            this.dest.anchor.setTo(0,0.5);
            var width = this.dest.width;
            var height = this.dest.height;
            var imgWidth = game.global.endImageWidth;
            var scale = imgWidth/width;
	        this.dest.scale.setTo(scale);
        }
    },

    //END BUTTON
    //Set the end button
    endBtn: function(){
		//set the sprite
		var spriteName = 'endBtn';
		var h=19/20;
		var v=18/20;
    	var x = h*game.width;
		var y = v*game.height;
    	this.btnEnd = game.add.sprite(x,y,spriteName);
    	this.btnEnd.anchor.setTo(0.5,0.5);
        //set the scale
        var width = this.btnEnd.width;
        var height = this.btnEnd.height;
        var scale = Math.min(this.btnSize*1.5/width,this.btnSize*1.5/height);
        this.btnEnd.scale.setTo(scale);
        this.btnEnd.tint = parseInt('0x'+'000000');
        this.btnEnd.alpha = 0.4;
        //enable the input
        this.btnEnd.inputEnabled = true;
        this.btnEnd.events.onInputDown.add(this.endFct, this);
    },

    endFct : function(){
        this.destroy();
        var d = new Date();
        dString = d.getFullYear()+'/'+(d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours() + ':' +d.getMinutes() + ':'+d.getSeconds();
        game.global.dateEnd = dString;
        //store all the drawing and path data for further use
        game.global.path=this.path;
        game.global.pathReduced=this.pathReduced;
        game.global.pathTangentVectors=this.pathTangentVectors;
        game.global.drawing=this.drawing;
        game.global.drawingNbStrokes=this.nbStrokes;
        //start the scoring state
        game.state.start('Scoring');
    },

    


    // CLEAR BUTTON
    //Set the clear button
    clearBtn: function(){
		//set the sprite
		var spriteName = 'clearBtn';
		var h=19/20;
		var v=6.5/20;
    	var x = h*game.width;
		var y = v*game.height;
    	this.btnClear = game.add.sprite(x,y,spriteName);
    	this.btnClear.anchor.setTo(0.5,0.5);
        //set the scale
        var width = this.btnClear.width;
        var height = this.btnClear.height;
        var scale = Math.min(this.btnSize/width,this.btnSize/height);
        this.btnClear.scale.setTo(scale);
        this.btnClear.tint = parseInt('0x'+'000000');
        this.btnClear.alpha = 0.4;
        //enable the input
        this.btnClear.inputEnabled = true;
        this.btnClear.events.onInputDown.add(this.clearFct, this);
    },

    clearFct : function(){
        //reinitialize the drawing data
    	this.drawing.length = 0;
    	this.nbStrokes=0;
    	//reload the free-of-drawing screen   	
        this.bmdDrawing.copy(this.bmdBlank,0,0,game.width,game.height);
    },


    // CHILDMODE BUTTON
    //Set the childMode button
    childModeBtn: function(){
		var childModeEnable = this.childModeEnable;
		//set the sprite
		var spriteName = '';
        var color = '';
		if(childModeEnable){
    		spriteName += "child";
    	}
    	else{
    		spriteName += "supervisor";
    	}
        //position
		var h=19/20;
		var v=4/20;
    	var x = h*game.width;
		var y = v*game.height;
        //create sprite
    	this.btnChildMode = game.add.sprite(x,y,spriteName);
    	this.btnChildMode.anchor.setTo(0.5,0.5);
        //set the scale
        var width = this.btnChildMode.width;
        var height = this.btnChildMode.height;
        var scale = Math.min(this.btnSize/width,this.btnSize/height);
        this.btnChildMode.scale.setTo(scale);
        this.btnChildMode.tint = parseInt('0x'+'000000');
        this.btnChildMode.alpha = 0.4;
        //enable the input
        this.btnChildMode.inputEnabled = true;
        this.btnChildMode.events.onInputDown.add(this.childModeFct, this);
    },

    childModeFct: function(){
    	//update the child mode
    	this.childModeEnable = !this.childModeEnable;
    	//destroy the previous buttons
        this.btnChildMode.destroy(true);
    	//create the new button (this is a pretty ugly solution but otherwise it has to be done with animation, i was lazy to get into it)
    	this.childModeBtn();
    	//consequences of the mode change
    	//close the current stroke
    	this.strokeOpen=false;
    	//change the color of the drawing 
    	if(this.childModeEnable){
    		//child color
    		this.drawingColor = game.global.drawingColor;
    	}
    	else{
    		//supervisor color
    		this.drawingColor = game.global.drawingColorSupervisor;
    	}
    },

    inputUp: function() {
    	//position of the last input
    	var x = game.input.activePointer.x;
    	var y = game.input.activePointer.y;
		var childModeEnable = this.childModeEnable;
		//check if the input is in the drawing area
		if(this.inDrawingArea(x,y)){
			//close the current stroke
	        this.strokeOpen=false;
	        if(childModeEnable){
    			var inputDownTime = this.inputDownTime;
		        //if the input sequence lasted long enough, increment the stroke counter
		        if (game.time.time > inputDownTime + this.strokeDurationMin){
		            this.nbStrokes=1;
		        }
		    }
		}
    },


    //DRAWING AREA
    //check if (x,y) is in the drawing area, it returns the corresponding boolean
    //the area is decided so that one cannot draw on the UI
    inDrawingArea: function(x,y){
        var b1 = x< 7/8*game.width;
        var b2 = 8/20*game.height < y;
        var b3 = x< 9/10*game.width;
        var b4 = y < 15/20*game.height;
		return (b1||b2)&&(b3||b4);
    },

    //DRAWING
    addToDrawing : function() {
        //coordinates of the input
    	var x =this.input.activePointer.x;
    	var y = this.input.activePointer.y;
        //get the previous input
        var xPrev = this.xPrev;
        var yPrev = this.yPrev;
        //update the previous input variables
        this.xPrev=x;
        this.yPrev=y;
        //characteristics of the drawing
        var drawingSize = game.global.drawingSize;
        var drawingColor = this.drawingColor;
        var displayDrawing = this.displayDrawing;
        var storeDrawing = this.childModeEnable;
        var childModeEnable = this.childModeEnable;
        //is a stroke being drawing
        var strokeOpen = this.strokeOpen;
        //length of the current drawing
        var len = this.drawing.length;
        //complete the drawing by interpolation if a stroke is open
        if(strokeOpen){
        	//coordinate of the last point of the stroke (=the last point of the drawing)
            //distance between the last point of the stroke and the new one
            var d = Math.sqrt((xPrev-x)*(xPrev-x)+(yPrev-y)*(yPrev-y));
            //if the distance between the points is small enough (same stroke) 
            if(d<this.strokeDistance2Pts){
                //if the storing enable (childMode)
                if(storeDrawing){
                	//linear interpolation between the two points of the stroke for data storing purpose
                    var l = linearPlot(this, [xPrev,x], [yPrev,y],this.drawingDataPrecision);
                    //for each point of the interpolation
                    for (var j=0;j<l.length-1;j+=1){
                		//coordinate of the point
                		var u = l[j][0];
                		var v = l[j][1];
                		//store the point in the drawing data and reinitialize the data counter
                        this.drawing.push([u,v]);
    	            }
                }
	            if(displayDrawing){
		            this.bmdDrawing.line(xPrev,yPrev,x,y,drawingColor,drawingSize);
		            this.bmdDrawing.circle(x,y,drawingSize/2,drawingColor);
                    var t = game.time.time;
                    this.bmdDrawing.draw();
		        }
	        }
	    }
	    else{
	    	if(childModeEnable){
    			//set the inputdown time with the current time 
    			this.inputDownTime=game.time.time;
    		}
    		this.strokeOpen=true;
	    }
        this.t=game.time.time + this.drawingTimeStep;
    },

    //GOAL
    //function called in update that checks anytime if the player is drawing in the path and do some actions in consequence (display, audio feedback)
    goalFct : function(){
        //input
    	var x = this.input.activePointer.x;
    	var y = this.input.activePointer.y;
    	var pointerDown = game.input.activePointer.isDown;
    	if(pointerDown){
    		//feedback parameters
    		var displayOutDrawing=game.global.displayOutDrawing;
	    	//distance from the input to the path
	    	var d = this.lineDistance(x,y,this.pathReduced);
	    	//is the input inside the path ?
	    	var b1 = d<this.goal;
	    	//is the input in the drawing area
	    	var b2 = this.inDrawingArea(x,y);
	    	var success = b1 || !b2;
	    	if(!success){//if the input is not in the path
	    		//play a specific song
	    		if(this.audioEnable){
		    		this.wrong.resume();
		    	}
		    	if(this.vibrationEnable && game.time.time>this.tVibration){
			    	navigator.vibrate(this.durationVibration);
			    	this.tVibration = game.time.time + this.durationVibration;
			    }
                //don't display the drawing out of the path
                if(!displayOutDrawing){
                    this.displayDrawing=false;
                }
	    	}
	    	//reset everything to normal
	    	else{//if the input is in the path
	    		this.wrong.pause();
	    		navigator.vibrate(0);
                //display drawing
                this.displayDrawing=game.global.displayDrawing;
	    	}
	    }
	    else{//if no input
	    	this.wrong.pause(); //pause audio feedback
	    	navigator.vibrate(0); //pause vibration feedback
	    }
    },

    //REACHED DESTINATION
    //end the game if an input is close enough fromn the destination
    reachedDest : function(){
    	//position of the destination
		var xf = this.xDest;
		var yf = this.yDest;
		var x = this.input.activePointer.x;
    	var y = this.input.activePointer.y;
		//distance from the input to the path
	    var d = Math.sqrt((x-xf)*(x-xf)+(y-yf)*(y-yf));
	    var b = d<this.goal;
	    if(b){
            //prevent to call several time the end function
	    	this.automaticEnd=false;
	    	this.endFct();
	    }
    },

    //LINE DISTANCE
    //return the minimal distance bewteen a point and a line
    lineDistance : function(x,y,l) {
    	if (l.length>0){
    		var d =Phaser.Math.distance(x,y,l[0][0],l[0][1]);
    		//iterate over the points of the line and get the smaller distance with (x,y)
    		for (var i=1;i<l.length;i+=1){
    			d = Math.min(d, Phaser.Math.distance(x,y,l[i][0],l[i][1]));
    		}
    		return d;
    	}
    },

    destroy : function(){
        //unable the drawing 
        this.drawingEnable = false;
        //destroy the UI button and the source/destination sprites
        this.btnEnd.destroy(true);
        this.btnClear.destroy(true);
        this.btnChildMode.destroy(true);
        if (typeof this.source !== "undefined"){
            this.source.destroy(true);
        }
        if (typeof this.dest !== "undefined"){
            this.dest.destroy(true);
        }
    }
}