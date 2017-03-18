import foreach from "@f/foreach-array";
import html from "bel";
import Arrows from "../step/arrows";
import Subject from "../step/subject";
import DetailsPanel from "../step/step_details_panel";
import FadableItem from "../interface_items/fadable_item";
import CompositeMask from "../mask/composite_mask";
import SubjectMask from "../mask/subject_mask";
import WizardMenu from "../wizard/wizard_menu";
import Wizard from "../wizard/wizard";
import SSException from "./exception";
import strings from "./dictionary";
import Polling from "./polling";
import { VISIBLE, FADING_IN } from "./AnimationStatus";
import { flags, currentWizard, setCurrentWizard, wizards } from "./state";
import config from "./config";
import {
  registerGlobalHotkeys,
  getString,
  registerInnerHotkeys,
  unregisterInnerHotkeys,
  removeDOMGarbage
} from "./utility_functions";

/**
 * The main class for Sideshow
 *
 * @class SS
 * @static
 */
const SS = {
  /**
   * The current Sideshow version
   *
   * @property VERSION
   * @type String
   */
  get VERSION() {
    return "0.4.3";
  },

  config
};

/**
 * Initializes Sideshow
 *
 * @method init
 * @static
 */
SS.init = function() {
  registerGlobalHotkeys(SS);
  Polling.start();
  CompositeMask.singleInstance.init();
  flags.lockMaskUpdate = true;
  CompositeMask.singleInstance.render();
};

/**
 * Stops and Closes Sideshow
 *
 * @method closes
 * @static
 */
SS.close = function() {
  if (!currentWizard) {
    WizardMenu.hide();
  }

  DetailsPanel.singleInstance.fadeOut();

  this.CloseButton.singleInstance.fadeOut();
  Arrows.fadeOut();

  setTimeout(
    () => {
      if (
        CompositeMask.singleInstance.status === VISIBLE ||
        CompositeMask.singleInstance.status === FADING_IN
      ) {
        CompositeMask.singleInstance.fadeOut();
      }

      SubjectMask.singleInstance.fadeOut();
    },
    600
  );

  removeDOMGarbage();
  Polling.clear();
  unregisterInnerHotkeys();
  setCurrentWizard(null);
  flags.running = false;
};

SS.gotoStep = function(firstArg) {
  const steps = currentWizard._storyline.steps;
  let destination;

  flags.skippingStep = true;

  // First argument is the step position (1-based)
  if (typeof firstArg === "number") {
    if (firstArg <= steps.length) {
      destination = steps[firstArg - 1];
    } else {
      throw new SSException(
        "401",
        "There's no step in the storyline with position " + firstArg + "."
      );
    }
  } else if (typeof firstArg === "string") {
    // First argument is the step name
    destination = steps.filter(i => i.name === firstArg)[0];

    if (!destination) {
      throw new SSException(
        "401",
        "There's no step in the storyline with name " + firstArg + "."
      );
    }
  }
  setTimeout(
    () => {
      currentWizard.next(null, destination);
    },
    100
  );
};

/**
 * A trick to use the composite mask to simulate the behavior of a solid mask, setting an empty subject
 *
 * @method setEmptySubject
 * @static
 */
SS.setEmptySubject = function() {
  flags.lockMaskUpdate = true;
  Subject.obj = null;
  Subject.updateInfo({
    dimension: {
      width: 0,
      height: 0
    },
    position: {
      x: 0,
      y: 0
    },
    borderRadius: {
      leftTop: 0,
      rightTop: 0,
      leftBottom: 0,
      rightBottom: 0
    }
  });
};

/**
 * Sets the current subject
 *
 * @method setSubject
 * @param {Object} subj
 * @static
 */
SS.setSubject = function(subj, subjectChanged) {
  if (typeof subj === "string") {
    subj = document.querySelectorAll(subj);
  }

  if (subj.length > 0) {
    if (subj.length === 1) {
      Subject.obj = subj[0];
      Subject.updateInfo();
      flags.lockMaskUpdate = false;
    } else {
      throw new SSException(
        "101",
        "A subject must have only one element. Multiple elements by step will be supported in future versions of Sideshow."
      );
    }
  } else if (subjectChanged) {
    SS.setEmptySubject();
  } else {
    throw new SSException("100", "Invalid subject.");
  }
};

/**
 * Registers a wizard
 *
 * @method registerWizard
 * @param {Object} wizardConfig
 * @return {Object} The wizard instance
 * @static
 **/
SS.registerWizard = function(wizardConfig) {
  const wiz = new Wizard(wizardConfig);
  wizards.push(wiz);
  return wiz;
};

/**
 * Registers a wizard
 *
 * @method registerWizard
 * @param {boolean} onlyNew Checks only recently added wizards
 * @return {Array} The eligible wizards list
 * @static
 */
SS.getElegibleWizards = function(onlyNew) {
  const eligibleWizards = [];
  let somethingNew = false;
  foreach(wiz => {
    if (wiz.isEligible()) {
      if (!wiz.isAlreadyWatched()) {
        somethingNew = true;
      }
      eligibleWizards.push(wiz);
    }
  }, wizards);

  return !onlyNew || somethingNew ? eligibleWizards : [];
};

/**
 * Checks if there are eligible wizards, if exists, shows the wizard menu
 *
 * @method showWizardsList
 * @param {boolean} onlyNew Checks only recently added wizards
 * @return {boolean} Returns a boolean indicating whether there is some wizard available
 * @static
 */
SS.showWizardsList = function(firstArg, title) {
  const onlyNew = typeof firstArg === "boolean" ? false : firstArg;
  const wizards = firstArg instanceof Array
    ? firstArg
    : this.getElegibleWizards(onlyNew);

  WizardMenu.show(wizards, title);

  return wizards.length > 0;
};

/**
 * Shows a list with the related wizards
 *
 * @method showRelatedWizardsList
 * @param {Object} completedWizard The recently completed wizard
 * @return {boolean} Returns a boolean indicating whether there is some related wizard available
 * @static
 */
SS.showRelatedWizardsList = function(completedWizard) {
  const relatedWizardsNames = completedWizard.relatedWizards;
  if (!relatedWizardsNames) {
    return false;
  }

  // Gets only related tutorials which are eligible or have a preparation function
  const relatedWizards = wizards.filter(
    w =>
      relatedWizardsNames.indexOf(w.name) > -1 &&
      (w.isEligible() || w.preparation)
  );
  if (relatedWizards.length == 0) {
    return false;
  }

  Polling.clear();
  SS.showWizardsList(relatedWizards, getString(strings.relatedWizards));

  return true;
};

/**
 * The close button for the wizard
 *
 * @class CloseButton
 * @@singleton
 * @extends FadableItem
 */
SS.CloseButton = class CloseButton extends FadableItem {
  /**
   * Renders the close button
   *
   * @method render
   */

  render() {
    this.$el = html`
      <button onclick=${() => SS.close()} class="sideshow-close-button">
        ${getString(strings.close)}
      </button>
    `;

    super.render();
  }
};
SS.CloseButton.singleInstance = new SS.CloseButton();

/**
 * Starts Sideshow
 *
 * @method start
 * @param {Object} config The config object for Sideshow
 */
SS.start = function(config = {}) {
  if (!flags.running) {
    const onlyNew = "onlyNew" in config && !!config.onlyNew;
    const listAll = "listAll" in config && !!config.listAll;
    const wizardName = config.wizardName;

    if (listAll) {
      SS.showWizardsList(wizards.filter(w => w.isEligible() || w.preparation));
    } else if (wizardName) {
      const wizard = wizards.filter(w => w.name === wizardName)[0];

      if (!wizard) {
        throw new SSException(
          "205",
          `There's no wizard with name '${wizardName}'.`
        );
      }

      wizard.prepareAndPlay();
    } else {
      SS.showWizardsList(onlyNew);
    }

    this.CloseButton.singleInstance.render();
    this.CloseButton.singleInstance.fadeIn();

    registerInnerHotkeys();
    flags.running = true;

    Polling.enqueue("check_composite_mask_screen_changes", () => {
      CompositeMask.singleInstance.pollForScreenChanges();
    });
  }
};

export default SS;
