var side = 3;

// Draws base
for (var i = 0; i < 4; i++) {
  move(side).turn(90);
}

// Moves to top
pitch(90).move(side).pitch(-90);

// Draws top edges and lines connecting top and base
for (var i = 0; i < 4; i++) {
  move(side).pitch(-90).move(side).move(-side).pitch(90).turn(90);
}
