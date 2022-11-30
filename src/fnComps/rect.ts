import { DisplayObject, Graphics } from "pixi.js";

/////////////////////////////////////////////
export default function rect(x: number=0,y: number=0,width: number=200,height: number=100,color: number=0xde3249):DisplayObject {
/////////////////////////////
const graphics = new Graphics();
graphics.beginFill(color);
graphics.drawRect(x,y, width, height);
graphics.endFill();
return graphics;
}
