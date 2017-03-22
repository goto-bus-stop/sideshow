import html from 'bel'
import applyStyles from '@f/apply-styles'
import FadableItem from '../interface_items/fadable_item'

/**
 * Controls the mask that covers the subject during a step transition
 */

export default class SubjectMask extends FadableItem {
  /**
   * Renders the subject mask
   *
   * @method render
   */

  render () {
    this.$el = html`
      <div class="sideshow-subject-mask" />
    `
    super.render()

    return this.$el
  }

  /**
   * Updates the dimension, positioning and border radius of the subject mask
   *
   * @method update
   * @param {Object} position The positioning information
   * @param {Object} dimension The dimension information
   * @param {Object} borderRadius The border radius information
   */

  update (position, dimension, borderRadius) {
    applyStyles(this.$el, {
      left: position.x,
      top: position.y,
      width: dimension.width,
      height: dimension.height,
      borderRadius: `${borderRadius.leftTop}px ${borderRadius.rightTop}px ` +
        `${borderRadius.leftBottom}px ${borderRadius.rightBottom}px`
    })
  }
}

SubjectMask.singleInstance = new SubjectMask()
