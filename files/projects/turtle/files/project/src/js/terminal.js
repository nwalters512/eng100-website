/* Nathan Walters (nwalter2) MATH 198 */

function Terminal(config) {
  if (!config.inputId || !config.contentId || !config.terminalId) {
    console.error("Terminals must be created with IDs for the terminal, input, and content elements!");
  }

  this.terminalId = config.terminalId;
  this.inputId = config.inputId;
  this.contentId = config.contentId;

  this.history = [];
  this.tempHistory = null;
  this.selectedInputIndex = -1;
}

Terminal.prototype.constructor = Terminal;

Terminal.prototype.init = function() {
  // All clicks on the terminal should send the cursor to the input box
  $('#' + this.terminalId).click(this, function(e) {
    $('#' + e.data.inputId).focus();
  });
  $('#' + this.inputId).focus();

  // Listen for enter on the text input box
  $('#' + this.inputId).keydown(this, function(e) {
    if (e.which == 13) {
      // Enter pressed
      e.data.onEnterPressed();
    } else if (e.which == 38) {
      // Up key pressed
      e.preventDefault();
      e.data.onUpArrowPressed();
    } else if (e.which == 40) {
      // Down key pressed
      e.preventDefault();
      e.data.onDownArrowPressed();
    }
  });
}

Terminal.prototype.processNextCommand = function(command) {
  var command = command.trim();

  // Store the command so we can use up arrow to cycle through past commands
  this.appendToHistory(command);

  // Display the current command in the "terminal"
  this.output(command);

  try {
    eval(command);
  } catch (exception) {
    this.outputWithClass("Error while executing '" + originalCommand + "'", "error");
    this.outputWithClass(exception.toString(), "error");
  }

  // Clear the input box
  this.setInput('');

  // Scroll to the bottom of the terminal
  this.scrollToBottom();
};

Terminal.prototype.scrollToBottom = function() {
  $('#' + this.terminalId).scrollTop($('#' + this.terminalId).prop('scrollHeight'));
};

Terminal.prototype.output = function(text) {
  $('#' + this.contentId).append('<p>' + text + '</p>');
};

Terminal.prototype.outputWithClass = function(text, clazz) {
  $('#' + this.contentId).append('<p class="' + clazz + '">' + text + '</p>');
};

Terminal.prototype.clear = function() {
  $('#' + this.contentId).empty();
};

Terminal.prototype.appendToHistory = function(input) {
  this.history.push(input);
};

Terminal.prototype.setInput = function(input) {
  $('#' + this.inputId).val(input);
};

Terminal.prototype.onEnterPressed = function() {
  var command = $('#' + this.inputId).val().trim();
  this.processNextCommand(command);
  this.selectedInputIndex = -1;
  this.tempHistory = null;
};

Terminal.prototype.onUpArrowPressed = function() {
  // If we haven't yet started scrolling through past commands, store whatever
  // is currently in the input box in the tempHistory variable
  if (this.selectedInputIndex < 0) {
    this.tempHistory = $('#' + this.inputId).val().trim();
  }
  this.selectedInputIndex++;
  if (this.selectedInputIndex > this.history.length - 1) {
    this.selectedInputIndex = this.history.length - 1;
  }
  if (this.history.length > 0) {
    this.setInput(this.history[this.history.length - 1 - this.selectedInputIndex]);
  }
};

Terminal.prototype.onDownArrowPressed = function() {
  // If selectedInputIndex == -1, the user hasn't yet pressed "up" to kick us
  // into "past command" mode. Ignore this.
  if (this.selectedInputIndex < 0) {
    return true;
  }

  this.selectedInputIndex--;
  if (this.selectedInputIndex < -1) {
    this.selectedInputIndex = -1;
  }
  if (this.history.length > -1 && this.selectedInputIndex >= 0) {
    this.setInput(this.history[this.history.length - 1 - this.selectedInputIndex]);
  } else {
    this.setInput(this.tempHistory);
  }
};
