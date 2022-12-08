import { Text as PixiText, TextStyle } from "pixi.js";

///////////////////////////////////////////
export default class TextInhereted extends PixiText {
    ///////////////////////////////////////////
    constructor(content: string, color: number, fontSize: number = 24) {
        super(content);
        this.style = new TextStyle();
        this.style.fontSize = fontSize;
        this.style.lineHeight = 28;
        this.style.letterSpacing = 0;
        this.style.fill = color;
        this.style.align = "center";
    }
}
