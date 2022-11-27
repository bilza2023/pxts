

export default class PlusX {

n :number;
_plus :number;
constructor(n:number, plus:number){
this.n = n;
this._plus = plus;
}

plus():number{
this.n += this._plus;
return this.n;
}

}