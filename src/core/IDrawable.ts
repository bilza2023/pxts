import { DisplayObject } from "pixi.js";


export default interface IDrawable {

x            : number;
y            : number;
width        : number;
height       : number;
color        : number;
rotation     : number;
opacity      : number;

//////////////////////////
update( ):void;
getDrawable():DisplayObject;

}