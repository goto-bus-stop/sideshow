import html from "bel";
import FadableItem from "../interface_items/fadable_item";
import closeIcon from "../icons/close";
import strings from "../general/dictionary";
import { getString } from "../general/utility_functions";

/**
 * The close button for the wizard
 *
 * @class CloseButton
 * @extends FadableItem
 */
export default class CloseButton extends FadableItem {
  constructor({ onClose }) {
    super();

    this.onClose = onClose;
  }

  /**
   * Renders the close button
   *
   * @method render
   */

  render() {
    this.$el = html`
      <button onclick=${() => this.onClose()} class="sideshow-close-button">
        ${closeIcon()}
        ${getString(strings.close)}
      </button>
    `;

    super.render();

    return this.$el;
  }
}
