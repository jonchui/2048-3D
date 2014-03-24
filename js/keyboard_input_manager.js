function KeyboardInputManager() {
  this.events = {};

  this.listen();
}

/*
   +-------------> x
   |
   |
   |
   |
   |
   v

   y

         -PI/2
           |
           |
 PI  ------+------ 0
           |
           |
         +PI/2

*/
function getSwipeAngle (dy, dx) {
  
}

KeyboardInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

KeyboardInputManager.prototype.listen = function () {
  var self = this;

  var map = {
    38:  0, // Up
    39:  1, // Right
    40:  2, // Down
    37:  3, // Left
	109: 4, // Minus
	107: 5, // Plus
    75:  0, // vim keybindings
    76:  1,
    74:  2,
    72:  3,
    87:  0, // W
    68:  1, // D
    83:  2, // S
    65:  3, // A
    81:  4, // Q
	69:  5  // E
  };

  document.addEventListener("keydown", function (event) {
    var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                    event.shiftKey;
    var mapped    = map[event.which];
	console.log(event.which);
    if (!modifiers) {
      if (mapped !== undefined) {
        event.preventDefault();
        self.emit("move", mapped);
      }

      if (event.which === 32) self.restart.bind(self)(event);
    }
  });

  var retry = document.getElementsByClassName("retry-button")[0];
  retry.addEventListener("click", this.restart.bind(this));

  // Listen to swipe events
  var touchStartClientX, touchStartClientY;
  var gameContainer = document.getElementsByClassName("viewport")[0];

  gameContainer.addEventListener("touchstart", function (event) {
    if (event.touches.length > 1) return;

    touchStartClientX = event.touches[0].clientX;
    touchStartClientY = event.touches[0].clientY;
    event.preventDefault();
  });

  gameContainer.addEventListener("touchmove", function (event) {
    event.preventDefault();
  });

  gameContainer.addEventListener("touchend", function (event) {
    if (event.touches.length > 0) return;

    var dx = event.changedTouches[0].clientX - touchStartClientX;
    var absDx = Math.abs(dx);

    var dy = event.changedTouches[0].clientY - touchStartClientY;
    var absDy = Math.abs(dy);
                                   

    if (Math.max(absDx, absDy) > 10) {
      var angle = Math.atan2 (dy, dx);
      var p = Math.PI / 8;
      if ((-3*p <= angle) && (angle <= -p)) {
        self.emit("move", 0); // up
      }
      else if ((-p < angle) && (angle <= 2*p)) {
        self.emit("move", 1); // right
      }
      else if ((2*p < angle) && (angle < 5*p)) {
        self.emit("move", 5); // plus
      }
      else if ((5*p <= angle) && (angle <= 7*p)) {
        self.emit("move", 2); // down
      }
      else if ((7*p < angle) || (angle < -6*p)) {
        self.emit("move", 3); // left
      }
      else if ((-6*p <= angle) && (angle < -3*p)) {
        self.emit("move", 4); // minus
      }
    }
  });
};

KeyboardInputManager.prototype.restart = function (event) {
  event.preventDefault();
  this.emit("restart");
};
