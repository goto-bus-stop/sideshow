import applyStyles from "@f/apply-styles";
import addClass from "@f/add-class";
import removeClass from "@f/remove-class";
import {
  FADING_IN,
  VISIBLE,
  NOT_DISPLAYED,
  NOT_RENDERED,
  FADING_OUT
} from "../general/AnimationStatus";
import HidableItem from "./hidable_item";

/**
 * A visual item which holds fading in and out capabilities
 *
 * @class FadableItem
 * @@abstract
 * @extends HidableItem
 */

export default class FadableItem extends HidableItem {
  /**
   * Does a fade in transition for the visual item
   *
   * @method fadeIn
   */

  fadeIn(callback, linearTimingFunction) {
    this.status = FADING_IN;

    if (!this.$el) {
      this.render();
    }
    if (linearTimingFunction) {
      applyStyles(this.$el, { animationTimingFunction: "linear" });
    }
    removeClass("sideshow-hidden", this.$el);

    // Needed hack to get CSS transition to work properly
    setTimeout(
      () => {
        removeClass("sideshow-invisible", this.$el);

        setTimeout(
          () => {
            this.status = VISIBLE;
            if (linearTimingFunction) {
              applyStyles(this.$el, { animationTimingFunction: "ease" });
            }
            if (callback) {
              callback();
            }
          },
          600
        );
      },
      20
    ); // <-- Yeap, I'm really scheduling a timeout for 20 milliseconds... this is a dirty trick =)
  }

  /**
   * Does a fade out transition for the visual item
   *
   * @method fadeOut
   */

  fadeOut(callback, linearTimingFunction) {
    if (this.status === NOT_RENDERED) {
      return;
    }

    this.status = FADING_OUT;

    if (linearTimingFunction) {
      applyStyles(this.$el, { animationTimingFunction: "linear" });
    }
    addClass("sideshow-invisible", this.$el);

    setTimeout(
      () => {
        addClass("sideshow-hidden", this.$el);
        this.status = NOT_DISPLAYED;
        if (linearTimingFunction) {
          applyStyles(this.$el, { animationTimingFunction: "ease" });
        }
        if (callback) {
          callback();
        }
      },
      600
    );
  }
}
