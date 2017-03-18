import FadableItem from "../interface_itens/fadable_item";
import CompositeMask from "../mask/composite_mask";
import { parsePxValue } from "../general/utility_functions";
import Screen from "../general/screen";

/**
 * The panel that holds step description, is positionated over the biggest remaining space among the four parts of a composite mask
 * 
 * @class DetailsPanel
 * @@singleton
 * @extends FadableItem
 */

export default class DetailsPanel extends FadableItem {
  /**
   * An object holding dimension information for the Details Panel
   * 
   * @@field dimension
   * @type Object
   */

  dimension = {};

  /**
   * An object holding positioning information for the Details Panel
   * 
   * @@field position
   * @type Object
   */

  position = {};

  /**
   * Renders the Details Panel
   * 
   * @method render
   */

  render() {
    this.$el = $("<div>")
      .addClass("sideshow-details-panel")
      .addClass("sideshow-hidden");
    super.render();
  }

  /**
   * Positionates the panel automatically, calculating the biggest available area and putting the panel over there
   * 
   * @method positionate
   */

  positionate() {
    var parts = CompositeMask.singleInstance.parts;

    //Considering the four parts surrounding the current subject, gets the biggest one
    var sortedSides = [
      [parts.top, "height"],
      [parts.right, "width"],
      [parts.bottom, "height"],
      [parts.left, "width"]
    ].sort(function(a, b) {
      return a[0].dimension[a[1]] - b[0].dimension[b[1]];
    });

    var biggestSide = sortedSides.slice(-1)[0];

    for (var i = 2; i > 0; i--) {
      var side = sortedSides[i];
      var dimension = side[0].dimension;
      if (dimension.width > 250 && dimension.height > 250) {
        if (
          dimension.width + dimension.height >
          (biggestSide[0].dimension.width + biggestSide[0].dimension.height) * 2
        )
          biggestSide = side;
      }
    }

    if (biggestSide[1] == "width") {
      this.$el
        .css("left", biggestSide[0].position.x)
        .css("top", 0)
        .css("height", Screen.dimension.height)
        .css("width", biggestSide[0].dimension.width);
    } else {
      this.$el
        .css("left", 0)
        .css("top", biggestSide[0].position.y)
        .css("height", biggestSide[0].dimension.height)
        .css("width", Screen.dimension.width);
    }

    this.dimension = {
      width: parsePxValue(this.$el.css("width")),
      height: parsePxValue(this.$el.css("height"))
    };

    this.position = {
      x: parsePxValue(this.$el.css("left")),
      y: parsePxValue(this.$el.css("top"))
    };
  }
}

DetailsPanel.singleInstance = new DetailsPanel();
