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
  const $menu = $("<div>").addClass("sideshow-wizard-menu");
  this.$el = $menu;
  const $title = $("<h1>").addClass("sideshow-wizard-menu-title");
  $menu.append($title);

  if (wizards.length > 0) {
    const $wizardsList = $("<ul>");

    //Extracting this function to avoid the JSHint warning W083
    function setClick($wiz, wizard) {
      $wiz.click(function() {
        WizardMenu.hide(function() {
          wizard.prepareAndPlay();
        });
      });
    }

    wizards.forEach(wiz => {
      const $wiz = $("<li>");
      const $wizTitle = $("<h2>").text(wiz.title);

      if (wiz.title || wiz.description) {
        let description = wiz.description;
        description.length > 100 &&
          (description = description.substr(0, 100) + "...");

        const $wizDescription = $("<span>")
          .addClass("sideshow-wizard-menu-item-description")
          .text(description);
        const $wizEstimatedTime = $("<span>")
          .addClass("sideshow-wizard-menu-item-estimated-time")
          .text(wiz.estimatedTime);
        $wiz.append($wizEstimatedTime, $wizTitle, $wizDescription);
        $wizardsList.append($wiz);
      }
      setClick($wiz, wiz);
    });
    $menu.append($wizardsList);
  } else {
    $("<div>")
      .addClass("sideshow-no-wizards-available")
      .text(getString(strings.noAvailableWizards))
      .appendTo($menu);
  }

  $body.append($menu);
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
    $el.addClass("sideshow-menu-closed");
  }
  setTimeout(
    () => {
      if ($el) {
        $el.hide();
      }
      if (callback) {
        callback();
      }
    },
    600
  );
};

WizardMenu.setTitle = function(title) {
  this.$el.find(".sideshow-wizard-menu-title").text(title);
};

export default WizardMenu;
