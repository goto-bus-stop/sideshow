import remove from "@f/remove-element";
import foreach from "@f/foreach-array";
import SS from "./global_object";

/**
 * Parses a string in the format "#px" in a number
 *
 * @function parsePxValue
 * @param {String} value A value with/without a px unit
 * @return Number The number value without unit
 */
export function parsePxValue(value) {
  if (typeof value !== "string") {
    return value;
  }
  const br = value === "" ? "0" : value;
  return +br.replace("px", "");
}

/**
 * Gets a string from the dictionary in the current language
 *
 * @function getString
 * @param {Object} stringKeyValuePair A string key-value pair in dictionary
 * @return String The string value in the current language
 */
export function getString(stringKeyValuePair) {
  if (!(SS.config.language in stringKeyValuePair)) {
    console.warn(
      "String not found for the selected language, getting the first available."
    );
    return stringKeyValuePair[Object.keys(stringKeyValuePair)[0]];
  }

  return stringKeyValuePair[SS.config.language];
}

/**
 * Registers hotkeys to be used when running Sideshow
 *
 * @function registerInnerHotkeys
 */
export function registerInnerHotkeys() {
  document.addEventListener("keyup", innerHotkeysListener);
}

/**
 * Unregisters hotkeys used when running Sideshow
 *
 * @function Unregisters
 */
export function unregisterInnerHotkeys() {
  document.removeEventListener("keyup", innerHotkeysListener);
}

function innerHotkeysListener(e) {
  // Esc or F1
  if (e.keyCode === 27 || e.keyCode === 112) SS.close();
}

/**
 * Registers global hotkeys
 *
 * @function registerGlobalHotkeys
 */
export function registerGlobalHotkeys(SS) {
  document.addEventListener("keyup", e => {
    // F2
    if (e.keyCode === 113) {
      if (e.shiftKey) {
        SS.start({ listAll: true });
      } else {
        SS.start();
      }
    }
  });
}

/**
 * Removes nodes created by Sideshow (except mask, which remains due to performance reasons when recalling Sideshow)
 *
 * @function removeDOMGarbage
 */
export function removeDOMGarbage() {
  foreach(
    remove,
    document.querySelectorAll(
      '[class*="sideshow"]:not(.sideshow-mask-part):not(.sideshow-mask-corner-part):not(.sideshow-subject-mask)'
    )
  );
}
