var XMIN = -5,
  XMAX = 5,
  YMIN = -5,
  YMAX = 5;
var XSTEPS = 20,
  YSTEPS = 20;

var YSTEP = (YMAX - YMIN) / YSTEPS;
var XSTEP = (XMAX - XMIN) / XSTEPS;

setMoveSpeed(1000).setTurnSpeed(1000).reset();

// Uncomment appropriate line for the surface you want
var surface = function(x, y) {
  // RIPPLES
  //return Math.sin((Math.pow(x, 2) + Math.pow(y, 2)));

  // SMOOTH RIPPLES
  //return Math.sin(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));

  // PYRAMID
  //return 1-Math.abs(x+y)-Math.abs(y-x);

  // CONE
  //return Math.pow((Math.pow(x, 2) + Math.pow(y, 2)), 0.5);
}

var x = XMIN,
  y = YMIN;
var increasing = true;
penup().moveto(x, y, surface(x, y)).pendown();
while (x <= XMAX) {
  while (true) {
    moveto(x, y, surface(x, y));
    y += (increasing ? YSTEP : -YSTEP);
    if (increasing && y > YMAX || !increasing && y < YMIN) {
      break;
    }
  }
  y = (increasing ? YMAX : YMIN);
  increasing = !increasing;
  x += XSTEP;
}

x = XMIN,
  y = YMIN;
increasing = true;
penup().moveto(x, y, surface(x, y)).pendown();
while (y <= YMAX) {
  while (true) {
    moveto(x, y, surface(x, y));
    x += (increasing ? XSTEP : -XSTEP);
    if (increasing && x > XMAX || !increasing && x < XMIN) {
      break;
    }
  }
  x = (increasing ? XMAX : XMIN);
  increasing = !increasing;
  y += YSTEP;
}
