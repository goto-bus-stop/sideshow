import SSException from '../general/exception'

const pollingDuration = 150

/**
 * Controls the polling functions needed by Sideshow
 *
 * @class Polling
 * @static
 */
class Polling {
  /**
   * The polling functions queue
   *
   * @field queue
   * @type Object
   * @static
   */

  queue = [];

  /**
   * A flag that controls if the polling is locked
   *
   * @field lock
   * @type boolean
   * @static
   */

  lock = false;

  /**
   * Pushes a polling function in the queue
   *
   * @method enqueue
   * @static
   */

  enqueue (name, fn) {
    if (typeof name === 'function') {
      fn = name
      name = ''
    }

    if (
      this.getFunctionIndex(fn) < 0 &&
      (name === '' || this.getFunctionIndex(name) < 0)
    ) {
      this.queue.push({ name, fn, enabled: true })
    } else {
      throw new SSException(
        '301',
        'The function is already in the polling queue.'
      )
    }
  }

  /**
   * Removes a polling function from the queue
   *
   * @method dequeue
   * @static
   */

  dequeue (fn) {
    this.queue.splice(this.getFunctionIndex(fn), 1)
  }

  /**
   * Enables an specific polling function
   *
   * @method enable
   * @static
   */

  enable (fn) {
    this.queue[this.getFunctionIndex(fn)].enabled = true
  }

  /**
   * Disables an specific polling function, but preserving it in the polling queue
   *
   * @method disable
   * @static
   */

  disable (fn) {
    this.queue[this.getFunctionIndex(fn)].enabled = false
  }

  /**
   * Gets the position of a polling function in the queue based on its name or the function itself
   *
   * @method getFunctionIndex
   * @static
   */

  getFunctionIndex (fn) {
    if (typeof fn === 'function') {
      return this.queue.map(p => p.fn).indexOf(fn)
    } else if (typeof fn === 'string') {
      return this.queue.map(p => p.name).indexOf(fn)
    }

    throw new SSException(
      '302',
      'Invalid argument for getFunctionIndex method. Expected a string (the polling function name) or a function (the polling function itself).'
    )
  }

  /**
   * Unlocks the polling and starts the checking process
   *
   * @method start
   * @static
   */

  start () {
    this.lock = false
    this.doPolling()
  }

  /**
   * Stops the polling process
   *
   * @method stop
   * @static
   */

  stop () {
    this.lock = true
  }

  /**
   * Clear the polling queue
   *
   * @method clear
   * @static
   */

  clear () {
    const lock = this.lock

    this.lock = true
    this.queue = []
    this.lock = lock
  }

  /**
   * Starts the polling process
   *
   * @method doPolling
   * @static
   */

  doPolling () {
    if (!this.lock) {
      // Using timeout to avoid the queue to not complete in a cycle
      setTimeout(
        () => {
          this.queue.forEach(pollingFunction => {
            pollingFunction.enabled && pollingFunction.fn()
          })
          this.doPolling()
        },
        pollingDuration
      )
    }
  }
}

export default new Polling()
