/*different function to evaluate the drawing with respect to the path and several parameters*/

//retunr the numbe rof discontinuity
function discontinuity(drawing, distanceMaxContinuity){
    var discontinuity = 0;
    //check among the drawing points if two closest points are too distant, if so, one discontinuity is counted
    //index for the loop over the drawing
    var j = 0;
    var f =true;
    for (var i=0; i<drawing.length-1; i+=1){
        xi = drawing[i][0];
        yi = drawing[i][1];
        j=i+1;
        f=true;
        //check if there is a close point that was drawn afterwards
        while(f&&j<drawing.length){
            xj=drawing[j][0];
            yj=drawing[j][1];
            if(Phaser.Math.distance(xi,yi,xj,yj)<distanceMaxContinuity){
                f = false;
            }
            j+=1;
        }
        if(f){
            discontinuity+=1;
        }
    }
    return discontinuity;
}


//check if the drawing presents some angles and return its number
function angle(drawing, maxAngle, distanceMaxContinuity){
    var nbAngle = 0;
    if(drawing.length>1){
        var xPrev = drawing[0][0];
        var yPrev = drawing[0][1];
        var x = drawing[0][0];
        var y = drawing[0][1];
        var orientationPrev = 0;
        var orientation = 0;
        var norm
        var a;
        var b;
        for(var i=1;i<drawing.length;i++){
            //update the previous variables
            xPrev = x;
            yPrev = y;
            orientationPrev = orientation;
            //get the new variables
            x = drawing[i][0];
            y = drawing[i][1];
            norm = Math.sqrt((x-xPrev)*(x-xPrev)+(y-yPrev)*(y-yPrev));
            //compute the orientation of the segment formed by the last pair of points of the drawing, if the two points are distincts and close enough to belong to the same stroke
            if(norm!=0 && Phaser.Math.distance(xPrev,yPrev,x,y)<distanceMaxContinuity){
                a = (x-xPrev)/norm;
                b = (y-yPrev)/norm;
                orientation = Math.atan(b/a)
            }
            //if the angle between the two last segments of the drawing is too small, we count one angle
            if(Math.abs(orientation-orientationPrev)>maxAngle){
                nbAngle +=1;
            }
        }
    }
    return nbAngle;
}

//compare the path and the drawing and return the percentage of the path which was not drawn and the number of parts of the path that were not drawn
function missingPathParts(drawing,path,tangent,dProjectionMax,distanceMaxMissingPart, paddingMissingPart, minNbPointsMissingPart){
    var nbMissingPoints = 0;
    var nbMissingParts = 0;
    var totalDistance = 0;
    var missingDistance = 0;
    var curDistance = 0;
    var rateMissingPathDistance = 0;

    if(path.length>0){
        var xPrev = path[0][0];
        var yPrev = path[0][1];
        var xCur = path[0][0];
        var yCur = path[0][1];
        var d = 0;
        var isMissing = true;
        //index for the loop over the drawing
        var j = 0;
        //store the last point of the drawing inside the path over the loops
        var k = 0;
        //for every point of the path
        for (var i=0; i<path.length; i+=1){
            var xPrev = xCur;
            var yPrev = yCur;
            var xCur = path[i][0];
            var yCur = path[i][1];
            //count over the iteration the length of the path (sum of the distance between the consecutive points)
            curDistance = Phaser.Math.distance(xPrev,yPrev,xCur,yCur);
            totalDistance += curDistance;
            //check if there is a point in the drawing close to the current point of the path
            //to enhance the performance, we start to iterate over the drawing at the last point we found inside the path
            isMissing = true;
            j=0;
            while(isMissing&&j<drawing.length){
                //add the index of the last point known inside the path to the loop index (modulo the length of the drawing)
                jmod = (j+k) % drawing.length;
                xDrawing=drawing[jmod][0];
                yDrawing=drawing[jmod][1];
                //avoid some issues when the path is big
                dProjection = Math.abs(tangent[i][0]*(xDrawing-xCur) + tangent[i][1]*(yDrawing-yCur));
                if(dProjection<dProjectionMax){
                    d = Phaser.Math.distance(xCur,yCur,xDrawing,yDrawing);
                    //the maximum distance between the points of the path and the drawing is not the same if some points are already missing
                    //it avoids to switch between missing and not missing when the drawing is on the edge of the path
                    if (nbMissingPoints==0){
                        if (d < distanceMaxMissingPart){
                            isMissing = false;
                            //update the index of the last point of the drawing inside the path
                            k=jmod;
                        }
                    }
                    else {
                        if (d < distanceMaxMissingPart - paddingMissingPart){
                            isMissing = false;
                            //update the index of the last point of the drawing inside the path
                            k=jmod;
                        }
                    }
                }
                j+=1;
            }
            //increments the number of missing points and the missing distance, if there are enough of them, we increment the number of parts of the path that are missing
            if (isMissing){
                nbMissingPoints += 1;
                if (nbMissingPoints == minNbPointsMissingPart){
                    nbMissingParts += 1;
                }
                missingDistance += curDistance;
            }
            //if the point is not missing we reinitialize the counter of missing points
            else {
                nbMissingPoints = 0;
            }
        }
        //compute the percentage of the path that is missing
        if(totalDistance>0){
            rateMissingPathDistance = Math.round(missingDistance/totalDistance*100);
        }
    }
    //return the number of missing parts and the percentage of the path that is missing
    return [nbMissingParts,rateMissingPathDistance,missingDistance];
}

//compare the path and the drawing and return the percentage of the drawing which is out of the path and the number of parts of the drawing which are out of the path
function outDrawingParts(drawing,path,distanceMinOutPart, paddingOutPart, minNbPointsOutPart,distanceMaxContinuity){
    var nbOutPoints = 0;
    var nbOutParts = 0;
    var totalDistance = 0;
    var outDistance = 0;
    var curDistance = 0;
    var rateOutPathDistance = 0;

    if (path.length>0){
        var xPrev = path[0][0];
        var yPrev = path[0][1];
        var xCur = path[0][0];
        var yCur = path[0][1];
        var d = 0;
        var isOut = true;
        //index for the loop over the drawing
        var j = 0;
        //store the last point of the path inside the drawing over the loops
        var k = 0;
        //for every point of the drawing
        for (var i=0; i<drawing.length; i+=1){
            var xPrev = xCur;
            var yPrev = yCur;
            var xCur = drawing[i][0];
            var yCur = drawing[i][1];
            //count over the iteration the length of the drawing (sum of the distance bewteen the consecutive points, if they are close enough)
            var d = Phaser.Math.distance(xPrev,yPrev,xCur,yCur);
            if (d<distanceMaxContinuity){
                curDistance = Phaser.Math.distance(xPrev,yPrev,xCur,yCur);
                totalDistance += curDistance;
            }
            else{
                curDistance = 0;
            }
            //check if there is a point in the path close to the current point of the drawing
            //to enhance the performance, we start to iterate over the path at the last point we found inside the drawing
            isOut = true;
            j=0;
            while(isOut&&j<path.length){
                //add the index of the last point known inside the drawing to the loop index (modulo the length of the path)
                jmod = (j+k) % path.length;
                d = Phaser.Math.distance(drawing[i][0],drawing[i][1],path[jmod][0],path[jmod][1]);
                //the maximum distance between the points of the path and the drawing is not the same if some points are already out
                //it avoids to switch between out and not out when the drawing is on the edge of the path
                if (nbOutPoints==0){
                    if (d <= distanceMinOutPart){
                        isOut = false;
                        //update the index of the last point of the path inside the drawing
                        k=jmod;
                    }
                }
                else {
                    if (d <= distanceMinOutPart - paddingOutPart){
                        isOut = false; 
                        //update the index of the last point of the path inside the drawing
                        k=jmod;
                    }
                }
                j+=1;
            }
            //increments the number of points 'out' and the 'out' distance, if there are enough of them, we increment the number of parts of the drawing that are out of the path
            if (isOut){
                nbOutPoints += 1;
                if (nbOutPoints == minNbPointsOutPart){
                    nbOutParts += 1;
                }
                outDistance += curDistance;
            }
            //if the point is in the path we reinitialize the counter of points 'out'
            else {
                nbOutPoints = 0;
            }
        }
        //compute the percentage of the path that is 'out'
        if(totalDistance>0){
            rateOutPathDistance = Math.round(outDistance/totalDistance*100);
        }
    }
    //return the number of parts 'out' and the percentage of the path that is 'out'
    return [nbOutParts,rateOutPathDistance,outDistance, totalDistance];
}