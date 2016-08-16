var TMIN = 0,
  TMAX = 2 * Math.PI;
var TSTEPS = 300;

var TSTEP = (TMAX - TMIN) / TSTEPS;

setMoveSpeed(1000).setTurnSpeed(1000).reset();

// Uncomment appropriate line for the surface you want
var pos = function(t) {
  var x, y, z;
  // TREFOIL KNOT
  /*
  x = Math.sin(t) + 2 * Math.sin(2 * t);
  y = Math.cos(t) - 2 * Math.cos(2 * t);
  z = -Math.sin(3 * t);
  */
  // TOROUS KNOT
  // T: [0, 2PI]
  // Good pairs of (p, q): (5, 2), (3, 10)
  /*
  var p = 3, q = 10;
  x = Math.cos(q*t)*(5+Math.cos(p*t));
  y = Math.sin(q*t)*(5+Math.cos(p*t));
  z = Math.sin(p*t);
  */
  // CINQUEFOIL KNOT
  // T: [-5, 5]
  /*
  x = (1/50)*(Math.pow(t, 5) - 36*Math.pow(t, 3) + 260*t);
  y = (1/20)*(Math.pow(t, 4) - 24*Math.pow(t, 2));
  z = (1/1000)*(Math.pow(t, 7) - 31*Math.pow(t, 5) + 164*Math.pow(t, 3) + 560*t);
  */
  return {
    x: x,
    y: y,
    z: z
  };
}

var t = TMIN;
var position = pos(t)
penup().moveto(position.x, position.y, position.z).pendown();
while (t <= TMAX) {
  position = pos(t);
  moveto(position.x, position.y, position.z);
  t += TSTEP;
}
