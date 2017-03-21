import applyStyles from "@f/apply-styles";
import html from "bel";
import stripIndent from "strip-indent";
import FadableItem from "../interface_items/fadable_item";
import { hasParser, parse } from "../general/parsers";
import { parsePxValue } from "../general/utility_functions";
import { currentWizard } from "../general/state";
import StepDescriptionNextButton from "./step_description_next_button";
import DetailsPanel from "./step_details_panel";

/**
 * Represents a panel holding the step description
 *
 * @class StepDescription
 * @extends FadableItem
 * @initializer
 */
export default class StepDescription extends FadableItem {
  /**
   * The step description text content
   *
   * @field text
   * @type String
   */

  text = "";

  /**
   * The title text for the step description panel
   *
   * @field title
   * @type String
   */

  title = "";

  /**
   * An object holding dimension information for the Step Description panel
   *
   * @field dimension
   * @type Object
   */

  dimension = {};

  /**
   * An object holding positioning information for the Step Description panel
   *
   * @field position
   * @type Object
   */

  position = {};

  /**
   * An object representing the next button for a step description panel
   *
   * @field nextButton
   * @type Object
   */

  nextButton = new StepDescriptionNextButton();

  /**
   * Sets the text for the step description panel
   *
   * @method setText
   * @param {String} text The text for the step description panel
   */

  setText(text) {
    this.text = text;
    this.textElement.textContent = text;
  }

  /**
   * Sets the HTML content for the step description panel
   *
   * @method setHTML
   * @param {String} text The HTML content for step description panel
   */

  setHTML(text) {
    this.text = text;
    this.textElement.innerHTML = text;
  }

  /**
   * Sets the title for the step description panel
   *
   * @method setTitle
   * @param {String} title The text for the step description panel
   */

  setTitle(title) {
    this.title = title;
    this.titleElement.textContent = title;
  }

  /**
   * Sets the title for the step description panel
   *
   * @method setStepPosition
   * @param {String} title The text for the step description panel
   */

  setStepPosition(stepPosition) {
    this.stepPosition = stepPosition;
    this.stepPositionElement.textContent = stepPosition;
  }

  /**
   * Renders the step description panel
   *
   * @method render
   */

  render() {
    this.stepPositionElement = html`
      <span
        class="sideshow-step-position"
        hidden=${currentWizard.showStepPosition === false}
      />
    `;

    this.textElement = html`
      <div class="sideshow-step-text" />
    `;
    this.titleElement = html`
      <h2 />
    `;

    const nextButton = this.nextButton.render();
    nextButton.addEventListener("click", () => {
      currentWizard.next();
    });

    this.$el = html`
      <div class="sideshow-step-description sideshow-hidden sideshow-invisible">
        ${this.stepPositionElement}
        ${this.titleElement}
        ${this.textElement}
        ${nextButton}
      </div>
    `;

    return this.$el;
  }

  /**
   * Shows the step description panel
   *
   * @method show
   */

  show(displayButKeepTransparent) {
    super.show(displayButKeepTransparent);
  }

  /**
   * Positionates the step description panel
   *
   * @method positionate
   */

  positionate() {
    const dp = DetailsPanel.singleInstance;

    if (dp.dimension.width >= 900) {
      this.dimension.width = 900;
    } else {
      this.dimension.width = dp.dimension.width * 0.9;
    }

    applyStyles(this.$el, { width: this.dimension.width });

    const paddingLeftRight = (parsePxValue(this.$el.style.paddingLeft) +
      parsePxValue(this.$el.style.paddingRight)) /
      2;
    const paddingTopBottom = (parsePxValue(this.$el.style.paddingTop) +
      parsePxValue(this.$el.style.paddingBottom)) /
      2;

    this.dimension.height = parsePxValue(this.$el.offsetHeight);

    // Checks if the description dimension overflow the available space in the details panel
    if (
      this.dimension.height > dp.dimension.height || this.dimension.width < 400
    ) {
      this.dimension.width = window.innerWidth * 0.9;
      applyStyles(this.$el, { width: this.dimension.width });
      this.dimension.height = parsePxValue(this.$el.offsetHeight);

      this.position.x = (window.innerWidth - this.dimension.width) / 2;
      this.position.y = (window.innerHeight - this.dimension.height) / 2;
    } else {
      this.position.x = (dp.dimension.width - this.dimension.width) / 2;
      this.position.y = (dp.dimension.height - this.dimension.height) / 2;
    }

    applyStyles(this.$el, {
      left: this.position.x - paddingLeftRight,
      top: this.position.y - paddingTopBottom
    });
  }

  update(step) {
    const text = stripIndent(step.text);
    if (hasParser(step.format)) {
      this.setHTML(parse(step.format, text));
    } else {
      this.setText(text);
    }

    this.setTitle(step.title);
  }
}

StepDescription.singleInstance = new StepDescription();
