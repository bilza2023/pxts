import {Graphics,Text as PixiText,Sprite} from "pixi.js";

//..
export default interface IRootComp {

    readonly id:string;
    pixiObj: Graphics | PixiText | Sprite;

    x:number;
    y:number;
    color:number;
    opacity:number;

}