# @goto-bus-stop/sideshow

[![Greenkeeper badge](https://badges.greenkeeper.io/goto-bus-stop/sideshow.svg)](https://greenkeeper.io/)

![Sideshow Logo](./examples/images/sideshow-logo.png)
========
[![Node.js devDependency Status](https://david-dm.org/goto-bus-stop/sideshow/dev-status.svg)](https://david-dm.org/goto-bus-stop/sideshow#info=devDependencies)
[![License](http://img.shields.io/badge/license-Apache_2.0-red.svg)](http://www.apache.org/licenses/LICENSE-2.0)

[Documentation and Live example](http://fortesinformatica.github.io/Sideshow)

[Install](#install) -
[Usage](#usage) -
[Configuration](#configuration) -
[Creating a Tutorial](#creating-a-tutorial) -
[Invoking Sideshow](#invoking-sideshow) -
[License](#license-and-copyright)

Sideshow is a powerful javascript library which aims to reduce your user's
learning curve by providing a way to create step-by-step interactive helps.

 * Explain the features of your application
 * Control your end-user's interaction with your UI
 * Use Markdown to create formatted step descriptions
 * Emphasize what you're explaining in each step (a button, grid, dropdown,
   form, the whole screen, and so forth) by surrounding it with a fully
   adaptable mask.

## Install

```bash
npm install --save @goto-bus-stop/sideshow
```

## Usage

With CommonJS (like in Browserify) do:

```js
const Sideshow = require("@goto-bus-stop/sideshow");
```

And include the CSS somehow. [Sheetify](https://github.com/stackcss/sheetify) is good:

```js
const css = require("sheetify");
css("@goto-bus-stop/sideshow");
```

With ES Modules (like in Webpack or Rollup) do:

```js
import Sideshow from "@goto-bus-stop/sideshow";
```

And include the CSS somehow. In Webpack with [css-loader](https://github.com/webpack/css-loader)
this works:

```js
import "@goto-bus-stop/sideshow/distr/sideshow.css";
```

In plain HTML without a bundler, do:

```html
<!-- In the head: -->
<link rel="stylesheet" href="https://unpkg.com/@goto-bus-stop/sideshow/distr/sideshow.min.css">

<!-- In the body: -->
<script src="https://unpkg.com/@goto-bus-stop/sideshow/distr/sideshow.min.js"></script>
<script>
  // `Sideshow` is available!
  Sideshow.init();
</script>
```

## Configuration

Optionally configure Sideshow before calling `Sideshow.init()`:

```js
// Defaults:
Sideshow.config.language = "en";
Sideshow.config.autoSkipIntro = false;

Sideshow.init();
```

**Note**: For now, Sideshow only supports `en` (American English), `pt-br`
(Brazilian Portuguese), `es` (Spanish, translated by Luis Alfaro de la Fuente,
thanks!) and `fr` (French).

## Creating a Tutorial

```js
Sideshow.registerWizard({
  name: "introducing_sideshow",
  title: "Introducing Sideshow",
  description: "Introducing the main features and concepts of Sideshow. ",
  estimatedTime: "10 Minutes",
  affects: [
    // This tutorial would be eligible for URLs like "http://www.foo.com/bar#messages"
    { hash: "#messages" },
    // This tutorial would be eligible for URLs like "http://www.foo.com/adm/orders"
    { route: "/adm/orders", caseSensitive: true },
    // Here we could do any checking to infer if this tutorial is eligible the current screen/context.
    // After this checking, just return a boolean indicating if this tutorial will be available.
    () => $(".grid").length > 0
  ]
});
```

### Defining a Storyline
A storyline is the sequence of steps of some tutorial.

```js
Sideshow.registerWizard({
  //...
}).storyLine({
  showStepPosition: true,
  steps: [
    {
      title: "Hello Sideshow.",
      text: "This is an oversimplified example."
    },
    {
      title: "The end",
      text: "What a pity =(."
    }
  ]
});
```

### Step: A complete example

```js
Sideshow.registerWizard({
  //...
}).storyLine({
  showStepPosition: true,
  steps: [
    {
      title: "The log out button.",
      text: "Click this button if you want to log out of the system.",
      subject: "#user_details_panel",
      targets: "#user_details_panel > .logout"
    }
  ]
});
```

### Using Markdown

```js
Sideshow.registerWizard({
  //...
}).storyLine({
  showStepPosition: true,
  steps: [
    {
      title: "Markdown is pretty cool!",
      text: "This step uses [Markdown](http://en.wikipedia.org/wiki/Markdown) for **text formatting**.",
      format: "markdown"
    }
  ]
});
```

### Completing Conditions
Completing conditions are conditions to be satisfied in order to proceed to the next step.

```js
Sideshow.registerWizard({
    //...
}).storyLine({
  showStepPosition: true,
  steps: [
    {
      title: "Choose a name for your project",
      text: "Enter a name for your project.",
      completingConditions: [
        () => $("#project_name").val().length > 5
      ]
    },
    //...
  ]
});
```

### Auto continue
By setting the autoContinue flag to true, Sideshow proceeds automaticaly when the completing conditions are satisfied.

```js
Sideshow.registerWizard({
    //...
}).storyLine({
  showStepPosition: true,
  steps: [
    {
      title: "Choose a name for your project",
      text: "Enter a name for your project.",
      completingConditions: [
        () => $("#project_name").val().length > 5
      ],
      autoContinue: true
    },
    //...
  ]
});
```

### Events
You can perform some action or do some preparation for the next step, or anything you want which can be done programatically.

```js
Sideshow.registerWizard({
  //...
  listeners: {
    beforeWizardStarts() {
      //What goes here will be executed before the first step of this tutorial
    },
    afterWizardEnds() {
      //What goes here will be executed after the last step of this tutorial
    }
  }
}).storyLine({
  showStepPosition: true,
  steps: [
    {
      title: "Foo bar",
      text: "An example of step just to illustrate how to use step events.",
      listeners: {
        beforeStep(){
          //What goes here will be executed before this step
        },
        afterStep(){
          //What goes here will be executed after this step
        }
      }
    },
    //...
  ]
});
```

### Skipping a step

When entering some step you can do some verification to skip the step
automatically.

```js
Sideshow.registerWizard({
  //...
}).storyLine({
  showStepPosition: true,
  steps: [
    {
      //...
      skipIf: () => $("#groups").children().length > 0
    },
    //...
  ]
});
```

### Jumping to other step
You can jump to other step by its position (1-based) or its unique name.

```js
Sideshow.registerWizard({
    //...
}).storyLine({
  showStepPosition: true,
  steps: [
    {
      //...
      listeners: {
        beforeStep(){
          if ($("#groups").children().length > 0) {
            Sideshow.gotoStep("the_end"); //we're jumping to the step named "the_end"
          } else if ($("#people").children().length > 0) {
            Sideshow.gotoStep(7); //we're jumping to the seventh step in this Wizard storyline
          }
        }
      }
    },
    //...
    {
      name: "the_end",
      title: "The end",
      //...
    }
  ]
});
```

### Tutorial Eligibility

When a user invokes Sideshow, a list with the tutorials available for the
current screen/context is shown. Sideshow knows if a tutorial is eligible for
some screen by testing the `affects` conditions of each registered tutorial. If
one of the conditions are met, the tutorial is listed.

```js
Sideshow.registerWizard({
  //...
  affects: [
    // This tutorial would be eligible for URLs like "http://www.foo.com/bar#messages"
    { hash: "#messages" },
    // This tutorial would be eligible for URLs like "http://www.foo.com/adm/orders"
    { route: "/adm/orders", caseSensitive: true },
    // Here we could do any checking to infer if this tutorial is eligible the
    // current screen/context. After this checking, just return a boolean
    // indicating if this tutorial will be available.
    () => $(".grid").length > 0
  ]
}).storyLine({
  //...
});
```

### Tutorial Preparation Function

Even if a tutorial isn't eligible for some screen, by using a preparation
function a user can access this tutorial from any point of your system/site (by
pressing shift-F2).


```js
Sideshow.registerWizard({
  // ...
  preparation(doneCallback){
    // if your app is a SPA, you could do some sort of redirection and call the
    // doneCallback function after the page is loaded.
  }
}).storyLine({
  // ...
});
```

### Related Tutorials

You can also define relationships between tutorials, this way, after finishing a
tutorial, the user sees a list of others related to this.


```js
Sideshow.registerWizard({
  // ...
  // after finishing the current wizard, the user will be guided to related tutorials
  relatedWizards: [
    "creating_user",
    "groups_and_permissions",
    "security_settings"
  ]
}).storyLine({
  //...
});
```

### Skipping the Intro screen (the tutorial list) automatically if there's just one tutorial available for a given context

In the sideshow.config.js file, set the `autoSkipIntro` option to true:

```js
Sideshow.config.autoSkipIntro = true;
//...other configuration options
Sideshow.init();
```

## Invoking Sideshow

 *  The user can access the tutorials available for the current screen by
    pressing `F2`.
 *  The user can access the tutorials available for the current screen +
    tutorials for other screens with a preparation function by pressing
    `shift+F2`.

## Fortes Informática

Sideshow was created by [Fortes Informática](http://www.fortesinformatica.com.br),
a great technology company headquartered in Fortaleza, CE (Brazil). Fortes
Informática has several offices across the country, and an impressive history of
more than 20 years. Sideshow is making our software yet more easy to use and
even more innovative.

## [License and Copyright](./LICENSE)

Copyright 2013-2015 Fortes Informática

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
