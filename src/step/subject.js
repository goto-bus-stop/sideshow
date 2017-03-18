import elementRect from "@f/element-rect";
import { parsePxValue } from "../general/utility_functions";
import Screen from "../general/screen";

/**
 * The current subject (the object being shown by the current wizard)
 *
 * @class Subject
 * @static
 */
const Subject = {};

/**
 * The current subject jQuery wrapped DOM element
 *
 * @@field obj
 * @static
 * @type Object
 */
Subject.obj = null;

/**
 * The current subject dimension information
 *
 * @@field position
 * @static
 * @type Object
 */
Subject.dimension = {};

/**
 * The current subject positioning information
 *
 * @@field position
 * @static
 * @type Object
 */
Subject.position = {};

/**
 * The current subject border radius information
 *
 * @@field borderRadius
 * @static
 * @type Object
 */
Subject.borderRadius = {};

/**
 * Checks if the object has changed since the last checking
 *
 * @method hasChanged
 * @return boolean
 */
Subject.hasChanged = function() {
  if (!this.obj) return false;

  const offset = elementRect(this.obj, document.documentElement);
  const style = getComputedStyle(this.obj)

  return offset.left - window.pageXOffset !== this.position.x ||
    offset.top - window.pageYOffset !== this.position.y ||
    this.obj.clientWidth !== this.dimension.width ||
    this.obj.clientHeight !== this.dimension.height ||
    parsePxValue(style.borderTopLeftRadius) !==
      this.borderRadius.leftTop ||
    parsePxValue(style.borderTopRightRadius) !==
      this.borderRadius.rightTop ||
    parsePxValue(style.borderBottomLeftRadius) !==
      this.borderRadius.leftBottom ||
    parsePxValue(style.borderBottomRightRadius) !==
      this.borderRadius.rightBottom ||
    Screen.hasChanged();
};

/**
 * Updates the information about the suject
 *
 * @method updateInfo
 * @param {Object} config Dimension, positioning and border radius information
 */
Subject.updateInfo = function(config) {
  if (!config) {
    const offset = elementRect(this.obj, document.documentElement);
    const style = getComputedStyle(this.obj)

    this.position.x = offset.left - window.pageXOffset;
    this.position.y = offset.top - window.pageYOffset;
    this.dimension.width = this.obj.clientWidth;
    this.dimension.height = this.obj.clientHeight;
    this.borderRadius.leftTop = parsePxValue(style.borderTopLeftRadius);
    this.borderRadius.rightTop = parsePxValue(
      style.borderTopRightRadius
    );
    this.borderRadius.leftBottom = parsePxValue(
      style.borderBottomLeftRadius
    );
    this.borderRadius.rightBottom = parsePxValue(
      style.borderBottomRightRadius
    );
  } else {
    this.position.x = config.position.x;
    this.position.y = config.position.y;
    this.dimension.width = config.dimension.width;
    this.dimension.height = config.dimension.height;
    this.borderRadius.leftTop = config.borderRadius.leftTop;
    this.borderRadius.rightTop = config.borderRadius.rightTop;
    this.borderRadius.leftBottom = config.borderRadius.leftBottom;
    this.borderRadius.rightBottom = config.borderRadius.rightBottom;
  }

  Screen.updateInfo();
};

Subject.isSubjectVisible = function(position, dimension) {
  if (position.y + dimension.height > window.innerHeight || position.y < 0) {
    return false;
  }
  return true;
};

export default Subject;
