var controlVariables = [];

/**
 * Stores the variables used in step evaluators 
 * 
 * @class ControlVariables
 * @static
 */
const ControlVariables = {};

/**
 * Sets a variable value
 * 
 * @method set
 * @param {String} name The variable name
 * @param {String} value The variable value
 * @return {String} A formatted key=value pair representing the defined variable 
 */
ControlVariables.set = function(name, value) {
  let variable = {};
  if (this.isDefined(name)) {
    variable = this.getNameValuePair(name);
  } else {
    controlVariables.push(variable);
  }

  variable.name = name;
  variable.value = value;
  return `${name}=${value}`;
};

/**
 * Sets a variable if not defined yet
 * 
 * @method setIfUndefined
 * @param {String} name The variable name
 * @param {String} value The variable value
 * @return {String} A formatted key=value pair representing the defined variable 
 */
ControlVariables.setIfUndefined = function(name, value) {
  if (!this.isDefined(name)) return this.set(name, value);
};

/**
 * Checks if some variable is already defined
 * 
 * @method isDefined
 * @param {String} name The variable name
 * @return {boolean} A boolean indicating if the variable is already defined
 */
ControlVariables.isDefined = function(name) {
  return this.getNameValuePair(name) !== undefined;
};

/**
 * Gets a variable value
 * 
 * @method get
 * @param {String} name The variable name
 * @return {any} The variable value
 */
ControlVariables.get = function(name) {
  const pair = this.getNameValuePair(name);
  return pair ? pair.value : undefined;
};

/**
 * Gets a pair with name and value 
 * 
 * @method getNameValuePair
 * @param {String} name The variable name
 * @return {Object} A pair with the variable name and value
 */
ControlVariables.getNameValuePair = function(name) {
  for (let i = 0; i < controlVariables.length; i++) {
    const variable = controlVariables[i];
    if (variable.name === name) return variable;
  }
};

/**
 * Remove some variable from the control variables collection
 * 
 * @method remove
 * @param {String} name The variable name
 * @return {Object} A pair with the removed variable name and value
 */
ControlVariables.remove = function(name) {
  return controlVariables.splice(
    controlVariables.indexOf(this.getNameValuePair(name)),
    1
  );
};

/**
 * Clear the control variables collection 
 * 
 * @method clear
 */
ControlVariables.clear = function() {
  controlVariables = [];
};

export default ControlVariables;
