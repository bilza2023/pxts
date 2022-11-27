import {AniNumberDb, AniBooleanDb, AniColorDb} from "../animations/animations";

import BaseComp from "./baseComp";
/////////////////////////////////////////////
export default class BaseCompDb  {
public readonly id :string;

public  startTime :number;
public  endTime :number;
    
public x :AniNumberDb; 
public y :AniNumberDb;  
public width :AniNumberDb; 
public height :AniNumberDb;  
public color :number;  
///////////////////////////////////    
constructor(startTime :number, endTime :number){
    
this.id = Math.random().toString(36).slice(2);

this.startTime = startTime;
this.endTime =   endTime;

this.x = new AniNumberDb(0);
this.y = new AniNumberDb(0);
this.width = new AniNumberDb(10);
this.height = new AniNumberDb(10);
this.color = 0Xffffff;
}


init():BaseComp{
return new BaseComp(this);

}



//////////////////////////////////////////
}