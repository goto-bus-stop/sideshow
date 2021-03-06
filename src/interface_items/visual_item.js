import remove from '@f/remove-element'
import { NOT_DISPLAYED, NOT_RENDERED } from '../general/AnimationStatus'

/**
 * A visual item
 *
 * @class VisualItem
 * @@abstract
 */
export default class VisualItem {
  /**
   * The jQuery wrapped DOM element for the visual item
   *
   * @@field $el
   * @type Object
   */

  $el = null;

  /**
   * The jQuery wrapped DOM element for the visual item
   *
   * @@field $el
   * @type AnimationStatus
   */

  status = NOT_RENDERED;

  /**
   * Renders the item's DOM object
   *
   * @method render
   */

  render () {
    this.status = NOT_DISPLAYED
  }

  /**
   * Destroys the item's DOM object
   *
   * @method destroy
   */

  destroy () {
    remove(this.$el)
  }
}
