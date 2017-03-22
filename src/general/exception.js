/**
 * A custom exception class for Sideshow
 *
 * @class SSException
 * @extends Error
 * @param {String} code The error code
 * @param {String} message The error message
 */
export default class SSException extends Error {
  name = 'SSException';

  constructor (code, message) {
    super(message)

    this.message = `[SIDESHOW_E#${`00000000${code}`.substr(-8)}] ${message}`
  }
}
