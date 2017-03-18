import SSException from "../general/exception";

var pollingDuration = 150;

/**
 * Controls the polling functions needed by Sideshow
 *
 * @class Polling
 * @static
 */
var Polling = {};

/**
 * The polling functions queue
 *
 * @field queue
 * @type Object
 * @static
 */
Polling.queue = [];

/**
 * A flag that controls if the polling is locked
 *
 * @field lock
 * @type boolean
 * @static
 */
Polling.lock = false;

/**
 * Pushes a polling function in the queue
 *
 * @method enqueue
 * @static
 */
Polling.enqueue = function(firstArg) {
  var fn;
  var name = "";

  if (typeof firstArg === "function") {
    fn = firstArg;
  } else {
    name = arguments[0];
    fn = arguments[1];
  }

  if (
    this.getFunctionIndex(fn) < 0 &&
    (name === "" || this.getFunctionIndex(name) < 0)
  ) {
    this.queue.push({ name, fn, enabled: true });
  } else {
    throw new SSException(
      "301",
      "The function is already in the polling queue."
    );
  }
};

/**
 * Removes a polling function from the queue
 *
 * @method dequeue
 * @static
 */
Polling.dequeue = function(fn) {
  this.queue.splice(this.getFunctionIndex(fn), 1);
};

/**
 * Enables an specific polling function
 *
 * @method enable
 * @static
 */
Polling.enable = function(fn) {
  this.queue[this.getFunctionIndex(fn)].enabled = true;
};

/**
 * Disables an specific polling function, but preserving it in the polling queue
 *
 * @method disable
 * @static
 */
Polling.disable = function(fn) {
  this.queue[this.getFunctionIndex(fn)].enabled = false;
};

/**
 * Gets the position of a polling function in the queue based on its name or the function itself
 *
 * @method getFunctionIndex
 * @static
 */
Polling.getFunctionIndex = function(firstArg) {
  if (typeof firstArg === "function") {
    return this.queue.map(p => p.fn).indexOf(firstArg);
  } else if (typeof firstArg === "string") {
    return this.queue.map(p => p.name).indexOf(firstArg);
  }

  throw new SSException(
    "302",
    "Invalid argument for getFunctionIndex method. Expected a string (the polling function name) or a function (the polling function itself)."
  );
};

/**
 * Unlocks the polling and starts the checking process
 *
 * @method start
 * @static
 */
Polling.start = function() {
  this.lock = false;
  this.doPolling();
};

/**
 * Stops the polling process
 *
 * @method stop
 * @static
 */
Polling.stop = function() {
  this.lock = true;
};

/**
 * Clear the polling queue
 *
 * @method clear
 * @static
 */
Polling.clear = function() {
  const lock = this.lock;

  this.lock = true;
  this.queue = [];
  this.lock = lock;
};

/**
 * Starts the polling process
 *
 * @method doPolling
 * @static
 */
Polling.doPolling = function() {
  if (!this.lock) {
    // Using timeout to avoid the queue to not complete in a cycle
    setTimeout(
      () => {
        Polling.queue.forEach(pollingFunction => {
          pollingFunction.enabled && pollingFunction.fn();
        });
        Polling.doPolling();
      },
      pollingDuration
    );
  }
};

export default Polling;
