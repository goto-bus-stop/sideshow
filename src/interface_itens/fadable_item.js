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
    var item = this;
    item.status = FADING_IN;

    if (!item.$el) this.render();
    if (linearTimingFunction)
      item.$el.css("animation-timing-function", "linear");
    item.$el.removeClass("sideshow-hidden");

    //Needed hack to get CSS transition to work properly
    setTimeout(
      function() {
        item.$el.removeClass("sideshow-invisible");

        setTimeout(
          function() {
            item.status = VISIBLE;
            if (linearTimingFunction)
              item.$el.css("animation-timing-function", "ease");
            if (callback) callback();
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
    var item = this;
    if (item.status != NOT_RENDERED) {
      item.status = FADING_OUT;

      if (linearTimingFunction)
        item.$el.css("animation-timing-function", "linear");
      item.$el.addClass("sideshow-invisible");

      setTimeout(
        function() {
          item.$el.addClass("sideshow-hidden");
          item.status = NOT_DISPLAYED;
          if (linearTimingFunction)
            item.$el.css("animation-timing-function", "ease");
          if (callback) callback();
        },
        600
      );
    }
  }
}
