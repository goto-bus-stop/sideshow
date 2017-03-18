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
      this.$el.css("animation-timing-function", "linear");
    }
    this.$el.removeClass("sideshow-hidden");

    //Needed hack to get CSS transition to work properly
    setTimeout(
      () => {
        this.$el.removeClass("sideshow-invisible");

        setTimeout(
          () => {
            this.status = VISIBLE;
            if (linearTimingFunction) {
              this.$el.css("animation-timing-function", "ease");
            }
            if (callback) {
              callback();
            }
          },
          600
        );
      },
      20
    ); //<-- Yeap, I'm really scheduling a timeout for 20 milliseconds... this is a dirty trick =)
  }

  /**
   * Does a fade out transition for the visual item
   * 
   * @method fadeOut
   */

  fadeOut(callback, linearTimingFunction) {
    if (this.status != NOT_RENDERED) {
      this.status = FADING_OUT;

      if (linearTimingFunction) {
        this.$el.css("animation-timing-function", "linear");
      }
      this.$el.addClass("sideshow-invisible");

      setTimeout(
        () => {
          this.$el.addClass("sideshow-hidden");
          this.status = NOT_DISPLAYED;
          if (linearTimingFunction) {
            this.$el.css("animation-timing-function", "ease");
          }
          if (callback) {
            callback();
          }
        },
        600
      );
    }
  }
}
