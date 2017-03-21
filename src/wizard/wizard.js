import stripIndent from "strip-indent";
import SSException from "../general/exception";
import Arrows from "../step/arrows";
import CompositeMask from "../mask/composite_mask";
import SubjectMask from "../mask/subject_mask";
import DetailsPanel from "../step/step_details_panel";
import StepDescription from "../step/step_description";
import Subject from "../step/subject";
import Polling from "../general/polling";
import strings from "../general/dictionary";
import { getString } from "../general/utility_functions";
import Sideshow from "../general/global_object";
import { flags, currentWizard, setCurrentWizard } from "../general/state";
import { hasParser, parse } from "../general/parsers";

/**
 * Represents a tutorial
 *
 * @class Wizard
 * @@initializer
 * @param {Object} wizardConfig The wizard configuration object
 */
export default class Wizard {
  /**
   * A function to prepare the environment for running a wizard (e.g. redirecting to some screen)
   *
   * @@field preparation
   * @type Function
   */

  preparation;

  /**
   * An object with listeners to this wizard (e.g. beforeWizardStarts, afterWizardEnds)
   *
   * @@field listeners
   * @type Object
   */

  listeners;

  /**
   * A configuration flag that defines if the step position (e.g. 2/10, 3/15, 12/12) will be shown
   *
   * @@field showStepPosition
   * @type boolean
   */

  showStepPosition;

  /**
   * An array with related wizards names. These wizards are listed after the ending of the current wizard.
   *
   * @@field relatedWizards
   * @type Array
   */

  relatedWizards;

  /**
   * The wizard unique name (used internally as an identifier)
   *
   * @@field name
   * @type String
   */

  name;

  /**
   * The wizard title (will be shown in the list of available wizards)
   *
   * @@field title
   * @type String
   */

  title;

  /**
   * The wizard description (will be shown in the list of available wizards)
   *
   * @@field description
   * @type String
   */

  description;

  /**
   * The wizard estimated completion time (will be shown in the list of available wizards)
   *
   * @@field estimatedTime
   * @type String
   */

  estimatedTime;

  /**
   * A collection of rules to infer whether a wizard should be available in a specific screen
   *
   * @@field affects
   * @type Array
   */

  affects;

  /**
   * The sequence of steps for this wizard
   *
   * @@field storyline
   * @private
   * @type Object
   */

  _storyline;

  /**
   * Points to the current step object in a playing wizard
   *
   * @@field currentStep
   * @type Object
   */

  currentStep;

  constructor(wizardConfig) {
    this.name = wizardConfig.name;
    this.title = wizardConfig.title;
    this.description = wizardConfig.description;
    this.estimatedTime = wizardConfig.estimatedTime;
    this.affects = wizardConfig.affects;
    this.preparation = wizardConfig.preparation;
    this.listeners = wizardConfig.listeners;
    this.showStepPosition = wizardConfig.showStepPosition;
    this.relatedWizards = wizardConfig.relatedWizards;
  }

  /**
   * Sets the storyline for the wizard
   *
   * @method storyLine
   */

  storyLine(storyline) {
    this._storyline = storyline;
  }

  /**
   * Runs the wizard
   *
   * @method play
   */

  play() {
    var wiz = this;

    Polling.enqueue("check_composite_mask_subject_changes", function() {
      CompositeMask.singleInstance.pollForSubjectChanges();
    });

    Polling.enqueue("check_arrow_changes", function() {
      Arrows.pollForArrowsChanges(true);
    });

    //Checks if the wizard has a storyline
    if (!this._storyline)
      throw new SSException("201", "A wizard needs to have a storyline.");
    var steps = this._storyline.steps;

    //Checks if the storyline has at least one step
    if (steps.length === 0)
      throw new SSException("202", "A storyline must have at least one step.");

    document.body.appendChild(DetailsPanel.singleInstance.render());

    var listeners = this.listeners;
    if (listeners && listeners.beforeWizardStarts)
      listeners.beforeWizardStarts();

    flags.changingStep = true;
    this.showStep(steps[0], function() {
      //Releases the polling for checking any changes in the current subject
      //flags.lockMaskUpdate = false;

      //Register the function that checks the completing of a step in the polling queue
      Polling.enqueue("check_completed_step", function() {
        wiz.pollForCheckCompletedStep();
      });
    });

    CompositeMask.singleInstance.fadeIn();
  }

  /**
   * Shows a specific step
   *
   * @method showStep
   * @param {Object} step The step to be shown
   * @param {Function} callback A callback function to be called
   */

  showStep(step, callback = () => {}) {
    flags.skippingStep = false;

    Arrows.clear();

    if (
      this.currentStep &&
      this.currentStep.listeners &&
      this.currentStep.listeners.afterStep
    ) {
      this.currentStep.listeners.afterStep();
    }

    if (step && step.listeners && step.listeners.beforeStep) {
      step.listeners.beforeStep();
    }

    //The shown step is, of course, the current
    this.currentStep = step;

    // If the step has a skipIf evaluator and it evaluates to true, we'll skip to the next step!
    if (step.skipIf && step.skipIf()) {
      flags.skippingStep = true;
      this.next();
    }

    if (flags.changingStep && !flags.skippingStep) {
      //Sets the current subject and updates its dimension and position
      if (step.subject) {
        Sideshow.setSubject(step.subject);
      } else {
        Sideshow.setEmptySubject();
      }
      //Updates the mask
      CompositeMask.singleInstance.update(
        Subject.position,
        Subject.dimension,
        Subject.borderRadius
      );

      const sm = SubjectMask.singleInstance;
      sm.fadeOut(() => {
        if (step.lockSubject) sm.show(true);
      });
      //The details panel (that wraps the step description and arrow) is shown
      DetailsPanel.singleInstance.show();
      //Repositionate the details panel depending on the remaining space in the screen
      DetailsPanel.singleInstance.positionate();
      //Sets the description properties (text, title and step position)
      const description = StepDescription.singleInstance;
      const text = stripIndent(step.text);
      if (hasParser(step.format)) {
        description.setHTML(parse(step.format, text));
      } else {
        description.setText(text);
      }

      description.setTitle(step.title);
      description.setStepPosition(
        `${this.getStepPosition() + 1}/${this._storyline.steps.length}`
      );
      //If this step doesn't have its own passing conditions/evaluators, or the flag "showNextButton" is true, then, the button is visible
      if (
        step.showNextButton ||
        step.autoContinue === false ||
        !(step.completingConditions && step.completingConditions.length > 0)
      ) {
        const nextStep = this._storyline.steps[this.getStepPosition() + 1];
        if (nextStep) {
          description.nextButton.setText(
            getString(strings.next) +
              ": " +
              this._storyline.steps[this.getStepPosition() + 1].title
          );
        } else {
          description.nextButton.setText(getString(strings.finishWizard));
        }
        description.nextButton.show();

        if (step.autoContinue === false) {
          description.nextButton.disable();
        }
      } else {
        description.nextButton.hide();
      }

      if (step.targets && step.targets.length > 0) {
        Arrows.setTargets(step.targets);
        document.body.appendChild(Arrows.render(step.arrowPosition));
        Arrows.positionate();
        Arrows.fadeIn();
      }

      //Step Description is shown, but is transparent yet (since we need to know its dimension to positionate it properly)
      description.show(true);
      if (
        !CompositeMask.singleInstance.scrollIfNecessary(
          Subject.position,
          Subject.dimension
        )
      ) {
        description.positionate();
        // Do a simple fade in for the description box
        description.fadeIn();
      }

      callback();
      flags.changingStep = false;
    }
  }

  /**
   * Shows the next step of the wizard
   *
   * @method next
   * @param {Function} callback A callback function to be called
   */

  next(callback = () => {}, nextStep) {
    if (!flags.changingStep || flags.skippingStep) {
      flags.changingStep = true;
      const currentStep = this.currentStep;
      nextStep = nextStep ||
        this._storyline.steps[this.getStepPosition(this.currentStep) + 1];

      this.hideStep(() => {
        if (nextStep) {
          this.showStep(nextStep, callback);
        } else {
          if (
            currentStep &&
            currentStep.listeners &&
            currentStep.listeners.afterStep
          ) {
            currentStep.listeners.afterStep();
          }

          const completedWizard = currentWizard;
          setCurrentWizard(null);
          const listeners = this.listeners;
          if (listeners && listeners.afterWizardEnds) {
            listeners.afterWizardEnds();
          }

          if (!Sideshow.showRelatedWizardsList(completedWizard)) {
            Sideshow.close();
          }
        }
      });
    }
  }

  /**
   * Hides the step
   *
   * @method hideStep
   * @param {Function} callback A callback function to be called in the ending of the hiding process
   */

  hideStep(callback) {
    StepDescription.singleInstance.fadeOut(() => {
      DetailsPanel.singleInstance.hide();
    });
    Arrows.fadeOut();
    SubjectMask.singleInstance.update(
      Subject.position,
      Subject.dimension,
      Subject.borderRadius
    );
    SubjectMask.singleInstance.fadeIn(callback);
  }

  /**
   * Returns the position of the step passed as argument or (by default) the current step
   *
   * @method getStepPosition
   * @param {Object} step The step object to get position
   */

  getStepPosition(step) {
    return this._storyline.steps.indexOf(step || this.currentStep);
  }

  /**
   * Checks if a wizard should be shown in the current context (running each evaluator defined for this wizard)
   *
   * @method isEligible
   * @return {boolean} A boolean indicating if this wizard should be available in the current context
   */

  isEligible() {
    var l = window.location;

    function isEqual(a, b, caseSensitive) {
      return caseSensitive ? a === b : a.toLowerCase() === b.toLowerCase();
    }

    for (var c = 0; c < this.affects.length; c++) {
      var condition = this.affects[c];
      if (condition instanceof Function) {
        if (condition()) return true;
      } else if (condition instanceof Object) {
        if ("route" in condition) {
          var route = l.pathname + l.search + l.hash;
          if (isEqual(route, condition.route, condition.caseSensitive))
            return true;
        }

        if ("hash" in condition) {
          if (isEqual(location.hash, condition.hash, condition.caseSensitive))
            return true;
        }

        if ("url" in condition) {
          if (isEqual(location.href, condition.url, condition.caseSensitive))
            return true;
        }
      }
    }
    return false;
  }

  /**
   * Checks if the current user already watched this wizard
   *
   * @method isAlreadyWatched
   * @return {boolean} A boolean indicating if the user watched this wizard
   * @@todo Implement this method...
   */

  isAlreadyWatched() {
    //ToDo
    return false;
  }

  /**
   * A Polling function to check if the current step is completed
   *
   * @method pollForCheckCompletedStep
   */

  pollForCheckCompletedStep() {
    var conditions = this.currentStep.completingConditions;
    if (conditions && conditions.length > 0 && !flags.skippingStep) {
      var completed = true;
      for (var fn = 0; fn < conditions.length; fn++) {
        var completingCondition = conditions[fn];
        if (!completingCondition()) completed = false;
      }

      if (completed) {
        if (this.currentStep.autoContinue === false)
          StepDescription.singleInstance.nextButton.enable();
        else
          currentWizard.next();
      }
    }
  }

  prepareAndPlay() {
    setCurrentWizard(this);

    if (!this.isEligible()) {
      if (this.preparation)
        this.preparation(function() {
          currentWizard.play();
        });
      else
        throw new SSException(
          "203",
          "This wizard is not eligible neither has a preparation function."
        );
    } else
      this.play();
  }
}
