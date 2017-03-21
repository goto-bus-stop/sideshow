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
 */
class Arrows {
  arrows = [];

  /**
   * Clear the currently defined arrows
   *
   * @method clear
   */
  clear() {
    this.arrows = [];
  }

  /**
   * Sets the targets for arrows to point
   *
   * @method setTargets
   */
  setTargets(targets, targetsChanged) {
    if (typeof targets === "string") {
      targets = document.querySelectorAll(targets);
    }

    if (targets.length > 0) {
      foreach(
        el => {
          const arrow = new Arrow();
          arrow.target.$el = el;
          if (isVisible(arrow.target.$el)) {
            this.arrows.push(arrow);
            arrow.onceVisible = true;
          }
        },
        targets
      );
    } else if (!targetsChanged) {
      throw new SSException("150", "Invalid targets.");
    }
  }

  recreateDOMReferences() {
    const parent = this.arrows[0] ? this.arrows[0].$el.parentNode : document.body;

    foreach(
      arrow => {
        remove(arrow.$el);
      },
      this.arrows
    );

    this.clear();
    this.setTargets(currentWizard.currentStep.targets, true);
    parent.appendChild(this.render());
    this.positionate();
    this.show();
  }

  /**
   * Iterates over the arrows collection showing each arrow
   *
   * @method show
   */
  show() {
    foreach(arrow => arrow.show(), this.arrows);
  }

  /**
   * Iterates over the arrows collection hiding each arrow
   *
   * @method hide
   */
  hide() {
    foreach(arrow => arrow.hide(), this.arrows);
  }

  /**
   * Iterates over the arrows collection fading in each arrow
   *
   * @method fadeIn
   */
  fadeIn() {
    foreach(arrow => arrow.fadeIn(), this.arrows);
  }

  /**
   * Iterates over the arrows collection fading out each arrow
   *
   * @method fadeOut
   */
  fadeOut() {
    foreach(registerFadeOut, this.arrows);

    function registerFadeOut(arrow) {
      arrow.fadeOut(() => {
        arrow.destroy();
      });
    }
  }

  /**
   * Iterates over the arrows collection repositionating each arrow
   *
   * @method positionate
   */
  positionate() {
    foreach(arrow => arrow.positionate(), this.arrows);
  }

  /**
   * Iterates over the arrows collection rendering each arrow
   *
   * @method render
   */
  render(arrowPosition = "top") {
    const fragment = document.createDocumentFragment();
    foreach(arrow => {
      arrow.position = arrowPosition;
      fragment.appendChild(arrow.render());
    }, this.arrows);
    return fragment;
  }

  /**
   * A Polling function to check if arrows coordinates has changed
   *
   * @method pollForArrowsChanges
   */
  pollForArrowsChanges() {
    let brokenReference = false;
    foreach(arrow => {
      if (arrow.hasChanged()) {
        arrow.positionate();
      }
      if (arrow.onceVisible && !isVisible(arrow.target.$el)) {
        brokenReference = true;
      }
    }, this.arrows);

    if (brokenReference) {
      this.recreateDOMReferences();
    }
  }
}

export default new Arrows();
