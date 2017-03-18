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
var AnimationStatus = {
  VISIBLE: 0,
  FADING_IN: 1,
  FADING_OUT: 2,
  NOT_DISPLAYED: 3,
  NOT_RENDERED: 4,
  TRANSPARENT: 5
};
