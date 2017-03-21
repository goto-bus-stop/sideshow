import html from "bel";
import applyStyles from "@f/apply-styles";
import VisualItem from "../interface_items/visual_item";

/**
 * A corner part composing the mask.
 */

export default class CornerPart extends VisualItem {
  /**
   * An object holding positioning information for the mask corner part
   *
   * @field position
   * @type Object
   */

  position = {};

  /**
   * An object holding dimension information for the mask corner part
   *
   * @field position
   * @type Object
   */

  dimension = {};

  /**
   * An object holding border radius information for the mask corner part
   *
   * @field borderRadius
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
    return `m 0,0 0,${borderRadius} C 0,${borderRadius * 0.46} ${borderRadius * 0.46},0 ${borderRadius},0`;
  }

  /**
   * Renders the SVG for the corner part
   *
   * @method buildSVG
   * @param {Number} borderRadius The corner part border radius
   * @static
   */

  static buildSVG(borderRadius) {
    function createSvgNode(nodeName) {
      return document.createElementNS("http://www.w3.org/2000/svg", nodeName);
    }

    const bezierPoints = this.SVGPathPointsTemplate(borderRadius);
    const svg = createSvgNode("svg");
    const path = createSvgNode("path");

    path.setAttribute("d", bezierPoints);
    svg.appendChild(path);

    return svg;
  }

  /**
   * Renders the mask corner part
   *
   * @method render
   * @return {Object} The corner part jQuery wrapped DOM element
   */

  render() {
    this.$el = html`
      <div class="sideshow-mask-corner-part">
        ${CornerPart.buildSVG(this.borderRadius)}
      </div>
    `;

    super.render();
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
    applyStyles(this.$el, {
      left: position.x,
      top: position.y,
      width: borderRadius,
      height: borderRadius
    });

    this.$el
      .querySelector("path")
      .setAttribute("d", CornerPart.SVGPathPointsTemplate(borderRadius));
  }
}
