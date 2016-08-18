/* Nathan Walters (nwalter2) MATH 198 */

// How big should the box enclosing the turtle be?
// The box is a cube ceneterd at the origin
var BOX_SIZE = 10;

var COORDINATE_AXES_ENABLED = false;
var BACKGROUND_BOX_ENABLED = true;

// Add "toString" method to the Vector3 object
THREE.Vector3.prototype.toString = function() {
  return "<" + this.x + ", " + this.y + ", " + this.z + ">";
};

var canvasElement, canvas;

// three.js objects; will be initialized once the document is ready
var scene, camera, renderer;

// Used to track info about the mouse relative to the canvas
var mouseOnCanvas, mouseX, mouseY;

// Terminal will be initialized once the document is ready
var terminal;

// Default turtle that all commands will be proxied to
// Will be created once we have a valid scene object
var turtle = null;

// User-created turtles will be stored in this object; each key in this object
// will have an associated turtle
var turtles = Object.create(null);

// Controller for the stats view
var stats;

$(document).ready(function() {
  // First thing's first: set up the canvas
  canvasElement = $("#three-canvas");
  canvas = canvasElement.get(0);

  $(window).resize(function() {
    onResized();
  });

  scene = new THREE.Scene();
  // Off-axis perspective camera
  // widen the FOV to try to improve distortion
  // Materials_texture_anisotropy
  camera = new THREE.PerspectiveCamera(40, canvasElement.parent().width() / canvasElement.parent().height(), 0.1, 1000);
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
  });

  renderer.setClearColor(0xffffff, 1);

  if (COORDINATE_AXES_ENABLED) {
    var xaxisgeometry = new THREE.Geometry();
    var xaxismaterial = new THREE.LineBasicMaterial({
      color: 0xff0000
    });
    xaxisgeometry.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(3, 0, 0));
    scene.add(new THREE.Line(xaxisgeometry, xaxismaterial));

    var yaxisgeometry = new THREE.Geometry();
    var yaxismaterial = new THREE.LineBasicMaterial({
      color: 0x00ff00
    });
    yaxisgeometry.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 3, 0));
    scene.add(new THREE.Line(yaxisgeometry, yaxismaterial));

    var zaxisgeometry = new THREE.Geometry();
    var zaxismaterial = new THREE.LineBasicMaterial({
      color: 0x0000ff
    });
    zaxisgeometry.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 3));
    scene.add(new THREE.Line(zaxisgeometry, zaxismaterial));
  }

  if (BACKGROUND_BOX_ENABLED) {
    // Scene background

    // "wall"
    var yzPlaneGeometry = new THREE.PlaneGeometry(BOX_SIZE * 2, BOX_SIZE * 2);
    var yzPlaneMaterial = new THREE.MeshPhongMaterial({
      color: 0x0ae0f5
    });
    var yzPlane = new THREE.Mesh(yzPlaneGeometry, yzPlaneMaterial);
    yzPlane.position.set(-BOX_SIZE, 0, 0);
    yzPlane.rotateY(Math.PI / 2);
    scene.add(yzPlane);

    // "wall"
    var xzPlaneGeometry = new THREE.PlaneGeometry(BOX_SIZE * 2, BOX_SIZE * 2);
    var xzPlaneMaterial = new THREE.MeshPhongMaterial({
      color: 0x0ae0f5
    });
    var xzPlane = new THREE.Mesh(xzPlaneGeometry, xzPlaneMaterial);
    xzPlane.position.set(0, -BOX_SIZE, 0);
    xzPlane.rotateX(-Math.PI / 2);
    scene.add(xzPlane);

    // "floor"
    var xyPlaneGeometry = new THREE.PlaneGeometry(BOX_SIZE * 2, BOX_SIZE * 2);
    var xyPlaneMaterial = new THREE.MeshPhongMaterial({
      color: 0x34e941
    });
    var xyPlane = new THREE.Mesh(xyPlaneGeometry, xyPlaneMaterial);
    xyPlane.position.set(0, 0, -BOX_SIZE);
    scene.add(xyPlane);
  }

  camera.position.set(BOX_SIZE * 2.5, BOX_SIZE * 2.5, BOX_SIZE * 2.5);
  camera.up = new THREE.Vector3(0, 0, 1);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  var light = new THREE.PointLight(0xffffff, 1, 100);
  light.position.set(BOX_SIZE, BOX_SIZE, BOX_SIZE);
  scene.add(light);

  // Create stats view and add it to the DOM
  stats = new Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  $('#three-canvas-container').append(stats.domElement);

  $('#run-commands').click(function(e) {
    e.preventDefault();

    eval($('#text-input').val());
  });

  // Create new terminal
  terminal = new Terminal({
    terminalId: "terminal-wrapper",
    contentId: "terminal-content",
    inputId: "terminal-input"
  });
  terminal.init();

  // Set up the draggable divider between the two halves of the UI
  Split(['#input-wrapper', '#canvas-wrapper'], {
    sizes: [25, 75],
    minSize: 500,
    snapOffset: 10,
    onDrag: function() {
      onResized();
    }
  });

  // This will set up the sizes of the canvas and the renderer correctly
  onResized();

  // Layout components
  $('#tabs-container').css({
    top: $('#main-nav').outerHeight()
  });

  console.log($('#text-input-command-bar').outerHeight());

  $('#main-nav a').click(function(e) {
    var selectedTab = $(this).attr('href');
    $(selectedTab).removeClass('hidden').siblings().addClass('hidden');
    $(this).parent('li').addClass('active').siblings().removeClass('active');

    e.preventDefault();
  });

  $('#three-canvas').mouseenter(function(e) {
    mouseOnCanvas = true;
  });

  $('#three-canvas').mouseleave(function(e) {
    mouseOnCanvas = false;
  });

  $('#three-canvas').mousemove(function(e) {
    var parentOffset = $(this).parent().offset();
    mouseX = e.pageX - parentOffset.left;
    mouseY = e.pageY - parentOffset.top;
  });

  // Create the default turtle
  turtle = new Turtle(scene, terminal);

  requestAnimationFrame(render);
});

// This should be called when the size of anything changes (broswer window, panes,
// etc.) in order to ensure that the three.js renderer size is updated properly
function onResized() {
  camera.aspect = canvasElement.parent().width() / canvasElement.parent().height();
  camera.updateProjectionMatrix();
  renderer.setSize(canvasElement.parent().width(), canvasElement.parent().height());
  canvasElement.width(canvasElement.parent().width());
  canvasElement.height(canvasElement.parent().height());
}

function render() {
  stats.begin();

  // Update each turtle
  turtle.update();
  for (var i in turtles) {
    turtles[i].update();
  }

  // Compute camera position
  camera.position.set(BOX_SIZE * 2.5, BOX_SIZE * 2.5, BOX_SIZE * 2.5);
  if (mouseOnCanvas) {
    camera.translateX((mouseX - (canvasElement.width() / 2)) / 25);
    camera.translateY(-(mouseY - (canvasElement.height() / 2)) / 25);
  }
  camera.lookAt(new THREE.Vector3(-10, -10, -10));

  renderer.render(scene, camera);

  stats.end();

  // Request next frame
  requestAnimationFrame(render);
}

/** TURTLE DRAWING COMMANDS */

function move(distance) {
  return turtle.move(distance);
}

function goto(x, y, z) {
  return turtle.goto(x, y, z);
}

function moveto(x, y, z) {
  return turtle.moveto(x, y, z);
}

function penup() {
  return turtle.penup();
}

function pendown() {
  return turtle.pendown();
}

function turn(angle) {
  return turtle.turn(angle);
}

function right(angle) {
  return turtle.right(angle);
}

function left(angle) {
  return turtle.left(angle);
}

function roll(angle) {
  return turtle.roll(angle);
}

function pitch(angle) {
  return turtle.pitch(angle);
}

function reset() {
  return turtle.reset();
}

function globalReset() {
  for (var i in turtles) {
    delete turtles[i];
  }
  turtle = new Turtle();
  return turtle;
}

function replay() {
  return turtle.replay();
}

function status() {
  return turtle.status();
}

function setMoveSpeed(speed) {
  return turtle.setMoveSpeed(speed);
}

function setTurnSpeed(speed) {
  return turtle.setTurnSpeed(speed);
}

function hide() {
  return turtle.hide();
}

function show() {
  return turtle.show();
}

function createTurtle(key) {
  var newTurtle = new Turtle(scene, terminal);
  turtles[key] = newTurtle;
  return newTurtle;
}

function deleteTurtle(key) {
  delete turtles[key];
}

function getTurtle(key) {
  if (!key) {
    return turtle;
  }
  return turtles[key];
}

function help() {
  var help = "";
  help += "Welcome to 3D Turtle!\n";
  help += "If you're unfamiliar with the concept of turtle graphics, Wikipedia has an excellent explanation of it <a href=\"https://en.wikipedia.org/wiki/Turtle_graphics\">here</a>.\n\n";
  help += "This user-facing commands are based vaguely on the python turtle module.\n\n";
  help += "To move forward, simply call 'move(distance)', where distance is how far you want the turtle to move. For instance, 'move(10)' will move the turtle 10 pixels in its current direction.\n\n";
  help += "To turn, you can call 'turn(angle)', where angle is how far the turtle should turn in degrees. A positive value will turn the turtle to the right, and a negative value will turn the turtle to the left.\n\n";
  help += "You can control the turtle's drawing behavior with calls to 'penup()' and 'pendown()'. When the pen is up, the turtle will not make any marks as it moves. The pen defaults to down.\n\n";
  help += "Commands can be chained together to make instructions easier to write. For instance, if I wanted the turle to move forwards 30 units, turn 90 degrees, and move forwards 50 units, I could write 'move(30).turn(90).move(50)'.\n\n"
  help += "You can also create multiple turtles in the same program. To create a new turtle, call createTurtle(key), where 'key' is a unique identifier for the turtle. This can be a number, a string, or any JavaScript value! This will place a new turtle at the origin with the default heading. 'createTurtle()' actually returns the new turtle, so you can immediately send commands to it. For instance, I could write 'createTurtle(\"turtle1\").turn(40).move(10)'.\n\n";
  help += "If you want to reference the turtle at a later point in time, you can call 'getTurtle(key)', where key is the unique identifier of the turtle you want to manipulate. You can then call commands on that turtle. An example: 'getTurtle(\"turtle1\").move(30).turn(20)'.\n\n";
  help += "You can make a turtle replay all of its past commands by calling 'replay()' on a turtle instance.\n\n"


  help.split('\n').forEach(function(element, index, array) {
    // Convert empty strings into a blank line
    if (element.trim().length == 0) {
      element = '&nbsp;';
    }
    terminal.outputWithClass(element, "help");
  });
}
