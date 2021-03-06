import elementRect from '@f/element-rect'
import { parsePxValue } from '../general/utility_functions'
import Screen from '../general/screen'

/**
 * The current subject (the object being shown by the current wizard)
 *
 * @class Subject
 * @static
 */
class Subject {
  /**
   * The current subject jQuery wrapped DOM element
   *
   * @field obj
   * @type Object
   */

  obj = null;

  /**
   * The current subject dimension information
   *
   * @field position
   * @type Object
   */

  dimension = {};

  /**
   * The current subject positioning information
   *
   * @field position
   * @type Object
   */

  position = {};

  /**
   * The current subject border radius information
   *
   * @field borderRadius
   * @type Object
   */

  borderRadius = {};

  /**
   * Checks if the object has changed since the last checking
   *
   * @method hasChanged
   * @return boolean
   */

  hasChanged () {
    if (!this.obj) return false

    const offset = elementRect(this.obj, document.documentElement)
    const style = window.getComputedStyle(this.obj)

    return offset.left - window.pageXOffset !== this.position.x ||
      offset.top - window.pageYOffset !== this.position.y ||
      this.obj.offsetWidth !== this.dimension.width ||
      this.obj.offsetHeight !== this.dimension.height ||
      parsePxValue(style.borderTopLeftRadius) !== this.borderRadius.leftTop ||
      parsePxValue(style.borderTopRightRadius) !== this.borderRadius.rightTop ||
      parsePxValue(style.borderBottomLeftRadius) !==
        this.borderRadius.leftBottom ||
      parsePxValue(style.borderBottomRightRadius) !==
        this.borderRadius.rightBottom ||
      Screen.hasChanged()
  }

  /**
   * Updates the information about the suject
   *
   * @method updateInfo
   * @param {Object} config Dimension, positioning and border radius information
   */

  updateInfo (config) {
    if (!config) {
      const rect = elementRect(this.obj, document.documentElement)
      const style = window.getComputedStyle(this.obj)

      this.position.x = rect.left - window.pageXOffset
      this.position.y = rect.top - window.pageYOffset
      this.dimension.width = rect.width
      this.dimension.height = rect.height
      this.borderRadius.leftTop = parsePxValue(style.borderTopLeftRadius)
      this.borderRadius.rightTop = parsePxValue(style.borderTopRightRadius)
      this.borderRadius.leftBottom = parsePxValue(style.borderBottomLeftRadius)
      this.borderRadius.rightBottom = parsePxValue(style.borderBottomRightRadius)
    } else {
      this.position.x = config.position.x
      this.position.y = config.position.y
      this.dimension.width = config.dimension.width
      this.dimension.height = config.dimension.height
      this.borderRadius.leftTop = config.borderRadius.leftTop
      this.borderRadius.rightTop = config.borderRadius.rightTop
      this.borderRadius.leftBottom = config.borderRadius.leftBottom
      this.borderRadius.rightBottom = config.borderRadius.rightBottom
    }

    Screen.updateInfo()
  }

  isSubjectVisible (position, dimension) {
    if (position.y + dimension.height > window.innerHeight || position.y < 0) {
      return false
    }
    return true
  }
}

export default new Subject()
