/* Nathan Walters (nwalter2) MATH 198 */

function Turtle(scene, terminal) {
  // "Constants" for each turtle's default state
  this.DEFAULT_POSITION = new THREE.Vector3(0, 0, 0);
  this.DEFAULT_HEADING = new THREE.Vector3(1, 0, 0);
  this.DEFAULT_NORMAL = new THREE.Vector3(0, 0, 1);

  // Turtle speed, in px/sec
  this.TURTLE_MOVE_SPEED = 5;
  // Turtle turn speed, in rad/sec
  this.TURTLE_TURN_SPEED = Math.PI * 2;

  this.AXIS_LINES_ENABLED = false;
  this.TURTLE_MODEL_ENABLED = true;

  // Store the terminal so we can output to it if needed
  if (terminal === undefined) {
    terminal = null;
  } else {
    this.terminal = terminal;
  }

  // These will be used to track all the lines that the turtle creates
  this.currentLine = null;
  this.lines = [];

  // All of the geometry this turtle creates will be added to a separate scene
  // That scene, in turn, is added to the global scene. This keeps the generated
  // geometry of different turtles separate
  this.scene = new THREE.Scene();
  this.turtleScene = new THREE.Scene();
  this.scene.add(this.turtleScene);
  scene.add(this.scene);

  if (this.AXIS_LINES_ENABLED) {
    // These lines will be drawn to indicate the heading, normal, and pitch vectors
    // of the turtle
    this.headingLine = new THREE.Line(new THREE.Geometry(), new THREE.LineBasicMaterial({
      color: 0xff0000
    }));
    this.headingLine.geometry.vertices.push(new THREE.Vector3(0, 0, 0), this.DEFAULT_HEADING);

    this.normalLine = new THREE.Line(new THREE.Geometry(), new THREE.LineBasicMaterial({
      color: 0x00ff00
    }));
    this.normalLine.geometry.vertices.push(new THREE.Vector3(0, 0, 0), this.DEFAULT_NORMAL);

    this.pitchLine = new THREE.Line(new THREE.Geometry(), new THREE.LineBasicMaterial({
      color: 0x0000ff
    }));
    this.pitchLine.geometry.vertices.push(new THREE.Vector3(0, 0, 0), this.DEFAULT_HEADING.clone().cross(this.DEFAULT_NORMAL));

    this.scene.add(this.headingLine);
    this.scene.add(this.normalLine);
    this.scene.add(this.pitchLine);
  }

  if (this.TURTLE_MODEL_ENABLED) {
    // We will build a model turtle from several geometrical shapes:
    // * A hemisphere for its shell
    // * A circle for the bottom of the shell
    // * A sphere for its head
    var turtleRadius = 1;
    var turtleHeadRadius = 0.3;

    // Build the shell (hemisphere)
    var shellGeometry = new THREE.SphereGeometry(turtleRadius, 20, 20, 0, 2 * Math.PI, 0, Math.PI / 2);
    var shellMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ff00
    });
    var shell = new THREE.Mesh(shellGeometry, shellMaterial);
    this.turtleScene.add(shell);

    // Build the belly (circle)
    var bellyGeometry = new THREE.CircleGeometry(turtleRadius, 20);
    var bellyMaterial = new THREE.MeshPhongMaterial({
      color: 0x99ff88
    });
    var belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
    belly.rotation.x = Math.PI / 2;
    this.turtleScene.add(belly);

    // Build the head (sphere)
    var headGeometry = new THREE.SphereGeometry(turtleHeadRadius, 20, 20);
    var headMaterial = new THREE.MeshPhongMaterial({
      color: 0x99ff88
    });
    var head = new THREE.Mesh(headGeometry, headMaterial);
    // Position the head so it is tangent to both the plane of the turtle's belly
    // and the turtle's shell
    head.position.set(0, turtleHeadRadius, Math.sqrt(Math.pow(turtleRadius + turtleHeadRadius, 2) - Math.pow(turtleHeadRadius, 2)));
    this.turtleScene.add(head);
  }


  // These vectors track the turtle's state; they are updated immediately after
  // every command
  this.position = this.DEFAULT_POSITION;
  this.heading = this.DEFAULT_HEADING;
  this.normal = this.DEFAULT_NORMAL;

  // These vectors track the turtle's state as it is being rendered
  this.renderedPosition = this.DEFAULT_POSITION;
  this.renderedHeading = this.DEFAULT_HEADING;
  this.renderedNormal = this.DEFAULT_NORMAL;
  this.renderedPenDown = true;

  // Variables to track the turtle's commands and current rendering state
  this.commands = [];
  this.currentCommand = 0;
  this.currentCommandDuration = 0;
  this.currentCommandStartTime = 0;
  this.finishedLastCommand = false;
  this.isRendering = false;
};

Turtle.prototype.constructor = Turtle;

// Appends a new command to the end of the list of commands
Turtle.prototype.pushCommand = function(command) {
  this.commands.push(command);
};

// Returns the total number of commands this turtle has received
Turtle.prototype.commandCount = function() {
  return this.commands.length;
};

Turtle.prototype.update = function() {
  var lineMaterial = new THREE.LineBasicMaterial({
    color: 0x000000
  });

  if (this.isRendering && this.finishedLastCommand) {
    // In the last update cycle, the turle finished executing a command
    this.isRendering = false;
    this.finishedLastCommand = false;
    this.currentCommand++;
    if (this.currentLine) {
      // If the last command generated a line, push it into the line history array
      this.lines.push(this.currentLine);
      this.currentLine = null;
    }
  }

  if (!this.isRendering && this.currentCommand < this.commandCount()) {
    // There is a new command in the queue, start drawing it
    this.isRendering = true;
    this.currentCommandStartTime = Date.now();
    this.currentCommandDuration = this.computeDurationForCommand(this.commands[this.currentCommand]);
  }

  if (this.isRendering) {
    var interpolationFactor = this.currentCommandDuration > 0 ? ((Date.now() - this.currentCommandStartTime) / this.currentCommandDuration) : 1;
    if (interpolationFactor >= 1) {
      // The current command is complete
      interpolationFactor = 1;
      this.finishedLastCommand = true;
    }

    var command = this.commands[this.currentCommand];
    if (command.commandType == "move") {
      // Linearly interpolate the position vector between the start and end position
      this.renderedPosition = new THREE.Vector3().lerpVectors(command.startPosition, command.endPosition, interpolationFactor);
      if (interpolationFactor == 1) {
        // Once this command has completed, use the actual computed end position
        // to sync the rendered state with the actual state of the turtle
        // If we don't do this, floating point error will accumulate over time
        this.renderedPositon = command.endPosition;
      }
      if (this.renderedPenDown) {
        // currentLine is set to null after every command completes; if it is null,
        // this is our first pass over this command, so we need to create a line
        // to represent it
        if (!this.currentLine) {
          this.currentLine = new THREE.Line(new THREE.Geometry(), lineMaterial);
          // This is important: if frustrum culling is enabled and a vertex of
          // this line lies behind the camera, the line won't be drawn properly
          this.currentLine.frustumCulled = false;
          this.scene.add(this.currentLine);
        }
        // Tell three.js that the vertices have changed
        this.currentLine.geometry.verticesNeedUpdate = true;
        this.currentLine.geometry.vertices[0] = command.startPosition;
        this.currentLine.geometry.vertices[1] = this.renderedPosition;
      }
    } else if (command.commandType == "goto") {
      // Immediately jump the turtle to this position
      this.renderedPosition = command.position;
    } else if (command.commandType == "turn") {
      // Calculate interpolated heading
      var interAngle = command.angle * interpolationFactor;
      this.renderedHeading = command.startHeading.clone().applyAxisAngle(this.renderedNormal, interAngle);
      if (interpolationFactor == 1) {
        // Once this command has completed, use the actual computed end heading
        // to sync the rendered state with the actual state of the turtle
        // If we don't do this, error will accumulate over time
        this.renderedHeading = command.endHeading;
      }
    } else if (command.commandType == "roll") {
      // Calculate interpolated normal
      var interAngle = command.angle * interpolationFactor;
      this.renderedNormal = command.startNormal.clone().applyAxisAngle(this.renderedHeading, interAngle);
      if (interpolationFactor == 1) {
        // Once this command has completed, use the actual computed end normal
        // to sync the rendered state with the actual state of the turtle
        // If we don't do this, error will accumulate over time
        this.renderedNormal = command.endNormal;
      }
    } else if (command.commandType == "pitch") {
      // Calculate interpolated heading & normal
      var pitchAxis = command.startHeading.clone().cross(command.startNormal);
      var interAngle = command.angle * interpolationFactor;
      this.renderedHeading = command.startHeading.clone().applyAxisAngle(pitchAxis, interAngle);
      this.renderedNormal = command.startNormal.clone().applyAxisAngle(pitchAxis, interAngle);
      if (interpolationFactor == 1) {
        // Once this command has completed, use the actual computed end heading
        // and normal to sync the rendered state with the actual state of the turtle
        // If we don't do this, error will accumulate over time
        this.renderedHeading = command.endHeading;
        this.renderedNormal = command.endNormal;
      }
    } else if (command.commandType == "penup") {
      this.renderedPenDown = false;
    } else if (command.commandType == "pendown") {
      this.renderedPenDown = true;
    }
  }

  if (this.AXIS_LINES_ENABLED) {
    // Update the reference frame vectors to correspond to the computed vector states
    this.headingLine.geometry.verticesNeedUpdate = true;
    this.headingLine.geometry.vertices[1] = this.renderedHeading;
    this.normalLine.geometry.verticesNeedUpdate = true;
    this.normalLine.geometry.vertices[1] = this.renderedNormal;
    this.pitchLine.geometry.verticesNeedUpdate = true;
    this.pitchLine.geometry.vertices[1] = this.renderedHeading.clone().cross(this.renderedNormal);

    // Move the turtle frame indicators to the turtle's current rendered position
    // Their "tails" will be located at the turtle's current position
    this.normalLine.position.copy(this.renderedPosition);
    this.headingLine.position.copy(this.renderedPosition);
    this.pitchLine.position.copy(this.renderedPosition);
  }

  this.turtleScene.position.copy(this.renderedPosition);
  this.turtleScene.up = this.renderedNormal.clone();
  // lookAt(...) will rotate the object so that its z-axis points in the direction
  // of the specified point. In this case, that point should be the intersection of
  // the turtle's heading vector and the surface of the unit sphere centered at
  // the turtle's current position
  this.turtleScene.lookAt(this.renderedHeading.clone().add(this.renderedPosition));
};

// Returns how long it should take for the given command to complete in milliseconds
// The default duration is 0ms (the command completes immediately)
// Special cases can be added to compute the duration if a command should be smoothly animated
// For instance, for a "move" command we will want to smoothly animate the turtle between the starting and ending positions
Turtle.prototype.computeDurationForCommand = function(command) {
  if (command.commandType == "move") {
    if (this.TURTLE_MOVE_SPEED <= 0) {
      return 0;
    }
    var deltaDistance = new THREE.Vector3().subVectors(command.endPosition, command.startPosition).length();
    return (deltaDistance / this.TURTLE_MOVE_SPEED) * 1000;
  } else if (command.commandType == "turn" || command.commandType == "roll" || command.commandType == "pitch") {
    if (this.TURTLE_TURN_SPEED <= 0) {
      return 0;
    }
    return (Math.abs(command.angle) / this.TURTLE_TURN_SPEED) * 1000;
  } else {
    return 0;
  }
};

Turtle.prototype.move = function(distance) {
  // We compute the end position by multiplying the normalized heading vector by
  // the scalar of how far we want to move, and then adding it to the current position vector
  var endPosition = new THREE.Vector3().copy(this.heading).normalize().multiplyScalar(distance).add(this.position);
  var command = {
    commandType: "move",
    startPosition: this.position,
    endPosition: endPosition
  };
  this.pushCommand(command);
  this.position = endPosition;
  return this;
};

Turtle.prototype.turn = function(angle) {
  // Convert angle to radians
  angle = angle * (Math.PI / 180);
  // We renormalize the end heading to remove any floating-point arithmetic error that
  // can accumulate over time
  var endHeading = this.heading.clone().applyAxisAngle(this.normal, angle).normalize();
  var command = {
    commandType: "turn",
    startHeading: this.heading,
    endHeading: endHeading,
    angle: angle
  };
  this.pushCommand(command);
  this.heading = endHeading;
  return this;
};

// Alias for turn(...)
Turtle.prototype.right = function(angle) {
  this.turn(-1 * angle);
  return this;
};

// Alias for turn(...) that turns by (-1 * angle)
Turtle.prototype.left = function(angle) {
  this.turn(angle);
  return this;
};

Turtle.prototype.roll = function(angle) {
  // Convert angle to radians
  angle = angle * (Math.PI / 180);
  // Renormalize the resultant vector to stop the accumulation of floating-point error
  var endNormal = this.normal.clone().applyAxisAngle(this.heading, angle).normalize();
  var command = {
    commandType: "roll",
    startNormal: this.normal,
    endNormal: endNormal,
    angle: angle
  }
  this.pushCommand(command);
  this.normal = endNormal;
  return this;
};

Turtle.prototype.pitch = function(angle) {
  // Convert angle to radians
  angle = angle * (Math.PI / 180);
  // Renormalize vectors to stop the accumulation of floating-point error
  var pitchAxis = this.heading.clone().cross(this.normal).normalize();
  var endHeading = this.heading.clone().applyAxisAngle(pitchAxis, angle).normalize();
  var endNormal = this.normal.clone().applyAxisAngle(pitchAxis, angle).normalize();
  var command = {
    commandType: "pitch",
    startHeading: this.heading,
    endHeading: endHeading,
    startNormal: this.normal,
    endNormal: endNormal,
    angle: angle
  }
  this.pushCommand(command);
  this.heading = endHeading;
  this.normal = endNormal;
  return this;
};

Turtle.prototype.goto = function(x, y, z) {
  var position = new THREE.Vector3(x, y, z);
  var command = {
    commandType: "goto",
    position: position
  }
  this.pushCommand(command);
  this.position = position;
  return this;
};

Turtle.prototype.moveto = function(x, y, z) {
  var position = new THREE.Vector3(x, y, z);
  // Reuse move command
  var command = {
    commandType: "move",
    startPosition: this.position,
    endPosition: position
  }
  this.pushCommand(command);
  this.position = position;
  return this;
}

Turtle.prototype.penup = function() {
  var command = {
    commandType: "penup"
  };
  this.pushCommand(command);
  return this;
};

Turtle.prototype.pendown = function() {
  var command = {
    commandType: "pendown"
  };
  this.pushCommand(command);
  return this;
};

Turtle.prototype.reset = function() {
  // Remove all past commands
  while (this.commands.length > 0) {
    this.commands.pop();
  }

  // Remove all lines this turtle has created
  while (this.lines.length > 0) {
    this.scene.remove(this.lines.pop());
  }

  // Remove the current line if the turtle is in the process of executing a command
  if (this.currentLine) {
    this.scene.remove(this.currentLine);
    this.currentLine = null;
  }

  this.currentCommand = 0;
  this.isRendering = false;

  // Reset the turtle's state
  this.position = this.DEFAULT_POSITION
  this.heading = this.DEFAULT_HEADING;
  this.normal = this.DEFAULT_NORMAL;

  this.renderedPosition = this.DEFAULT_POSITION;
  this.renderedHeading = this.DEFAULT_HEADING;
  this.renderedNormal = this.DEFAULT_NORMAL;
  this.renderedPenDown = true;

  return this;
};

// Prints the turtle's current position  and orientation
Turtle.prototype.status = function() {
  if (typeof THREE.Vector3.toString === 'function' && this.terminal != null) {
    this.terminal.output("Position vector: " + this.position.toString());
    this.terminal.output("Heading vector: " + this.heading.toString());
    this.terminal.output("Normal vector: " + this.normal.toString());
    this.terminal.output("Pitch vector: " + this.heading.clone().cross(this.normal).toString());
  }

  return this;
};

// Replays all turtle's commands
// Similar to reset(), except it doesn't actually delete the commands this turtle has been given
Turtle.prototype.replay = function() {
  // Remove all lines from this turtle's scene
  while (this.lines.length > 0) {
    this.scene.remove(this.lines.pop());
  }
  if (this.currentLine) {
    this.scene.remove(this.currentLine);
  }
  this.currentLine = null;

  // Stop rendering and reset the current command pointer to 0
  this.isRendering = false;
  this.currentCommand = 0;

  // Reset the turtle's state
  this.position = this.DEFAULT_POSITION
  this.heading = this.DEFAULT_HEADING;
  this.normal = this.DEFAULT_NORMAL;

  this.renderedPosition = this.DEFAULT_POSITION;
  this.renderedHeading = this.DEFAULT_HEADING;
  this.renderedNormal = this.DEFAULT_NORMAL;
  this.renderedPenDown = true;

  return this;
};

Turtle.prototype.setMoveSpeed = function(speed) {
  this.TURTLE_MOVE_SPEED = speed;

  return this;
};

Turtle.prototype.setTurnSpeed = function(speed) {
  this.TURTLE_TURN_SPEED = speed;

  return this;
}

Turtle.prototype.hide = function() {
  this.turtleScene.visible = false;

  return this;
}

Turtle.prototype.show = function() {
  this.turtleScene.visible = true;

  return this;
}
