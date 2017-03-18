import SS from "./global_object";

/**
 * Parses a string in the format "#px" in a number
 *
 * @@function parsePxValue
 * @param {String} value A value with/without a px unit
 * @return Number The number value without unit
 */
export function parsePxValue(value) {
  if (value.constructor !== String) return value;
  var br = value === "" ? "0" : value;
  return +br.replace("px", "");
}

/**
 * Gets a string from the dictionary in the current language
 *
 * @@function getString
 * @param {Object} stringKeyValuePair A string key-value pair in dictionary
 * @return String The string value in the current language
 */
export function getString(stringKeyValuePair) {
  if (!(SS.config.language in stringKeyValuePair)) {
    showWarning(
      "2001",
      "String not found for the selected language, getting the first available."
    );
    return stringKeyValuePair[Object.keys(stringKeyValuePair)[0]];
  }

  return stringKeyValuePair[SS.config.language];
}

/**
 * Registers hotkeys to be used when running Sideshow
 *
 * @@function registerInnerHotkeys
 */
export function registerInnerHotkeys() {
  $document.keyup(innerHotkeysListener);
}

/**
 * Unregisters hotkeys used when running Sideshow
 *
 * @@function Unregisters
 */
export function unregisterInnerHotkeys() {
  $document.unbind("keyup", innerHotkeysListener);
}

function innerHotkeysListener(e) {
  // Esc or F1
  if (e.keyCode == 27 || e.keyCode == 112) SS.close();
}

/**
 * Registers global hotkeys
 *
 * @@function registerGlobalHotkeys
 */
export function registerGlobalHotkeys(SS) {
  $document.keyup(e => {
    // F2
    if (e.keyCode == 113) {
      if (e.shiftKey) {
        SS.start({
          listAll: true
        });
      } else {
        SS.start();
      }
    }
  });
}

/**
 * Removes nodes created by Sideshow (except mask, which remains due to performance reasons when recalling Sideshow)
 *
 * @@function removeDOMGarbage
 */
export function removeDOMGarbage() {
  $('[class*="sideshow"]')
    .not(
      ".sideshow-mask-part, .sideshow-mask-corner-part, .sideshow-subject-mask"
    )
    .remove();
}
