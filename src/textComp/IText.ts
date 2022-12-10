import IComponent from "../common/IComponent";
import { Text as PixiText, TextStyle } from "pixi.js";


export default interface IText extends IComponent {

    pixiObj: PixiText;
    style: TextStyle;
    text: String;
    
width:number;
height:number;
angle: number;
}