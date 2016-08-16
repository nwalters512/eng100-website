var XMIN = -5,
  XMAX = 5,
  YMIN = -5,
  YMAX = 5;
var XSTEPS = 20,
  YSTEPS = 20;

var YSTEP = (YMAX - YMIN) / YSTEPS;
var XSTEP = (XMAX - XMIN) / XSTEPS;

var topSurface = function(x, y) {
  return Math.sqrt(25 - Math.pow(x, 2) - Math.pow(y, 2));
}

var bottomSurface = function(x, y) {
  return -Math.sqrt(25 - Math.pow(x, 2) - Math.pow(y, 2));
}

var top = createTurtle("top");
top.setMoveSpeed(1000).setTurnSpeed(1000).reset();;
var bottom = createTurtle("bottom");
bottom.setMoveSpeed(1000).setTurnSpeed(1000).reset();;

var x = XMIN,
  y = YMIN;
var increasing = true;
top.penup().moveto(x, y, topSurface(x, y)).pendown();
bottom.penup().moveto(x, y, bottomSurface(x, y)).pendown();
while (x <= XMAX) {
  while (true) {
    top.moveto(x, y, topSurface(x, y));
    bottom.moveto(x, y, bottomSurface(x, y));
    y += (increasing ? YSTEP : -YSTEP);
    if (increasing && y > YMAX || !increasing && y < YMIN) {
      break;
    }
  }
  y = (increasing ? YMAX : YMIN);
  increasing = !increasing;
  x += XSTEP;
}

var x = XMIN,
  y = YMIN;
var increasing = true;
top.penup().moveto(x, y, topSurface(x, y)).pendown();
bottom.penup().moveto(x, y, bottomSurface(x, y)).pendown();
while (y <= YMAX) {
  while (true) {
    top.moveto(x, y, topSurface(x, y));
    bottom.moveto(x, y, bottomSurface(x, y));
    x += (increasing ? XSTEP : -XSTEP);
    if (increasing && x > XMAX || !increasing && x < XMIN) {
      break;
    }
  }
  x = (increasing ? XMAX : XMIN);
  increasing = !increasing;
  y += YSTEP;
}
