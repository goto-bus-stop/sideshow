/**
 * Represents the current available area in the browser
 *
 * @class Screen
 * @static
 */
class Screen {
  /**
   * Object holding dimension information for the screen
   *
   * @field
   * @type Object
   */

  dimension = {};

  /**
   * Checks if the screen dimension information has changed
   *
   * @method hasChanged
   * @return boolean
   */

  hasChanged() {
    return window.innerWidth !== this.dimension.width ||
      window.innerHeight !== this.dimension.height;
  }

  /**
   * Updates the dimension information for the screen
   *
   * @method updateInfo
   */

  updateInfo() {
    this.dimension.width = window.innerWidth;
    this.dimension.height = window.innerHeight;
  }
}

export default new Screen();
