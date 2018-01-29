/*state that evaluate the drawing with respect to the path and severa parameters using the evaluation functions
this state displays a glasshour to let the user know something is computing in the case it takes some time, which is really unlikely to occur
*/

var scoringState = {

    preload: function() {
        //SPRITE
        //Display wait icon
        var spriteName = "wait";
        this.wait = this.add.sprite(game.width/8,game.height/8,spriteName);
        this.wait.anchor.setTo(0.5,0.5);
        //set the scale
        var coef = 6;
        this.spriteSize = Math.min(this.game.width/coef, this.game.height/coef);
        var width = this.wait.width;
        var height = this.wait.height;
        var scale = Math.min(this.spriteSize/width,this.spriteSize/height);
        this.wait.scale.setTo(scale);
        this.wait.tint = parseInt('0x'+'000000');
        this.wait.alpha = 0.4;

        //EVALUATION PARAMETER
        // evaluation parameters
        //max value of the projection of a drawing point onto the tangent vector of a path point to be compared to the latter
        var dProjectionMax = game.global.drawingSize;
        // maximum distance between two points to be part of a same stroke
        var distanceMaxContinuity = Math.max(0.5*game.global.pxpcm,game.global.drawingSize);
        // minimum angle between two consecutive segments of the drawing belonging to the same stroke to consider an angle in the drawing 
        var maxAngle = Math.PI/2;
        // Distance maximum of the path not drawn above which we considered a part of the path is missing in the drawing 
        var distanceMaxMissingPart = (game.global.pathSize + game.global.drawingSize)/2;
        // Padding value for the missing part processing. It avoids when the drawing is on the border of the acceptance area to count several missing parts
        var paddingMissingPart = game.global.drawingSize/2 ;
        // Min number of points not included in the drawing to consider a missing part
        var minNbPointsMissingPart = 10;
        // Distance minimum of the drawing out of the path above which we considered a part of the drawing is out of the path
        var distanceMinOutPart = Math.max(2*game.global.drawingSize,(game.global.pathSize)/2);
        // Distance minimum from the drawing to the path above which we considered a part of the drawing is on the edge of the path
        var distanceMinEdgePart = Math.max(game.global.drawingSize,(game.global.pathSize-game.global.drawingSize-game.global.outlinePathSize)/2);
        // Padding value for the out part processing. It avoids when the drawing is on the border of the acceptance area to count several out parts
        var paddingOutPart = game.global.drawingSize/2 ;
        // Minimum number of points of the drawing out of the path to consider an out of the path part
        var minNbPointsOutPart = 10;


        //EVALUATION
        //compute all the evaluation criteria for each of the players
        //discontinuity
        game.global.drawingDiscontinuity = discontinuity(game.global.drawing, distanceMaxContinuity);
        game.global.drawingAngle = angle(game.global.drawing, maxAngle, distanceMaxContinuity);

        //Missing parts of the path in the drawings
        var lMissing = missingPathParts(game.global.drawing, game.global.pathReduced,game.global.pathTangentVectors, dProjectionMax, distanceMaxMissingPart, paddingMissingPart, minNbPointsMissingPart);
        game.global.nbMissing = lMissing[0];
        game.global.rateMissing = lMissing[1];
        game.global.distanceMissing = lMissing[2];

        // Parts of the drawing out of the path
        var lOut = outDrawingParts(game.global.drawing, game.global.pathReduced,distanceMinOutPart, paddingOutPart, minNbPointsOutPart,distanceMaxContinuity);
        game.global.nbOut = lOut[0];
        game.global.rateOut = lOut[1];
        game.global.distanceOut = lOut[2];
        game.global.lengthDrawing = lOut[3];

        var lEdge = outDrawingParts(game.global.drawing, game.global.pathReduced,distanceMinEdgePart, paddingOutPart, minNbPointsOutPart,distanceMaxContinuity);
        game.global.nbEdge = lEdge[0];

        //compute the overall result 0,1 or 2
        var nbDiscontinuity = game.global.drawingDiscontinuity;
        var nbAngle = game.global.drawingAngle;
        var nbOut = game.global.nbOut;
        var nbMissing = game.global.nbMissing;
        var distanceOut = game.global.distanceOut;
        var distanceMissing = game.global.distanceMissing;
        var nbEdge = game.global.nbEdge;
        var drawing = game.global.drawing;
        var path = game.global.pathReduced;
        var sourceImageWidth = game.global.sourceImageWidth;
        var endImageWidth = game.global.endImageWidth;
        var drawingSize = game.global.drawingSize;
        var pathSize = game.global.pathSize;

        var minXPath = 0;
        var maxXPath = 0;
        if(path.length>0){
            minXPath = path[0][0];
            maxXPath = path[path.length-1][0];
        }
        //alert("min and max path "+minXPath+" "+maxXPath);
        //min and max horizontal coordinates for the drawing 
        var minXDrawing = 0;
        var maxXDrawing = 0;
        if(drawing.length>0){
            minXDrawing = drawing[0][0];
            maxXDrawing = drawing[0][0];
        }

        for(var i=0; i<drawing.length;i++){
            if(drawing[i][0]<minXDrawing){
                minXDrawing = drawing[i][0];
            }
            if(drawing[i][0]>maxXDrawing){
                maxXDrawing = drawing[i][0];
            }
        }

        
        //FROSTIG CRITERIA
        //FROSTIG PARAMETER
        //for A4 paper is has to be inferior to 3 mm, we keep the same size
        //distance above which a undrawn part of the path is considered missing
        var missingThresholdImg = 0.3*game.global.pxpcm ;
        var missingThreshold = 5*game.global.pxpcm ;
        //for A4 paper is has to be inferior to 12 mm
        //distance above which a part of the drawing out of the path is actually considered out of the path
        var outThresholdImg = 1.2*game.global.pxpcm ;
        var outThreshold = 0.3*game.global.pxpcm ;
        //if the path is not shown, a drawing out of the figure is not tolerated
        if(!game.global.showPath){
            outThresholdImg = 0;
        }
        //global score maximum value
        var result = 2;
        //if the path is thin enough, the maximum score is 1, not 2
        if(game.global.pathSize<=0.2*game.global.pxpcm){
            result = 1;
        }

        //FROSTIG EVALUATION
        //if the drawing starts after and ends before the figures
        //distance from the beginning of the path to the beginning of the drawing
        var missingBefore = Math.max(0,minXDrawing-minXPath-drawingSize/2);
        //distance from the end of the drawing to the end of the path
        var missingAfter = Math.max(0,maxXPath - maxXDrawing-drawingSize/2);
        //boolean
        var missingBeforeB = missingBefore > missingThresholdImg;
        var missingAfterB = missingAfter > missingThresholdImg;
        //distance
        //distance from the beginning of the drawing to the beginning of the source figure
        var outBefore = Math.max(0,minXPath+drawingSize/2-sourceImageWidth-minXDrawing);
        //distance from the destination figure to the end of the path
        var outAfter = Math.max(0,maxXDrawing-drawingSize/2 - maxXPath - endImageWidth);
        //boolean
        var outBeforeB = outBefore > outThresholdImg;
        var outAfterB = outAfter > outThresholdImg;
        //update the distance out variable substracting the distance out before and after the path
        var distanceOut = distanceOut - Math.max(0,maxXDrawing-maxXPath - pathSize/2) - Math.max(0,minXPath-minXDrawing - pathSize/2);

        //criteria to get 0 points
        var zeroPt1 = missingBeforeB && missingAfterB ;
        //if there are some discontinuities
        var zeroPt2 = nbDiscontinuity>=1;
        //if the drawing starts before xor ends after the figures
        var zeroPt3 = (outBeforeB || outAfterB) && !(outBeforeB && outAfterB);
        //if the drawign goes out of the path more than the threshold
        var zeroPt4 = (distanceOut-outBefore-outAfter) > outThreshold;
        //if the drawing was not started or ended close to the figures or if a too big part of the path was not drawn
        var zeroPt5 = (missingBefore > missingThreshold) || (missingAfter> missingThreshold) || (distanceMissing-missingBefore - missingAfter)>missingThreshold;
        //if there are some irregularities in the drawing
        var zeroPt6 = nbAngle>0;
        var zeroPt = zeroPt1 || zeroPt2 || zeroPt3 ||zeroPt4 || zeroPt5;

        //criteria to get 1 point
        var onePt1 = outBeforeB && outAfterB;
        var onePt2 = (distanceOut-outBefore-outAfter) > 0;
        var onePt3 = nbEdge > 0;
        var onePt = onePt1 || onePt2 || onePt3;
        //if the path is very thin (line) or if the path is not shown, if the drawing begins and ends after the figures it gives zero point
        if(game.global.pathSize/game.global.pxpcm<=0.1 || !game.global.showPath){
            onePt = onePt2 || onePt3;
            zeroPt = zeroPt || onePt1;
        }

        //global score computing using the criteria
        if(zeroPt){
            result=0;
        }
        else if(onePt){
            result=1;
        }
        console.log("result "+result);

        //store results
        game.global.result = result;
        var distanceMissingCm = game.global.distanceMissing/game.global.pxpcm;
        distanceMissingCm = Math.round(distanceMissingCm*100)/100;
        var distanceOutCm = game.global.distanceOut/game.global.pxpcm;
        distanceOutCm = Math.round(distanceOutCm*100)/100;
        var lengthDrawingCm = game.global.lengthDrawing/game.global.pxpcm;
        lengthDrawingCm = Math.round(lengthDrawingCm*100)/100;
        //store result as string for further session log
        game.global.data = JSON.stringify({
        	name : game.global.name,
            path : game.global.pathReduced,
            drawing : game.global.drawing,
            nbMissing : game.global.nbMissing,
            rateMissing : game.global.rateMissing,
            distanceMissing : distanceMissingCm,
            nbOut : game.global.nbOut,
            rateOut : game.global.rateOut,
            distanceOut : distanceOutCm,
            nbStrokes : game.global.drawingNbStrokes,
            nbEdge : game.global.nbEdge,
            lengthDrawing : lengthDrawingCm,
            nbDiscontinuity : game.global.drawingDiscontinuity,
            nbAngle : game.global.drawingAngle,
            result : game.global.result
        });
    },

    create: function () {
        //destroy waiting icon
        this.wait.destroy(true);
        //start gameover state
        game.state.start('GameOver');
    }
};