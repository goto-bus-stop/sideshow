/**
 * A part composing the mask
 * 
 * @class Part
 * @@initializer 
 * @param {Object} position The positioning information 
 * @param {Object} dimension The dimension information 
 */

class Part extends VisualItem {
  /**
   * An object holding positioning information for the mask part
   * 
   * @@field position
   * @type Object
   */

  position = {};

  /**
   * An object holding dimension information for the mask part
   * 
   * @@field position
   * @type Object
   */

  dimension = {};

  /**
   * Renders the mask part
   * 
   * @method render
   */

  render() {
    this.$el = $("<div>")
      .addClass("sideshow-mask-part")
      .addClass("sideshow-hidden")
      .addClass("sideshow-invisible");
    super.render();
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
    this.$el
      .css("left", position.x)
      .css("top", position.y)
      .css("width", dimension.width)
      .css("height", dimension.height);
  }
}

Mask.CompositeMask.Part = Part;
