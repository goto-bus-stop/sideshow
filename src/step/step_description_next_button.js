import HidableItem from "../interface_itens/hidable_item";

/**
 * Step next button 
 * 
 * @class StepDescriptionNextButton
 * @extends HidableItem
 */
export default class StepDescriptionNextButton extends HidableItem {
  /**
   * The text for the next button
   * 
   * @@field _text
   * @private
   */

  _text = null;

  /**
   * Disables the next button
   * 
   * @method disable
   */

  disable() {
    this.$el.attr("disabled", "disabled");
  }

  /**
   * Enables the next button
   * 
   * @method enable
   */

  enable() {
    this.$el.attr("disabled", null);
  }

  /**
   * Sets the text for the next button
   * 
   * @method setText
   * @param {String} text The text for the next button
   */

  setText(text) {
    this._text = text;
    this.$el.text(text);
  }

  /**
   * Renders the Next Button
   * 
   * @method render
   * @param {Object} $stepDescriptionEl The jQuery wrapped DOM element for the Step Description panel
   */

  render($stepDescriptionEl) {
    this.$el = $("<button>").addClass("sideshow-next-step-button");
    super.render($stepDescriptionEl);
  }
}
