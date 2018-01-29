//construct a line using startin at (x0,y0), ending at (xf,yf) and presenting aall the patterns given in argument, following the given pattern order
//the output consists in two list of coordinate representing the line with two different precision k1 and k2, one for displaying purpose, one for computation purpose
//in addition the ouput has also a corresponding list of the tangent of the line (mcorresponds to the computationn data)
function createPath(object,x0,y0,xf,yf,height,width,nTriangle,nFlat,nCurve,pTriangle,pFlat,pCurve,patternHeight,patternOrder,initialFlat,endFlat,k1,k2){
    var displayData = [];
    var computationData = [];
    var tangent = [];
    var l = [];
    var x = [];
    var y = [];
    var kUnit1 = k1*(nTriangle + nFlat + nCurve);
    var kUnit2 = k2*(nTriangle + nFlat + nCurve);
    
    var h = patternHeight;

    //padding to take into account the initial and end flat
    var pad = 0;
    if(initialFlat){
        pad+=0.25;
    }
    if(endFlat){
        pad+=0.25;
    }
    //compute the width of one pattern
    var w = (xf-x0)/(nTriangle + nCurve + nFlat + pad);
    //organize all he pattern in a list
    var orderList = [];
    switch (patternOrder){
        case "Normal" :
            orderList = normalOrder(nTriangle,nFlat,nCurve,pTriangle,pFlat,pCurve);            
            break;
        case "Alternate" :
            orderList = alternateOrder(nTriangle,nFlat,nCurve,pTriangle,pFlat,pCurve);
            break;
        case "Random" :
            orderList = randomOrder(nTriangle,nFlat,nCurve);
            break;
    }
    //compute the cooridnate of all the patterns and display them in the right order
    var currentPattern ="";
    var e0 = -1;
    //initial flat
    if(initialFlat){
        l = flat(1,height,width,x0,height/2,w/4);
        x = l[0];
        y = l[1];
        displayData=displayData.concat(this.linearPlot(object,x,y,kUnit1));
        computationData=computationData.concat(this.linearPlot(object,x,y,kUnit2));
        x0+=w/4
    }
    //all patterns
    for (var i=0; i<orderList.length; i+=1){
        currentPattern = orderList[i];
        if (currentPattern == "triangle"){
            l = triangle(1,height,width,x0,height/2,w,h,e0);
            x = l[0];
            y = l[1];
            displayData=displayData.concat(this.linearPlot(object,x,y,kUnit1));
            computationData=computationData.concat(this.linearPlot(object,x,y,kUnit2));
            e0 *= -1;
        }
        else if (currentPattern == "flat"){
            l = flat(1,height,width,x0,height/2,w);
            x = l[0];
            y = l[1];
            displayData=displayData.concat(this.linearPlot(object,x,y,kUnit1));
            computationData=computationData.concat(this.linearPlot(object,x,y,kUnit2));
        }
        else if (currentPattern == "curve"){
            l = curve(1,height,width,x0,height/2,w,h,e0);
            x = l[0];
            y = l[1];
            e0 *= -1;
            //result=result.concat(this.catmullRomPlot(object,x,y,k));
            displayData=displayData.concat(this.sinPlot(x,y,kUnit1));
            computationData=computationData.concat(this.sinPlot(x,y,kUnit2));
        }
        x0 += w;
    }
    //endflat
    if(endFlat){
        l = flat(1,height,width,x0,height/2,w/4);
        x = l[0];
        y = l[1];
        displayData=displayData.concat(this.linearPlot(object,x,y,kUnit1));
        computationData=computationData.concat(this.linearPlot(object,x,y,kUnit2));
        x0+=w/4
    }
    //handle a limit case
    if (displayData.length == 0){
        displayData.push([x0,height/2]);
        computationData.push([x0,height/2]);
    }
    //compute the tangent list of the line using the computation data
    //initialize the tangent with an horizontal vector
    tangent.push([1,0]);
    var xPrev = computationData[0][0];
    var yPrev = computationData[0][1];
    var x = computationData[0][0];
    var y = computationData[0][1];
    var a;
    var b;
    for(var i=1;i<computationData.length;i++){
        x = computationData[i][0];
        y = computationData[i][1];
        //add a new tangent vector to the list of tangent vectors
        var norm = Math.sqrt((x-xPrev)*(x-xPrev)+(y-yPrev)*(y-yPrev));
        if(norm!=0){
            a = (x-xPrev)/norm;
            b = (y-yPrev)/norm;
        }
        tangent.push([a,b]);
        xPrev = x;
        yPrev = y;
    }
    return [displayData,computationData,tangent];
}

//create a list of pattern grouping all the pattern by category and respecting their position
function normalOrder(nTriangle,nFlat,nCurve,pTriangle,pFlat,pCurve){
    var orderList = [];
    for(var i =1;i<=3;i++){
        if(pTriangle==i){
            for (var j=0; j<nTriangle; j+=1){
                orderList.push("triangle");
            }
        }
        else if(pFlat==i){
            for (var j=0; j<nFlat; j+=1){
                orderList.push("flat");
            }
        }
        else if(pCurve==i){
            for (var j=0; j<nCurve; j+=1){
                orderList.push("curve");
            }
        }
    }
    return orderList;
}

//create a list of patterns alternatively
function alternateOrder(nTriangle,nFlat,nCurve,pTriangle,pFlat,pCurve){
    var orderList = [];

    for (var i=0; i<Math.max(nTriangle,nFlat,nCurve); i+=1){
        for(var j=1;j<=3;j++){
            if(pTriangle==j && (i<nTriangle)){
                orderList.push("triangle");
            }
            else if(pFlat==j && (i<nFlat)){
                orderList.push("flat");
            }
            else if(pCurve==j &&(i<nCurve)){
                orderList.push("curve");
            }
        }
    }
    return orderList;
}

//create a list of pattern randomly
function randomOrder(nTriangle,nFlat,nCurve){
    var orderList = [];
    var i = 0;
    var r = 0;
    var cTriangle = 0;
    var cFlat = 0;
    var cCurve = 0;

    while (i< nTriangle + nFlat + nCurve){
        r = getRandomIntInclusive(1, 3);
        switch (r){
            case 1:
                if (cTriangle<nTriangle){
                    orderList.push("triangle");
                    i+=1;
                    cTriangle+=1;
                }
                break;
            case 2:
                if (cFlat<nFlat){
                    orderList.push("flat");
                    i+=1;
                    cFlat +=1;
                }
                break;
            case 3:
                if (cCurve<nCurve){
                    orderList.push("curve");
                    i+=1;
                    cCurve +=1;
                }
                break;
        }
    }

    return orderList;
}

//return the key cooridnates of n triangle elements according to the dimensions in the arguments
function triangle(nTriangle,height,width,x0,y0,w,h,e0){
    //orientation of the item 
    var e = e0;
    var x = [];
    var y = [];

    x.push(x0);
    y.push(y0);
    for (var i=0; i<nTriangle; i+=1){
        x.push((i+1/2)*w + x0);
        //yLinear.push(height*(1/2+e*1/4));
        y.push(y0+e*h);
        e *= -1;
    }
    x.push(nTriangle*w + x0);
    y.push(y0);
    return [x,y];
}

//return the key cooridnates of n flat element according to the dimensions in the arguments
function flat(nFlat,height,width,x0,y0,w){
    var x = [];
    var y = [];

    x.push(x0);
    y.push(y0);
    x.push(nFlat*w + x0);
    y.push(y0);
    return [x,y];
}

//return the key cooridnates of n curve element according to the dimensions in the arguments
function curve(nCurve,height,width,x0,y0,w,h,e0){
    //orientation of the item
    var e = e0;
    var x = [];
    var y = [];

    for (var i=0; i<=2*nCurve; i+=1){
        x.push((i/2)*w + x0);
        r = i % 2;
        if(r>0){
            y.push(y0+e*h);
            e *= -1;
        }
        else{
            y.push(y0);
        }
    }
    return [x,y];
}


//from the horizontal and vertical key coordinates of a line, return the result of a linear interpolation of precision k
function linearPlot(object,x,y,k) {

	var px;
	var py;

    var l = [];
    var i = 0;


    while(i<1)
    {
        px = object.math.linearInterpolation(x, i);
        py = object.math.linearInterpolation(y, i);

        l.push([px,py]);
        i+=k;
    }
    px = object.math.linearInterpolation(x, 1);
    py = object.math.linearInterpolation(y, 1);
    l.push([px,py]);
    return l;

}


//from the horizontal and vertical key coordinates of a line, return the result of a catmull rom interpolation of precision k
function catmullRomPlot(object,x,y,k) {
    var px;
    var py;
    var l = [];
    var i =0;

    while (i<1)
    {
        px = object.math.catmullRomInterpolation(x, i);
        py = object.math.catmullRomInterpolation(y, i);

        l.push([px,py]);

        i+=k;
    }
    px = object.math.catmullRomInterpolation(x, 1);
    py = object.math.catmullRomInterpolation(y, 1);
    l.push([px,py]);
    return l;
}


//from the horizontal and vertical key coordinates of a line, return the result of a sinus interpolation
function sinPlot(x,y,k){
    var pxNext = x[0];
    var pyNext = y[0];
    var pxPrev = x[0];
    var pyPrev = y[0];
    var l = [];
    var mode = 1;
    var theta = 0 ;

    var j =0;

    for (var i = 1; i<x.length; i+=1){
        pxPrev = pxNext;
        pyPrev = pyNext;
        pxNext = x[i];
        pyNext = y[i];
        j = 0;

        switch (mode){
            case 1 :
                while (j<1){
                    px = pxPrev + (pxNext - pxPrev)*j;
                    py = pyPrev + (pyNext - pyPrev)*Math.sin(j*Math.PI/2);

                    l.push([px,py]);
                    j+=k;
                }
                l.push([pxNext,pyNext]);
                mode +=1;
                break;
            case 2 :
                while (j<1){
                    px = pxPrev + (pxNext - pxPrev)*j;
                    py = pyNext - (pyNext - pyPrev)*Math.sin((1+j)*Math.PI/2);

                    l.push([px,py]);
                    j+=k;
                }
                l.push([pxNext,pyNext]);
                mode =1;
                break;
        }

        
    }
    return l;
}


function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}