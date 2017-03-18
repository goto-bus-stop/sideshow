import addClass from "@f/add-class";
import html from "bel";
import CompositeMask from "../mask/composite_mask";
import Subject from "../step/subject";
import strings from "../general/dictionary";
import SS from "../general/global_object";
import { getString } from "../general/utility_functions";
import { wizards } from "../general/state";

/**
 * The main menu, where the available wizards are listed
 *
 * @class WizardMenu
 * @static
 */
const WizardMenu = {};

/**
 * Renders the wizard menu
 *
 * @method render
 * @param {Array} wizards The wizards list
 * @static
 */
WizardMenu.render = function(wizards) {
  let list;
  if (wizards.length > 0) {
    function wizardItem(wiz) {
      let description = wiz.description;
      description.length > 100 &&
        (description = description.substr(0, 100) + "...");

      return html`
        <li onclick=${onclick}>
          <span class="sideshow-wizard-menu-item-estimated-time">
            ${wiz.estimatedTime}
          </span>
          <h2>${wiz.title}</h2>
          <span class="sideshow-wizard-menu-item-description">
            ${description}
          </span>
        </li>
      `;

      function onclick() {
        WizardMenu.hide(function() {
          wiz.prepareAndPlay();
        });
      }
    }

    list = html`
      <ul>
        ${wizards.map(wizardItem)}
      </ul>
    `;
  } else {
    list = html`
      <div class="sideshow-no-wizards-available">
        ${getString(strings.noAvailableWizards)}
      </div>
    `;
  }

  this.titleElement = html`
    <h1 class="sideshow-wizard-menu-title" />
  `

  this.$el = html`
    <div class="sideshow-wizard-menu">
      ${this.titleElement}
      ${list}
    </div>
  `;

  document.body.appendChild(this.$el);
};

/**
 * Shows the wizard menu
 *
 * @method show
 * @param {Array} wizards The wizards list
 * @static
 */
WizardMenu.show = function(wizards, title) {
  if (wizards.length == 1 && SS.config.autoSkipIntro) {
    wizards[0].prepareAndPlay();
  } else {
    SS.setEmptySubject();
    CompositeMask.singleInstance.update(
      Subject.position,
      Subject.dimension,
      Subject.borderRadius
    );
    CompositeMask.singleInstance.fadeIn();

    WizardMenu.render(wizards);

    if (title) {
      this.setTitle(title);
    } else {
      this.setTitle(getString(strings.availableWizards));
    }
  }
};

/**
 * Hides the wizard menu
 *
 * @method hide
 * @param {Function} callback The callback to be called after hiding the menu
 * @static
 */
WizardMenu.hide = function(callback) {
  const $el = this.$el;

  if ($el) {
    addClass("sideshow-menu-closed", $el);
  }
  setTimeout(
    () => {
      if ($el) {
        $el.setAttribute("hidden", "hidden");
      }
      if (callback) {
        callback();
      }
    },
    600
  );
};

WizardMenu.setTitle = function(title) {
  this.titleElement.textContent = title;
};

export default WizardMenu;
