import FadableItem from "../interface_items/fadable_item";
import StepDescription from "../step/step_description";
import Screen from "../general/screen";
import { flags, currentWizard } from "../general/state";
import { NOT_DISPLAYED } from "../general/AnimationStatus";
import SS from "../general/global_object";
import Subject from "../step/subject";
import DetailsPanel from "../step/step_details_panel";
import Part from "./composite_mask_part";
import CornerPart from "./composite_mask_corner_part";
import SubjectMask from "./subject_mask";

/**
 * Controls the mask surrounds the subject (the step focussed area)
 * 
 * @class CompositeMask
 * @@singleton
 */
export default class CompositeMask extends FadableItem {
  /**
   * Initializes the composite mask
   * 
   * @method init
   */

  init() {
    ["top", "left", "right", "bottom"].forEach(d => {
      this.parts[d] = new Part();
    });
    ["leftTop", "rightTop", "leftBottom", "rightBottom"].forEach(d => {
      this.parts[d] = new CornerPart();
    });
  }

  /**
   * The parts composing the mask
   * 
   * @@field parts
   * @type Object
   */

  parts = {};

  /**
   * Renders the composite mask 
   * 
   * @method render
   */

  render() {
    for (const i in this.parts) {
      const part = this.parts[i];
      if (part.render) {
        part.render();
      }
    }
    this.$el = $(".sideshow-mask-part, .sideshow-mask-corner-part");
    // if(!this.$el || this.$el.length === 0) this.$el = $(".sideshow-mask-part, .sideshow-mask-corner-part");
    SubjectMask.singleInstance.render();
    ["leftTop", "rightTop", "leftBottom", "rightBottom"].forEach(d => {
      this.parts[d].$el.addClass(d);
    });
    this.status = NOT_DISPLAYED;
  }

  /**
   * Checks if the subject is fully visible, if not, scrolls 'til it became fully visible
   * 
   * @method scrollIfNecessary
   * @param {Object} position An object representing the positioning info for the mask
   * @param {Object} dimension An object representing the dimension info for the mask
   */

  scrollIfNecessary(position, dimension) {
    function doSmoothScroll(scrollTop, callback) {
      $("body,html").animate(
        {
          scrollTop: scrollTop
        },
        300,
        callback
      );
    }

    if (!Subject.isSubjectVisible(position, dimension)) {
      const description = StepDescription.singleInstance;
      let y = dimension.height > $window.height() - 50
        ? position.y
        : position.y - 25;
      y += $window.scrollTop();

      doSmoothScroll(y, () => {
        setTimeout(
          () => {
            DetailsPanel.singleInstance.positionate();
            description.positionate();
            description.fadeIn();
          },
          300
        );
      });

      return true;
    }
    return false;
  }

  /**
   * Updates the positioning and dimension of each part composing the whole mask, according to the subject coordinates
   * 
   * @method update
   * @param {Object} position An object representing the positioning info for the mask
   * @param {Object} dimension An object representing the dimension info for the mask
   * @param {Object} borderRadius An object representing the borderRadius info for the mask
   */

  update(position, dimension, borderRadius) {
    SubjectMask.singleInstance.update(position, dimension, borderRadius);
    //Aliases
    const left = position.x;
    const top = position.y;
    const width = dimension.width;
    const height = dimension.height;
    const br = borderRadius;

    //Updates the divs surrounding the subject
    this.parts.top.update(
      {
        x: 0,
        y: 0
      },
      {
        width: $window.width(),
        height: top
      }
    );
    this.parts.left.update(
      {
        x: 0,
        y: top
      },
      {
        width: left,
        height: height
      }
    );
    this.parts.right.update(
      {
        x: left + width,
        y: top
      },
      {
        width: $window.width() - (left + width),
        height: height
      }
    );
    this.parts.bottom.update(
      {
        x: 0,
        y: top + height
      },
      {
        width: $window.width(),
        height: $window.height() - (top + height)
      }
    );

    //Updates the Rounded corners
    this.parts.leftTop.update(
      {
        x: left,
        y: top
      },
      br.leftTop
    );
    this.parts.rightTop.update(
      {
        x: left + width - br.rightTop,
        y: top
      },
      br.rightTop
    );
    this.parts.leftBottom.update(
      {
        x: left,
        y: top + height - br.leftBottom
      },
      br.leftBottom
    );
    this.parts.rightBottom.update(
      {
        x: left + width - br.rightBottom,
        y: top + height - br.rightBottom
      },
      br.rightBottom
    );
  }

  /**
   * A Polling function to check if subject coordinates has changed
   * 
   * @method pollForSubjectChanges
   */

  pollForSubjectChanges() {
    if (!flags.lockMaskUpdate) {
      if (currentWizard && currentWizard.currentStep.subject) {
        const subject = $(currentWizard.currentStep.subject);
        if (Subject.obj[0] !== subject[0]) {
          SS.setSubject(subject, true);
        }
      }

      if (Subject.hasChanged()) {
        Subject.updateInfo();
        this.update(Subject.position, Subject.dimension, Subject.borderRadius);
      }
    }
  }

  /**
   * A Polling function to check if screen dimension has changed
   * 
   * @method pollForScreenChanges
   */

  pollForScreenChanges() {
    if (Screen.hasChanged()) {
      Screen.updateInfo();
      this.update(Subject.position, Subject.dimension, Subject.borderRadius);
    }
  }
}

CompositeMask.singleInstance = new CompositeMask();
