import IText from "./IText";
import RootComp from "../common/rootComp";
import { Text as PixiText, TextStyle } from "pixi.js";



//..
export default class Text extends RootComp implements IText {
style:TextStyle;
pixiObj :PixiText;    
constructor(content: string, color: number, fontSize: number = 24) {
super();
this.style = new TextStyle();
        this.style.fontSize = fontSize;
        this.style.lineHeight = 28;
        this.style.letterSpacing = 0;
        this.style.fill = 0xffffff;
        this.style.align = "center";
    this.pixiObj = new PixiText(content,this.style);    
    this.pixiObj.x = 0;    
    this.pixiObj.y = 0;    
    this.pixiObj.tint = color;
}

    set x(x: number) {
        this.pixiObj.x = x;
    }

    get x() {
        return this.pixiObj.x;
    }

    set y(y : number) {
        this.pixiObj.y = y;
    }

    get y() {
        return this.pixiObj.y;
    }

    set color(color: number) {
        this.pixiObj.tint = color;
    }

    get color() {
        return this.pixiObj.tint;
    }

    set opacity (opacity: number) {
        this.pixiObj.alpha = opacity;
    }

    get opacity() {
        return this.pixiObj.alpha;
    }

    set width (width: number) {
        this.pixiObj.width = width;
    }

    get width() {
        return this.pixiObj.width;
    }
    set height (height: number) {
        this.pixiObj.height = height;
    }

    get height() {
        return this.pixiObj.height;
    }
    set angle (angle: number) {
        this.pixiObj.angle = angle;
    }

    get angle() {
        return this.pixiObj.angle;
    }
    
    set text (text: string) {
        this.pixiObj.text = text;
    }

    get text() {
        return this.pixiObj.text;
    }
    
}
