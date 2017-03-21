import foreach from "@f/foreach-array";
import remove from "@f/remove-element";
import SSException from "../general/exception";
import { currentWizard } from "../general/state";
import Arrow from "./arrow";

// https://github.com/jquery/jquery/blob/2d4f534/src/css/hiddenVisibleSelectors.js#L12
function isVisible(el) {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

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
  if (typeof targets === "string") {
    targets = document.querySelectorAll(targets);
  }

  if (targets.length > 0) {
    foreach(
      el => {
        const arrow = new Arrow();
        arrow.target.$el = el;
        if (isVisible(arrow.target.$el)) {
          Arrows.arrows.push(arrow);
          arrow.onceVisible = true;
        }
      },
      targets
    );
  } else if (!targetsChanged) {
    throw new SSException("150", "Invalid targets.");
  }
};

Arrows.recreateDOMReferences = function() {
  const parent = this.arrows[0] ? this.arrows[0].$el.parentNode : document.body;

  foreach(
    arrow => {
      remove(arrow.$el);
    },
    this.arrows
  );

  Arrows.clear();
  Arrows.setTargets(currentWizard.currentStep.targets, true);
  parent.appendChild(Arrows.render());
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
  const fragment = document.createDocumentFragment();
  this.arrows.forEach(arrow => {
    arrow.position = arrowPosition;
    fragment.appendChild(arrow.render());
  });
  return fragment;
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
    if (arrow.onceVisible && !isVisible(arrow.target.$el)) {
      brokenReference = true;
    }
  });

  if (brokenReference) {
    this.recreateDOMReferences();
  }
};

export default Arrows;
