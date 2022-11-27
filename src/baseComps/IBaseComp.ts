import { Rectangle,DisplayObject,Graphics } from "pixi.js";
import { AniNumber, AniPerc } from "../animations/animations";


export default interface IBaseComp {
x: AniNumber;
getDisplayObject():DisplayObject;
draw(timeMs :number, screen :Rectangle):void;
    
}