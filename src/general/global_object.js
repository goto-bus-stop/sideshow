import Arrows from "../step/arrows";
import Subject from "../step/subject";
import DetailsPanel from "../step/step_details_panel";
import FadableItem from "../interface_items/fadable_item";
import CompositeMask from "../mask/composite_mask";
import SubjectMask from "../mask/subject_mask";
import WizardMenu from "../wizard/wizard_menu";
import Wizard from "../wizard/wizard";
import ControlVariables from "../wizard/wizard_control_variables";
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
var SS = {
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

SS.ControlVariables = ControlVariables;

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
 * Receives a function with just a multiline comment as body and converts to a here-document string
 *  
 * @method heredoc
 * @param {Function} fn A function without body but a multiline comment
 * @return {String} A multiline string
 * @static
 */
SS.heredoc = function(fn) {
  return fn.toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];
};

/**
 * Stops and Closes Sideshow
 * 
 * @method closes
 * @static
 */
SS.close = function() {
  if (!currentWizard) WizardMenu.hide();

  DetailsPanel.singleInstance.fadeOut();

  this.CloseButton.singleInstance.fadeOut();
  Arrows.fadeOut();

  setTimeout(
    function() {
      if (
        CompositeMask.singleInstance.status === VISIBLE ||
        CompositeMask.singleInstance.status === FADING_IN
      )
        CompositeMask.singleInstance.fadeOut();

      SubjectMask.singleInstance.fadeOut();
    },
    600
  );

  removeDOMGarbage();
  Polling.clear();
  ControlVariables.clear();
  unregisterInnerHotkeys();
  setCurrentWizard(null);
  flags.running = false;
};

/**
 * @deprecated
 * @method runWizard
 * @static
 */
SS.runWizard = function(name) {
  showDeprecationWarning(
    "This method is deprecated and will be removed until the next major version of Sideshow."
  );

  var wiz = wizards.filter(function(w) {
    return w.name === name;
  })[0];
  setCurrentWizard(wiz);
  if (wiz) {
    if (wiz.isEligible())
      wiz.play();
    else if (wiz.preparation)
      wiz.preparation(function() {
        setTimeout(
          function() {
            wiz.play();
          },
          1000
        );
      });
    else
      throw new SSException("204", "This wizard hasn't preparation.");
  } else
    throw new SSException("205", "There's no wizard with name " + name + ".");
};

SS.gotoStep = function() {
  var firstArg = arguments[0],
    steps = currentWizard._storyline.steps,
    destination;

  flags.skippingStep = true;

  //First argument is the step position (1-based)
  if (typeof firstArg == "number") {
    if (firstArg <= steps.length) destination = steps[firstArg - 1];
    else throw new SSException(
        "401",
        "There's no step in the storyline with position " + firstArg + "."
      );
  } else if (typeof firstArg == "string") {
    //First argument is the step name
    destination = steps.filter(function(i) {
      return i.name === firstArg;
    })[0];

    if (!destination)
      throw new SSException(
        "401",
        "There's no step in the storyline with name " + firstArg + "."
      );
  }
  setTimeout(
    function() {
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
  if (subj.constructor === String) subj = $(subj);

  if (subj instanceof $ && subj.length > 0) {
    if (subj.length === 1) {
      Subject.obj = subj;
      Subject.updateInfo();
      flags.lockMaskUpdate = false;
    } else
      throw new SSException(
        "101",
        "A subject must have only one element. Multiple elements by step will be supported in future versions of Sideshow."
      );
  } else if (subjectChanged) SS.setEmptySubject();
  else throw new SSException("100", "Invalid subject.");
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
  var wiz = new Wizard(wizardConfig);
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
  var eligibleWizards = [];
  var somethingNew = false;
  for (var w = 0; w < wizards.length; w++) {
    var wiz = wizards[w];
    if (wiz.isEligible()) {
      if (!wiz.isAlreadyWatched()) somethingNew = true;
      eligibleWizards.push(wiz);
    }
  }

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
SS.showWizardsList = function() {
  var firstArg = arguments[0];
  var title = arguments[1];
  var onlyNew = typeof firstArg == "boolean" ? false : firstArg;
  var wizards = firstArg instanceof Array
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
  var relatedWizardsNames = completedWizard.relatedWizards;
  if (!relatedWizardsNames) return false;

  //Gets only related tutorials which are eligible or have a preparation function
  var relatedWizards = wizards.filter(function(w) {
    return relatedWizardsNames.indexOf(w.name) > -1 &&
      (w.isEligible() || w.preparation);
  });
  if (relatedWizards.length == 0) return false;

  Polling.clear();
  ControlVariables.clear();
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
    this.$el = $("<button>")
      .addClass("sideshow-close-button")
      .text(getString(strings.close));
    this.$el.click(function() {
      SS.close();
    });
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
SS.start = function(config) {
  config = config || {};

  if (!flags.running) {
    var onlyNew = "onlyNew" in config && !!config.onlyNew;
    var listAll = "listAll" in config && !!config.listAll;
    var wizardName = config.wizardName;

    if (listAll)
      SS.showWizardsList(
        wizards.filter(function(w) {
          return w.isEligible() || w.preparation;
        })
      );
    else if (wizardName) {
      var wizard = wizards.filter(function(w) {
        return w.name === wizardName;
      })[0];

      if (!wizard)
        throw new SSException(
          "205",
          "There's no wizard with name '" + wizardName + "'."
        );

      wizard.prepareAndPlay();
    } else
      SS.showWizardsList(onlyNew);

    this.CloseButton.singleInstance.render();
    this.CloseButton.singleInstance.fadeIn();

    registerInnerHotkeys();
    flags.running = true;

    Polling.enqueue("check_composite_mask_screen_changes", function() {
      CompositeMask.singleInstance.pollForScreenChanges();
    });
  }
};

export default SS;
