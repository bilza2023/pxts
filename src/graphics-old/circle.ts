import { Graphics } from "pixi.js";
import BaseGraph from "./BaseGraph";
// import PlusX from "../plusX";
// import {AniNumber,} from "../animations/animations"
import AniNumber from "../animations/aniNumber/aniNumber"
import AniNumberDb from "../animations/aniNumber/aniNumberDb"
//////////////////////////////////////////////
export default class Circle  extends BaseGraph{
// xx :PlusX;
xDb :AniNumberDb;
xx :AniNumber ;
radius: number;
/////////////////////////////////   
constructor(x: number, y: number, radius: number, color: number) {
    
super(x,y,0,0,color);
this.xDb = new AniNumberDb(10);
this.xx = new AniNumber(this.xDb);
this.radius = radius;
}
/**
* I am calling this as draw but it is actually add to stage
*/
init():Graphics {
this.drawBorder(this.graphics);
//-Circle
this.graphics.beginFill(this.color, this.alpha);
this.graphics.drawCircle(this.x, this.y, this.radius);
this.graphics.endFill();
//---
this.xx = new AniNumber(this.xDb);
return this.graphics;
/////////////////////////
}
/////////////////////////////////////
update(rTimeMs: number){
// if (rTimeMs > 2_000){debugger;}

    this.xx.update(rTimeMs);    
    this.graphics.x = this.xx.value() ;   
}

}