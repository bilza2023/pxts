import BaseGraph from "../core/baseGraph"

/////////////////////////////////////////////

export default class Rect extends BaseGraph {
    
/////////////////////////////////////////
constructor(x: number, y: number, width: number, height: number,color:number) {
super(x,y,width,height,color);
/////////////////////////////
}


init() {
this.graphics.beginFill(this.color);

this.graphics.drawRect(
    0, // dont use this.x in init since it accumulates 
    0,
    this.width,
    this.height);

//======================================
this.graphics.endFill();
//======================================
this.graphics.angle =  this.rotation;
this.graphics.alpha =  this.opacity/100;
//======================================
this.graphics.pivot.x =  0;
this.graphics.pivot.y =  0;
//--The position needs to be reset after the pivot has been changed
        //forget the intial position reset it again
this.graphics.x =  this.x;
this.graphics.y =  this.y;
//======================================

}

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
}