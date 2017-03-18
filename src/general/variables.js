var globalObjectName = "Sideshow";
var $window;
var $body;
var $document;
var pollingDuration = 150;
var longAnimationDuration = 600;

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
  }
};

var controlVariables = [];
var flags = {
  lockMaskUpdate: false,
  changingStep: false,
  skippingStep: false,
  running: false
};
var wizards = [];
var currentWizard;

/**
 * Possible statuses for an animation
 * 
 * @@enum AnimationStatus
 */
var AnimationStatus = jazz.Enum(
  "VISIBLE",
  "FADING_IN",
  "FADING_OUT",
  "NOT_DISPLAYED",
  "NOT_RENDERED",
  "TRANSPARENT"
);
