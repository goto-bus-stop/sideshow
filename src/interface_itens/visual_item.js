/**
 * A visual item 
 * 
 * @class VisualItem
 * @@abstract
 */
class VisualItem {
  /**
   * The jQuery wrapped DOM element for the visual item
   * 
   * @@field $el
   * @type Object 
   */

  $el = null;

  /**
   * The jQuery wrapped DOM element for the visual item
   * 
   * @@field $el
   * @type AnimationStatus 
   */

  status = AnimationStatus.NOT_RENDERED;

  /**
   * Renders the item's DOM object
   * 
   * @method render
   */

  render($parent) {
    ($parent || $body).append(this.$el);
    this.status = AnimationStatus.NOT_DISPLAYED;
  }

  /**
   * Destroys the item's DOM object
   * 
   * @method destroy
   */

  destroy() {
    this.$el.remove();
  }
}
