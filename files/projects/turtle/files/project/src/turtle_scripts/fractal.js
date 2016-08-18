setMoveSpeed(1000).setTurnSpeed(1000).reset();
var branches = 3;
var turt = function(arg) {
  if (arg < 0.01) return;

  for (var i = 0; i < branches; i++) {
    turtle.pitch(-30);
    turtle.move(arg * 10);
    turt(arg / 2);
    turtle.move(-arg * 10);
    turtle.pitch(30);
    turtle.roll(360 / branches);
  }
};

turt(0.4);
