/**
 * Sideshow Settings
 *
 * @object config
 */
const config = {};

/**
 * Chosen language for sideshow interface
 *
 * @field language
 * @type String
 */
config.language = "en";

/**
 * Defines if the intro screen (the tutorial list) will be  skipped when there's just one
 * tutorial available. This way, when Sideshow is invoked, the first step is directly shown.
 *
 * @field autoSkipIntro
 * @type boolean
 */
config.autoSkipIntro = false;

export default config;
