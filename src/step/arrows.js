import SSException from "../general/exception";
import { currentWizard } from "../general/state";
import Arrow from "./arrow";

/**
 * Class representing all the current shown arrows
 *
 * @class Arrows
 * @static
 */
var Arrows = {};

Arrows.arrows = [];

/**
 * Clear the currently defined arrows
 *
 * @method clear
 * @static
 */
Arrows.clear = function() {
  this.arrows = [];
};

/**
 * Sets the targets for arrows to point
 *
 * @method setTargets
 * @static
 */
Arrows.setTargets = function(targets, targetsChanged) {
  if (targets.constructor === String) {
    targets = $(targets);
  }

  if (targets instanceof $ && targets.length > 0) {
    targets.each(function() {
      const arrow = new Arrow();
      arrow.target.$el = $(this);
      if (arrow.target.$el.is(":visible")) {
        Arrows.arrows.push(arrow);
        arrow.onceVisible = true;
      }
    });
  } else if (!targetsChanged) {
    throw new SSException("150", "Invalid targets.");
  }
};

Arrows.recreateDOMReferences = function() {
  this.arrows.forEach(arrow => {
    arrow.$el.remove();
  });

  Arrows.clear();
  Arrows.setTargets(currentWizard.currentStep.targets, true);
  Arrows.render();
  Arrows.positionate();
  Arrows.show();
};

/**
 * Iterates over the arrows collection showing each arrow
 *
 * @method show
 * @static
 */
Arrows.show = function() {
  this.arrows.forEach(arrow => {
    arrow.show();
  });
};

/**
 * Iterates over the arrows collection hiding each arrow
 *
 * @method hide
 * @static
 */
Arrows.hide = function() {
  this.arrows.forEach(arrow => {
    arrow.hide();
  });
};

/**
 * Iterates over the arrows collection fading in each arrow
 *
 * @method fadeIn
 * @static
 */
Arrows.fadeIn = function() {
  this.arrows.forEach(arrow => {
    arrow.fadeIn();
  });
};

/**
 * Iterates over the arrows collection fading out each arrow
 *
 * @method fadeOut
 * @static
 */
Arrows.fadeOut = function() {
  this.arrows.forEach(registerFadeOut);

  function registerFadeOut(arrow) {
    arrow.fadeOut(() => {
      arrow.destroy();
    });
  }
};

/**
 * Iterates over the arrows collection repositionating each arrow
 *
 * @method positionate
 * @static
 */
Arrows.positionate = function() {
  this.arrows.forEach(arrow => {
    arrow.positionate();
  });
};

/**
 * Iterates over the arrows collection rendering each arrow
 *
 * @method render
 * @static
 */
Arrows.render = function(arrowPosition = "top") {
  this.arrows.forEach(arrow => {
    arrow.position = arrowPosition;
    arrow.render();
  });
};

/**
 * A Polling function to check if arrows coordinates has changed
 *
 * @method pollForArrowsChanges
 */
Arrows.pollForArrowsChanges = function() {
  var brokenReference = false;
  this.arrows.forEach(arrow => {
    if (arrow.hasChanged()) {
      arrow.positionate();
    }
    if (arrow.onceVisible && !arrow.target.$el.is(":visible")) {
      brokenReference = true;
    }
  });

  if (brokenReference) {
    this.recreateDOMReferences();
  }
};

export default Arrows;
