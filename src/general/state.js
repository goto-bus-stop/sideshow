export var flags = {
  lockMaskUpdate: false,
  changingStep: false,
  skippingStep: false,
  running: false
};

export var currentWizard;
export function setCurrentWizard(wizard) {
  currentWizard = wizard;
}

export const wizards = [];
