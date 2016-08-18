var UMIN = -Math.PI,
  UMAX = 2 * Math.PI,
  VMIN = -Math.PI,
  VMAX = 2 * Math.PI;
var USTEPS = 30,
  VSTEPS = 30;

var USTEP = (UMAX - UMIN) / USTEPS;
var VSTEP = (VMAX - VMIN) / VSTEPS;

setMoveSpeed(1000).setTurnSpeed(1000).reset();

// Uncomment appropriate line for the surface you want
var surface = function(u, v) {
  var x, y, z;

  // SPHERE
  // u=[0,2pi]
  // v=[0,pi]
  /*
  var R = 5;
  x = R * Math.cos(u) * Math.sin(v);
  y = R * Math.sin(u) * Math.sin(v);
  z = R * Math.cos(v);
  */

  // COOL SURFACE
  // u=[-pi,2pi]
  // v=[-pi,2pi]
  var R = 3;
  x = R * Math.sin(3 * u) / (2 + Math.cos(v));
  y = R * (Math.sin(u) + 2 * Math.sin(2 * u)) / (2 + Math.cos(v + (Math.PI * 2 / 3)));
  z = R / 2 * (Math.cos(u) - 2 * Math.cos(2 * u)) * (2 + Math.cos(v)) * (2 + Math.cos(v + Math.PI * 2 / 3)) / 4;

  return {
    x: x,
    y: y,
    z: z
  };
}

var u = UMIN,
  v = VMIN;
var increasing = true;
var position = surface(u, v);
penup().moveto(position.x, position.y, position.z).pendown();
while (u <= UMAX) {
  while (true) {
    position = surface(u, v);
    moveto(position.x, position.y, position.z);
    v += (increasing ? VSTEP : -VSTEP);
    if (increasing && v > VMAX || !increasing && v < VMIN) {
      break;
    }
  }
  v = (increasing ? VMAX : VMIN);
  position = surface(u, v);
  moveto(position.x, position.y, position.z);
  increasing = !increasing;
  u += USTEP;
}

u = UMIN,
  v = VMIN;
increasing = true;
position = surface(u, v);
penup().moveto(position.x, position.y, position.z).pendown();
while (v <= VMAX) {
  while (true) {
    var position = surface(u, v);
    moveto(position.x, position.y, position.z);
    u += (increasing ? USTEP : -USTEP);
    if (increasing && u > UMAX || !increasing && u < UMIN) {
      break;
    }
  }
  u = (increasing ? UMAX : UMIN);
  position = surface(u, v);
  moveto(position.x, position.y, position.z);
  increasing = !increasing;
  v += VSTEP;
}
