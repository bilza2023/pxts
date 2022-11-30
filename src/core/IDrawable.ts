

export default interface IDrawable {
    x: number;
    y: number;
    width: number;
    height: number;
    color: number;

update( timeMs :number ):void;
qualifyToDraw(timeMs :number):boolean;    
expired(timeMs :number):boolean;    


}