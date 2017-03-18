import applyStyles from "@f/apply-styles";
import elementRect from "@f/element-rect";
import html from "bel";
import { parsePxValue } from "../general/utility_functions";
import FadableItem from "../interface_items/fadable_item";

/**
 * A single arrow for pointing individual items in current subject 
 * 
 * @class Arrow
 */
export default class Arrow extends FadableItem {
  /**
   * The jQuery wrapped object which will be pointed by this arrow
   * 
   * @@field target
   * @type Object
   */

  target = {};

  /**
   * The position of the arrow. Valid values are "top", "right", "bottom" or "left". Defaults to "top"
   * 
   * @@field position
   * @type String
   */

  position = "";

  /**
   * Flag created to set if the arrow was visible once, this is used for recreating references to the targets DOM objects
   * 
   * @@field onceVisible
   * @type Object
   */

  onceVisible = false;

  /**
   * Renders the Arrow
   * 
   * @method render
   */

  render() {
    this.$el = html`
      <div class="sideshow-subject-arrow ${this.position} sideshow-hidden sideshow-invisible"/>
    `;

    super.render();
  }

  /**
   * Positionates the Arrow according to its target
   * 
   * @method positionate
   */

  positionate() {
    const target = this.target;
    const position = this.position;

    const offset = elementRect(target.$el, document.documentElement);

    target.position = {
      x: offset.left - window.pageXOffset,
      y: offset.top - window.pageYOffset
    };
    target.dimension = {
      width: parsePxValue(target.$el.clientWidth),
      height: parsePxValue(target.$el.clientHeight)
    };

    const coordinates = {
      // a dictionary with each of the coordinates used for positioning Arrow
      top: {
        x: `${target.position.x + target.dimension.width / 2 - 20}px`,
        y: `${target.position.y - 30}px`
      },
      right: {
        x: `${target.position.x + target.dimension.width - 12}px`,
        y: `${target.position.y + target.dimension.height / 2 - 6}px`
      },
      bottom: {
        x: `${target.position.x + target.dimension.width / 2 - 35}px`,
        y: `${target.position.y + target.dimension.height + 2}px`
      },
      left: {
        x: `${target.position.x - 35}px`,
        y: `${target.position.y + target.dimension.height / 2 - 22}px`
      }
    };

    applyStyles(this.$el, {
      left: coordinates[position].x,
      top: coordinates[position].y
    });
  }

  /**
   * Shows the Arrow 
   * 
   * @method show
   */

  show() {
    super.show();
    this.positionate();
  }

  /**
   * Does a fade in transition in the Arrow 
   * 
   * @method fadeIn
   */

  fadeIn() {
    super.fadeIn();
    this.positionate();
  }

  /**
   * Checks if the arrow's target position or dimension has changed
   * 
   * @method hasChanged
   * @return boolean                                     
   */

  hasChanged() {
    const offset = elementRect(this.target.$el, document.documentElement);

    return this.target.dimension.width !== this.target.$el.clientWidth ||
      this.target.dimension.height !== this.target.$el.clientHeight ||
      this.target.position.y !== offset.top - window.pageYOffset ||
      this.target.position.x !== offset.left - window.pageXOffset;
  }
}
