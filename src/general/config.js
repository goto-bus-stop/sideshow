/**
 * Sideshow Settings
 *
 * @@object config
 */
const config = {};

/**
 * Application route to persists user preferences
 *
 * @@field userPreferencesRoute
 * @type String
 * @@unused
 * @@todo Implement persistence logic
 */
config.userPreferencesRoute = null;

/**
 * Logged in user
 *
 * @@field loggedInUser
 * @type String
 * @@unused
 */
config.loggedInUser = null;

/**
 * Chosen language for sideshow interface
 *
 * @@field language
 * @type String
 */
config.language = "en";

/**
 * Defines if the intro screen (the tutorial list) will be  skipped when there's just one 
 * tutorial available. This way, when Sideshow is invoked, the first step is directly shown.
 *
 * @@field autoSkipIntro
 * @type boolean
 */
config.autoSkipIntro = false;

export default config;
