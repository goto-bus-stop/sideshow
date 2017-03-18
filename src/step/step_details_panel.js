import applyStyles from "@f/apply-styles";
import html from "bel";
import FadableItem from "../interface_items/fadable_item";
import CompositeMask from "../mask/composite_mask";
import { parsePxValue } from "../general/utility_functions";
import Screen from "../general/screen";

/**
 * The panel that holds step description, is positionated over the biggest remaining space among the four parts of a composite mask
 * 
 * @class DetailsPanel
 * @singleton
 * @extends FadableItem
 */

export default class DetailsPanel extends FadableItem {
  /**
   * An object holding dimension information for the Details Panel
   * 
   * @field dimension
   * @type Object
   */

  dimension = {};

  /**
   * An object holding positioning information for the Details Panel
   * 
   * @field position
   * @type Object
   */

  position = {};

  /**
   * Renders the Details Panel
   * 
   * @method render
   */

  render() {
    this.$el = html`
      <div class="sideshow-details-panel sideshow-hidden" />
    `;
    super.render();
  }

  /**
   * Positionates the panel automatically, calculating the biggest available area and putting the panel over there
   * 
   * @method positionate
   */

  positionate() {
    const parts = CompositeMask.singleInstance.parts;

    //Considering the four parts surrounding the current subject, gets the biggest one
    const sortedSides = [
      [parts.top, "height"],
      [parts.right, "width"],
      [parts.bottom, "height"],
      [parts.left, "width"]
    ].sort((a, b) => a[0].dimension[a[1]] - b[0].dimension[b[1]]);

    var biggestSide = sortedSides.slice(-1)[0];

    for (let i = 2; i > 0; i--) {
      const side = sortedSides[i];
      const dimension = side[0].dimension;
      if (dimension.width > 250 && dimension.height > 250) {
        if (
          dimension.width + dimension.height >
          (biggestSide[0].dimension.width + biggestSide[0].dimension.height) * 2
        ) {
          biggestSide = side;
        }
      }
    }

    if (biggestSide[1] == "width") {
      applyStyles(this.$el, {
        left: biggestSide[0].position.x,
        top: 0,
        height: Screen.dimension.height,
        width: biggestSide[0].dimension.width
      });
    } else {
      applyStyles(this.$el, {
        left: 0,
        top: biggestSide[0].position.y,
        height: biggestSide[0].dimension.height,
        width: Screen.dimension.width
      });
    }

    this.dimension = {
      width: parsePxValue(this.$el.style.width),
      height: parsePxValue(this.$el.style.height)
    };

    this.position = {
      x: parsePxValue(this.$el.style.left),
      y: parsePxValue(this.$el.style.top)
    };
  }
}

DetailsPanel.singleInstance = new DetailsPanel();
