import applyStyles from "@f/apply-styles";
import html from "bel";
import VisualItem from "../interface_items/visual_item";

/**
 * A part composing the mask.
 */

export default class Part extends VisualItem {
  /**
   * An object holding positioning information for the mask part
   * 
   * @field position
   * @type Object
   */

  position = {};

  /**
   * An object holding dimension information for the mask part
   * 
   * @field position
   * @type Object
   */

  dimension = {};

  /**
   * Renders the mask part
   * 
   * @method render
   */

  render(parent) {
    this.$el = html`
      <div class="sideshow-mask-part" />
    `;
    super.render(parent);
  }

  /**
   * Updates the dimension and positioning of the subject mask part
   * 
   * @method update
   * @param {Object} position The positioning information 
   * @param {Object} dimension The dimension information 
   */

  update(position, dimension) {
    this.position = position;
    this.dimension = dimension;
    applyStyles(this.$el, {
      left: position.x,
      top: position.y,
      width: dimension.width,
      height: dimension.height
    });
  }
}
