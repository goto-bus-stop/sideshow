/**
 * A visual item which can be shown and hidden
 * 
 * @class HidableItem
 * @@abstract
 * @extends VisualItem
 */
class HidableItem extends VisualItem {
  /**
   * Shows the visual item
   * 
   * @method show
   * @param {boolean} displayButKeepTransparent The item will hold space but keep invisible
   */

  show(displayButKeepTransparent) {
    if (!this.$el) this.render();
    if (!displayButKeepTransparent) this.$el.removeClass("sideshow-invisible");
    this.$el.removeClass("sideshow-hidden");
    this.status = AnimationStatus.VISIBLE;
  }

  /**
   * Hides the visual item
   *
   * @method hide
   */

  hide(keepHoldingSpace) {
    if (!keepHoldingSpace) this.$el.addClass("sideshow-hidden");
    this.$el.addClass("sideshow-invisible");
    this.status = AnimationStatus.NOT_DISPLAYED;
  }
}
