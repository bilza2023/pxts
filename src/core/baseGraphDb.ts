import { DisplayObject, Graphics } from "pixi.js";
// import IDrawable from "./IDrawable";
import { AniNumberDb } from "../animations/animations";

/////////////////////////////////////////////
export default class BaseGraphDb  {

    public readonly id: string;

    public readonly startTime: number;
    public readonly endTime: number;
    public canvasWidth: number;
    public canvasHeight: number;

    public x:       AniNumberDb;
    public y:       AniNumberDb;
    public width:   AniNumberDb;
    public height:  AniNumberDb;
    public color:   AniNumberDb;
    public rotation:   AniNumberDb;

    /////////////////////////////////////////
    constructor(startTime: number, endTime: number, x: number = 0, y: number = 0, width: number = 50, height: number = 50, color: number = 0xde3249) {

        this.startTime = startTime;
        this.endTime = endTime;
        this.canvasWidth = 800;
        this.canvasHeight = 350;
        this.id = Math.random().toString(36).slice(2);
        this.x = new AniNumberDb(x);
        this.y = new AniNumberDb(y);
        this.width =   new AniNumberDb(width);
        this.height =  new AniNumberDb(height);
        this.color =   new AniNumberDb(color);
        this.rotation =   new AniNumberDb(0);
       
///////////////////
}

}