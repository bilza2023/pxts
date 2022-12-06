
- graphics.x and graphics.position.x are different
- graphics.x/y/width/height is NOT accumulative . The fol line
        graphics.drawRect( 10,50,100,100,);
            and any following line with 
        graphics.x = 10;
---
this is accumulative
graphics.drawRect( 100, 100 , 100, 100 );
graphics.endFill();
//xxxxxx
graphics.x = 100;
