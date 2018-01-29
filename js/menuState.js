/* menuState : display a "play" button which, on input, starts the game
*/


var menuState = {
    create: function() {
        //set the start button
        var coefBtn = 2;
        this.btnSize = Math.min(this.game.width/coefBtn, this.game.height/coefBtn);

        var spriteName = "startBtn";
        this.btnStart = this.add.sprite(game.width/2,game.height/2,spriteName);
        this.btnStart.anchor.setTo(0.5,0.5);
        //set the scale
        var width = this.btnStart.width;
        var height = this.btnStart.height;
        var scale = Math.min(this.btnSize/width,this.btnSize/height);
        this.btnStart.scale.setTo(scale);
        this.btnStart.inputEnabled=true;
        this.btnStart.events.onInputDown.add(this.startGame, this);
        //set the tint of the button
        this.btnStart.tint = parseInt('0x'+(game.global.pathColor).substring(1));
        this.btnStart.tint = parseInt('0x'+'000000');
        this.btnStart.alpha = 0.4;
    },

    startGame: function() {
        this.destroyFct();
        // Change the state
        game.state.start('Play');
        //set the full screen border color to the background color
        game.canvas.parentElement.style.backgroundColor = game.global.backgroundColor;
    },

    //destroy every sprite, video, event
    destroyFct: function(){
        //sprite
        this.btnStart.destroy(true);
    }
};