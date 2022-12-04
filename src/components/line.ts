import BaseGraph from "../core/baseGraph"

/////////////////////////////////////////////

export default class Line extends BaseGraph {
public x2 :number;
public y2 :number;
public lineWidth :number;
/////////////////////////////////////////
constructor(x: number, y: number, x2: number, y2: number,color :number=0x000000) {
super(x,y,0,0);
        /////////////////////////////
        this.x2 = x2;
        this.y2 = y2;
        this.color = color;
        this.lineWidth = 2;
        // this.addPixiElement();
    }


/////////////////////////////////////////
init() {
this.graphics.lineStyle( this.lineWidth , this.color);
        this.graphics.moveTo( this.x , this.y );
        this.graphics.lineTo( 
            this.x2,
            this.y2
        );
}
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
}