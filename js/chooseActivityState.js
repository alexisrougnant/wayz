//ChooseActivityState : Get all the app activities, display them on the screen with their title
//If the activites do not fit on one screen, some controls are added to allow to display the next activities
var chooseActivityState = {
	preload: function() {
		//reset the standard background color
		game.stage.backgroundColor = "#FBFCFC";
        game.canvas.parentElement.style.backgroundColor = "#FBFCFC";
	},

	create: function() {
		//get all the app activities and their title
		this.actList = game.global.actList;
		this.actTitle = game.global.actTitle;
		//number of rows and columns per screen
		this.nbRows = 5;
		this.nbColumns = 1;
		//set the number of characters max for the title
		this.titleCharacters = 70;
		//size of the different texts
		this.nbSize = game.height/15;
		this.titleSize = game.height/18;
		this.buttonSize = game.height/20;
		//set the different distance used to display the different activities
		//padding between the border of the screen and the text, between two activities text, between the position of an activity number and its title
		this.xPadding = game.width*1.5/20;
        this.yPadding = game.height*1.5/20;
        this.xStep = 0;
        this.yStep = 0;
        this.setSteps();
		//display some activites on the screen, from the position of the pointer (0 when the game start)
		this.populateScreen(game.global.activityPointer);
		//set the previous and next buttons
		this.setPreviousAndNext();
	},

	//compute the vertical and horizontal distance between two activities on the screen
	setSteps(){
		var w = game.width;
		var h = game.height;
		var px = this.xPadding;
		var py = this.yPadding;
		//compute and update the step variables
		this.xStep = (w-2*px)/this.nbColumns;
		this.yStep = (h-2*py)/this.nbRows;
		return false;
	},


	//display the title of activities as input enabled text
	//the number of activities on the screen is defined by the number of rows and columns 
	populateScreen(pointer){
		//style of the activity number text
		var fontSizeNb = this.nbSize;
        var styleNb = { font: "bold "+fontSizeNb+"px Arial", fill: "#000000"};
        //style of the activity title text
        var fontSizeTitle = this.titleSize;
        var styleTitle = { font: "bold "+fontSizeTitle+"px Arial", fill: "#000000"};
		//the different distances variables
        var w = game.width;
        var h = game.height;
        var xPadding = this.xPadding;
        var yPadding = this.yPadding;
        //positions of the text
        var px = this.xPadding;
		var py = this.yPadding;
		var xStep = this.xStep;
		var yStep = this.yStep;

        //loop over the activities and display a list of them
        //the number of activities diplayed is short enough to fit the screen, the last activity displayed is stored
        //to access to the undisplayed activities, some buttons can be interacted with to display the next/previous couple of activities  
		var column = 0;
		var row = 0;
		//compute the maximum index of the activities
		var iMax = Math.min(this.actList.length-1, pointer+this.nbRows*this.nbColumns-1);
		for(var i=pointer; i<=iMax; i++){
        	//create a group that will encompasses activity number text and the activity title text
        	eval("this.act"+i+" = game.add.group()");
        	//create the activity number text
        	eval("this.act"+i+"Nb=game.add.text("+px+", "+py+" , '"+(i+1)+"', styleNb,this.act"+i+");");
        	//create the activity title text
        	eval("this.act"+i+"Title=game.add.text("+(px+xPadding)+", "+py+" , '"+this.actTitle[i]+"', styleTitle, this.act"+i+");");
        	//resize or troncate the textTitle to fit the screen
        	eval("this.textSize(this.act"+i+"Title,"+(xStep-2*xPadding)+",this.titleCharacters);");
        	//set different properties to the two texts
        	eval("this.act"+i+".forEach(forEachFct)");
        	function forEachFct(item){
        		item.alpha = 0.6;
        		//store as variable the number of the activity
        		item.variable = i;
        		//enable the input
        		item.inputEnabled=true;
        		item.anchor.set(0,0.5);
        	}
        	//associate a function to the text input
        	eval("this.act"+i+".onChildInputDown.addOnce(this.selectActivity, this);");
        	//update the alpha property if the activity has already been done
        	var done = eval("game.global.act"+i+";");
        	if(done){
        		eval("this.act"+i+".forEach(function(item){item.alpha=0.8;});");
        	}
        	//increment the row counter and the initial position
        	row +=1;
        	py+=yStep;
        	//if already all the rows are populated, reinitialize the row variable and increments the column variables
        	if(row==this.nbRows){
        		row = 0;
        		py=yPadding;
        		px+=xStep;
        		column +=1;
        	}
		}
	},

	//Create the previous and next button if needed
	setPreviousAndNext(){
		//style of the text
		var fontSize = this.buttonSize;
        var style = { font: "bold "+fontSize+"px Arial", fill: "#000000"};
        //check if there are activites before the current screen and set the previous button
		if(game.global.activityPointer>=this.nbRows*this.nbColumns){
			this.previous=game.add.text(this.xPadding, game.height, "previous", style);
			this.previous.anchor.set(0,1);
        	this.previous.alpha=0.8;
        	this.previous.variable = "previous";
        	//enable the input and associate a function
        	this.previous.inputEnabled=true;
        	this.previous.events.onInputDown.addOnce(this.changeScreen, this);
		}
		//check if there are activities after the current screen and set the next button
		if(game.global.activityPointer+this.nbRows*this.nbColumns<=this.actList.length-1){
			this.next=game.add.text(game.width-this.xPadding, game.height, "next", style);
			this.next.anchor.set(1,1);
        	this.next.alpha=0.8;
        	this.next.variable = "next";
        	//enable the input and associate a function
        	this.next.inputEnabled=true;
        	this.next.events.onInputDown.addOnce(this.changeScreen, this);
		}
	},

	//destroy everthing
	destroy(){
		//destroy all the activity texts
		for(var i=0; i<this.actList.length; i++){
			//check the existence before to destroy
			var b = eval("(typeof this.act"+i+" != 'undefined')")
			if(b){
	        	eval("this.act"+i+".destroy(true);");
	        }
        }
        //destroy the previous and next button
        if(typeof this.previous != 'undefined'){
        	this.previous.destroy();
        }
        if(typeof this.next != 'undefined'){
        	this.next.destroy();
        }
	},

	//display the previous or next activities on the screen
	changeScreen(item){
		this.destroy();
		var value = item.variable;
		//update the global variable storing the number first activity of the current screen
		if(value=="next"){
			game.global.activityPointer += this.nbRows*this.nbColumns;
		}
		if(value=="previous"){
			game.global.activityPointer -= this.nbRows*this.nbColumns;
		}
		this.setPreviousAndNext();
		this.populateScreen(game.global.activityPointer);
	},

	//get the activity id of the selected activity and start the activity
	selectActivity(item){
		var i = item.variable;
		//update the transparency
		eval("this.act"+i+".forEach(function(item){item.alpha=0.8;});");
		//change the global boolean to remmber that the activity has been done
		eval("game.global.act"+i+"=true;");
		var actId = this.actList[i];
		game.global.activity_id = actId;
		game.time.events.add(Phaser.Timer.SECOND*0.2, function(){this.destroy(); startActivity(actId);}, this);
	},

	//troncate the text in paramter and adapt its size to fit a maximal width
	textSize(field, widthMax, sizeMax){
		field.text = field.text.substring(0,sizeMax);
		while(field.width > widthMax && field.fontSize){
			field.fontSize -=1;
		}
	}
};

