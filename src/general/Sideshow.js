import find from '@f/find'
import foreach from '@f/foreach-array'
import Arrows from '../step/arrows'
import Subject from '../step/subject'
import DetailsPanel from '../step/step_details_panel'
import CompositeMask from '../mask/composite_mask'
import SubjectMask from '../mask/subject_mask'
import WizardMenu from '../wizard/wizard_menu'
import Wizard from '../wizard/wizard'
import SSException from './exception'
import strings from './dictionary'
import Polling from './polling'
import { VISIBLE, FADING_IN } from './AnimationStatus'
import { flags, currentWizard, setCurrentWizard, wizards } from './state'
import config from './config'
import {
  registerGlobalHotkeys,
  getString,
  removeDOMGarbage
} from './utility_functions'
import { registerParser } from './parsers'
import CloseButton from '../components/CloseButton'
import { version as pkgVersion } from '../../package.json'

/**
 * The main class for Sideshow
 *
 * @class Sideshow
 * @static
 */
class Sideshow {
  /**
   * The current Sideshow version
   *
   * @property VERSION
   * @type String
   */

  get VERSION () {
    return pkgVersion
  }

  /**
   * @field config
   */

  config = config;

  /**
   * @field closeButton
   * @private
   */

  closeButton = new CloseButton({
    onClose: () => this.close()
  });

  /**
   * Initializes Sideshow
   *
   * @method init
   */

  init () {
    registerGlobalHotkeys(Sideshow)
    Polling.start()
    CompositeMask.singleInstance.init()
    flags.lockMaskUpdate = true
    document.body.appendChild(CompositeMask.singleInstance.render())
  }

  /**
   * Register a new format parser.
   *
   * @method registerParser
   */

  registerParser = registerParser;

  /**
   * Stops and Closes Sideshow
   *
   * @method closes
   */

  close () {
    if (!currentWizard) {
      WizardMenu.hide()
    }

    DetailsPanel.singleInstance.fadeOut()

    this.closeButton.fadeOut()
    Arrows.fadeOut()

    setTimeout(
      () => {
        if (
          CompositeMask.singleInstance.status === VISIBLE ||
          CompositeMask.singleInstance.status === FADING_IN
        ) {
          CompositeMask.singleInstance.fadeOut()
        }

        SubjectMask.singleInstance.fadeOut()
      },
      600
    )

    removeDOMGarbage()
    Polling.clear()
    document.removeEventListener('keyup', this.onEscapePress)
    setCurrentWizard(null)
    flags.running = false
  }

  /**
   * Event handler to close the tutorial when the Esc or F1 keys are pressed.
   *
   * @method onEscapePress
   * @private
   */

  onEscapePress = (event) => {
    // Esc or F1
    if (event.keyCode === 27 || event.keyCode === 112) {
      this.close()
    }
  };

  /**
   * Jump to a step.
   */
  gotoStep (firstArg) {
    const steps = currentWizard._storyline.steps
    let destination

    flags.skippingStep = true

    // First argument is the step position (1-based)
    if (typeof firstArg === 'number') {
      if (firstArg <= steps.length) {
        destination = steps[firstArg - 1]
      } else {
        throw new SSException(
          '401',
          "There's no step in the storyline with position " + firstArg + '.'
        )
      }
    } else if (typeof firstArg === 'string') {
      // First argument is the step name
      destination = find(steps, i => i.name === firstArg)

      if (!destination) {
        throw new SSException(
          '401',
          "There's no step in the storyline with name " + firstArg + '.'
        )
      }
    }
    setTimeout(
      () => {
        currentWizard.next(null, destination)
      },
      100
    )
  }

  /**
   * A trick to use the composite mask to simulate the behavior of a solid mask, setting an empty subject
   *
   * @method setEmptySubject
   */

  setEmptySubject () {
    flags.lockMaskUpdate = true
    Subject.obj = null
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
    })
  }

  /**
   * Sets the current subject
   *
   * @method setSubject
   * @param {Object} subj
   */

  setSubject (subj, subjectChanged) {
    if (typeof subj === 'string') {
      subj = document.querySelectorAll(subj)
    }

    if (subj.length > 0) {
      if (subj.length === 1) {
        Subject.obj = subj[0]
        Subject.updateInfo()
        flags.lockMaskUpdate = false
      } else {
        throw new SSException(
          '101',
          'A subject must have only one element. Multiple elements by step will be supported in future versions of this.'
        )
      }
    } else if (subjectChanged) {
      this.setEmptySubject()
    } else {
      throw new SSException('100', 'Invalid subject.')
    }
  }

  /**
   * Registers a wizard
   *
   * @method registerWizard
   * @param {Object} wizardConfig
   * @return {Object} The wizard instance
   */

  registerWizard (wizardConfig) {
    const wiz = new Wizard(wizardConfig)
    wizards.push(wiz)
    return wiz
  }

  /**
   * Registers a wizard
   *
   * @method registerWizard
   * @param {boolean} onlyNew Checks only recently added wizards
   * @return {Array} The eligible wizards list
   */

  getElegibleWizards (onlyNew) {
    const eligibleWizards = []
    let somethingNew = false
    foreach(
      wiz => {
        if (wiz.isEligible()) {
          if (!wiz.isAlreadyWatched()) {
            somethingNew = true
          }
          eligibleWizards.push(wiz)
        }
      },
      wizards
    )

    return !onlyNew || somethingNew ? eligibleWizards : []
  }

  /**
   * Checks if there are eligible wizards, if exists, shows the wizard menu
   *
   * @method showWizardsList
   * @param {boolean} onlyNew Checks only recently added wizards
   * @return {boolean} Returns a boolean indicating whether there is some wizard available
   */

  showWizardsList (firstArg, title) {
    const onlyNew = typeof firstArg === 'boolean' ? false : firstArg
    const wizards = firstArg instanceof Array
      ? firstArg
      : this.getElegibleWizards(onlyNew)

    WizardMenu.show(wizards, title)

    return wizards.length > 0
  }

  /**
   * Shows a list with the related wizards
   *
   * @method showRelatedWizardsList
   * @param {Object} completedWizard The recently completed wizard
   * @return {boolean} Returns a boolean indicating whether there is some related wizard available
   */

  showRelatedWizardsList (completedWizard) {
    const relatedWizardsNames = completedWizard.relatedWizards
    if (!relatedWizardsNames) {
      return false
    }

    // Gets only related tutorials which are eligible or have a preparation function
    const relatedWizards = wizards.filter(
      w =>
        relatedWizardsNames.indexOf(w.name) > -1 &&
        (w.isEligible() || w.preparation)
    )
    if (relatedWizards.length === 0) {
      return false
    }

    Polling.clear()
    this.showWizardsList(relatedWizards, getString(strings.relatedWizards))

    return true
  }

  /**
   * Starts Sideshow
   *
   * @method start
   * @param {Object} config The config object for Sideshow
   */

  start (config = {}) {
    if (!flags.running) {
      const onlyNew = 'onlyNew' in config && !!config.onlyNew
      const listAll = 'listAll' in config && !!config.listAll
      const wizardName = config.wizardName

      if (listAll) {
        this.showWizardsList(
          wizards.filter(w => w.isEligible() || w.preparation)
        )
      } else if (wizardName) {
        const wizard = find(wizards, w => w.name === wizardName)

        if (!wizard) {
          throw new SSException(
            '205',
            `There's no wizard with name '${wizardName}'.`
          )
        }

        wizard.prepareAndPlay()
      } else {
        this.showWizardsList(onlyNew)
      }

      document.body.appendChild(this.closeButton.render())
      this.closeButton.fadeIn()

      document.addEventListener('keyup', this.onEscapePress)

      flags.running = true

      Polling.enqueue('check_composite_mask_screen_changes', () => {
        CompositeMask.singleInstance.pollForScreenChanges()
      })
    }
  }
}

export default Sideshow
