import VisualItem from "../interface_itens/visual_item";

/**
 * A corner part composing the mask
 * 
 * @class CornerPart
 * @@initializer 
 * @param {Object} position The positioning information 
 * @param {Object} dimension The dimension information 
 */

export default class CornerPart extends VisualItem {
  /**
   * An object holding positioning information for the mask corner part
   * 
   * @@field position
   * @type Object
   */

  position = {};

  /**
   * An object holding dimension information for the mask corner part
   * 
   * @@field position
   * @type Object
   */

  dimension = {};

  /**
   * An object holding border radius information for the mask corner part
   * 
   * @@field borderRadius
   * @type Object
   */

  borderRadius = 0;

  /**
   * Formats the SVG path for the corner part
   * 
   * @method SVGPathPointsTemplate
   * @param {Number} borderRadius The corner part border radius
   * @static
   */

  static SVGPathPointsTemplate(borderRadius) {
    return "m 0,0 0," +
      borderRadius +
      " C 0," +
      borderRadius * 0.46 +
      " " +
      borderRadius * 0.46 +
      ",0 " +
      borderRadius +
      ",0";
  }

  /**
   * Renders the SVG for the corner part
   * 
   * @method buildSVG
   * @param {Number} borderRadius The corner part border radius
   * @static
   */

  static buildSVG(borderRadius) {
    function SVG(nodeName) {
      return document.createElementNS("http://www.w3.org/2000/svg", nodeName);
    }

    var bezierPoints = this.SVGPathPointsTemplate(borderRadius);
    var $svg = $(SVG("svg"));
    var $path = $(SVG("path"));

    $path.attr("d", bezierPoints);
    $svg.append($path);

    return $svg[0];
  }

  /**
   * Renders the mask corner part
   * 
   * @method render
   * @return {Object} The corner part jQuery wrapped DOM element
   */

  render() {
    this.$el = $("<div>")
      .addClass("sideshow-mask-corner-part")
      .addClass("sideshow-hidden")
      .addClass("sideshow-invisible");
    this.$el.append(CornerPart.buildSVG(this.borderRadius));
    $body.append(this.$el);
    return this.$el;
  }

  /**
   * Updates the positioning and border radius of the mask corner part
   * 
   * @method update
   * @param {Object} position The positioning information 
   * @param {Object} borderRadius The border radius information 
   */

  update(position, borderRadius) {
    this.$el
      .css("left", position.x)
      .css("top", position.y)
      .css("width", borderRadius)
      .css("height", borderRadius);

    $(this.$el)
      .find("path")
      .attr("d", CornerPart.SVGPathPointsTemplate(borderRadius));
  }
}
