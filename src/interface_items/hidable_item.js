import addClass from '@f/add-class'
import removeClass from '@f/remove-class'
import { VISIBLE, NOT_DISPLAYED } from '../general/AnimationStatus'
import VisualItem from './visual_item'

/**
 * A visual item which can be shown and hidden
 *
 * @class HidableItem
 * @@abstract
 * @extends VisualItem
 */
export default class HidableItem extends VisualItem {
  /**
   * Shows the visual item
   *
   * @method show
   * @param {boolean} displayButKeepTransparent The item will hold space but keep invisible
   */

  show (displayButKeepTransparent) {
    if (!this.$el) {
      this.render()
    }
    if (!displayButKeepTransparent) {
      removeClass('sideshow-invisible', this.$el)
    }
    removeClass('sideshow-hidden', this.$el)
    this.status = VISIBLE
  }

  /**
   * Hides the visual item
   *
   * @method hide
   */

  hide (keepHoldingSpace) {
    if (!keepHoldingSpace) {
      addClass('sideshow-hidden', this.$el)
    }
    addClass('sideshow-invisible', this.$el)
    this.status = NOT_DISPLAYED
  }
}
