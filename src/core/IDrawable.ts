import {DisplayObject} from "pixi.js";

export default interface IDrawable {
    startTime: number;
    endTime: number;

    // x: number;
    // y: number;
    
    canvasWidth: number;
    canvasHeight: number;
    // height: number;
    
    // color: number;
    setX(x:number):number;
    setY(y:number):number;
    setxy(x:number , y:number):void;
    // sexy(x:number , y:number):void;
    setWidth(width:number):number;
    setHeight( height:number):number;
    setWidthHeight(width:number,height:number):void;

//////////////////////////////////////////
update( timeMs :number):void;
qualifyToDraw(timeMs :number):boolean;    
expired(timeMs :number):boolean;    
getDrawable( ):DisplayObject;    


}