// Helper functions for setting up UI components like sliders
// and checkboxes.

export class Slider {
  #model;
  #onUpdateRead;

  // DOM elements
  #container;
  #input;
  #valueSpan;

  // When the object is `updated` by the model changes,
  // we don't want to fire any new events.
  #suppressEvents = false;

  /**
   * Creates a new slider with associated DOM elements
   * @param {string} id - The base ID for the slider elements
   * @param {object} settings
   * @param {object} model
   * @param {Function} onChangeAction - What happens with a new value if the slider is moved
   * @param {Function} onUpdateRead - How to read the value from the model if model triggers `update`
   */
  constructor(id, settings, model, onChangeAction, onUpdateRead) {
    this.#model = model;
    this.#onUpdateRead = onUpdateRead;

    // Create the container
    this.#container = document.createElement('div');
    this.#container.className = 'slider-container';

    // Create the label
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = `${settings.label}: `;
    
    // Create the value span
    this.#valueSpan = document.createElement('span');
    this.#valueSpan.id = `${id}Value`;
    this.#valueSpan.textContent = "?";

    // Append the span to the label
    label.appendChild(this.#valueSpan);
    
    // Create the input
    this.#input = document.createElement('input');
    this.#input.type = 'range';
    this.#input.id = id;
    this.#input.min = settings.min;
    this.#input.max = settings.max;
    this.#input.step = settings.step;
    this.#input.value = settings.min;
    
    // Add event listener
    this.#input.addEventListener('input', () => {
      if (!this.#suppressEvents) {
        const newSliderValue = parseFloat(this.#input.value);
        onChangeAction(newSliderValue);
      } else {
        this.#suppressEvents = false;
      }
    });
    
    // Assemble the container
    this.#container.appendChild(label);
    this.#container.appendChild(this.#input);
  }

  /**
   * Gets the main container element
   * @returns {HTMLElement} The slider container div
   */
  getElement() {
    return this.#container;
  }

  /**
   * Triggered by the model whenever the model state changes.
   */
  update() {
    this.#suppressEvents = true; // Prevent triggering the input event
    const newValue = this.#onUpdateRead(this.#model);
    this.#input.value = newValue;
    this.#valueSpan.textContent = newValue.toFixed(2);
    // Reset suppressEvents after DOM operations are complete
    setTimeout(() => {
      this.#suppressEvents = false;
    }, 0);
  }
}


/**
 * Creates a slider connected to a physics parameter in the model
 * @param {string} key - The parameter key in the model's physicsParams
 * @param {object} settings - Slider settings (min, max, step, label, id)
 * @param {object} model - The application model
 * @returns {Slider} - The created slider instance
 */
export function setupPhysicsSlider(key, settings, model) {
  // onChangeAction: What to do when the slider value changes
  const onChangeAction = (newValue) => {
    model.setPhysicsParam(key, newValue);
  };
  
  // onUpdateRead: How to read the current value from the model
  const onUpdateRead = (model) => model.getPhysicsParam(key);
  
  // Create the slider with the callbacks
  const slider = new Slider(settings.id, settings, model, onChangeAction, onUpdateRead);
  
  // Add the slider to the DOM
  const sliderContainer = document.querySelector('.sliders');
  if (sliderContainer) {
    sliderContainer.appendChild(slider.getElement());
  } else {
    console.warn('No .sliders container found in the DOM');
  }
  
  // Register the slider as an observer of the model
  model.addObserver(slider);
  
  // Update the slider with the initial value from the model
  slider.update();
  
  return slider;
}

/**
 * Creates a slider connected to a graphics parameter in the model
 * @param {string} key - The parameter key in the model's graphicsParams
 * @param {object} settings - Slider settings (min, max, step, label, id)
 * @param {object} model - The application model
 * @returns {Slider} - The created slider instance
 */
export function setupGraphicsSlider(key, settings, model) {
  // onChangeAction: What to do when the slider value changes
  const onChangeAction = (newValue) => {
    model.setGraphicsParam(key, newValue);
  };
  
  // onUpdateRead: How to read the current value from the model
  const onUpdateRead = (model) => {
    const params = model.getGraphicsParams();
    return params[key];
  };
  
  // Create the slider with the callbacks
  const slider = new Slider(settings.id, settings, model, onChangeAction, onUpdateRead);
  
  // Add the slider to the DOM - try to find a dedicated graphics sliders container first
  const graphicsSliderContainer = document.getElementById('graphicsSliders');
  if (graphicsSliderContainer) {
    graphicsSliderContainer.appendChild(slider.getElement());
  } else {
    // Fallback to general sliders container
    const sliderContainer = document.querySelector('.sliders');
    if (sliderContainer) {
      sliderContainer.appendChild(slider.getElement());
    } else {
      console.warn('No #graphicsSliders or .sliders container found in the DOM');
    }
  }
  
  // Register the slider as an observer of the model
  model.addObserver(slider);
  
  // Update the slider with the initial value from the model
  slider.update();
  
  return slider;
}

/**
 * Creates a slider connected to a measurement parameter in the model
 * @param {string} key - The parameter key in the model's measurementParams
 * @param {object} settings - Slider settings (min, max, step, label, id)
 * @param {object} model - The application model
 * @returns {Slider} - The created slider instance
 */
export function setupMeasurementSlider(key, settings, model) {
  // onChangeAction: What to do when the slider value changes
  const onChangeAction = (newValue) => {
    model.setMeasurementParam(key, newValue);
  };
  
  // onUpdateRead: How to read the current value from the model
  const onUpdateRead = (model) => model.getMeasurementParam(key);
  
  // Create the slider with the callbacks
  const slider = new Slider(settings.id, settings, model, onChangeAction, onUpdateRead);
  
  // Add the slider to the DOM - try to find a dedicated measurement sliders container first
  const measurementSliderContainer = document.getElementById('measurementSliders');
  if (measurementSliderContainer) {
    measurementSliderContainer.appendChild(slider.getElement());
  } else {
    throw new Error('No #measurementSliders container found in the DOM');
  }
  
  // Register the slider as an observer of the model
  model.addObserver(slider);
  
  // Update the slider with the initial value from the model
  slider.update();
  
  return slider;
}


export class Checkbox {
  #model;
  #onUpdateRead;
  #container;
  #input;
  #label;
  #suppressEvents = false;

  /**
   * Creates a new checkbox with associated DOM elements
   * @param {string} id - The base ID for the checkbox elements
   * @param {object} settings
   * @param {object} model
   * @param {Function} onChangeAction - What happens when the checkbox is toggled
   * @param {Function} onUpdateRead - How to read the value from the model if model triggers `update`
   */
  constructor(id, settings, model, onChangeAction, onUpdateRead) {
    this.#model = model;
    this.#onUpdateRead = onUpdateRead;

    // Create the container
    this.#container = document.createElement('div');
    this.#container.className = 'checkbox-container';

    // Create the input
    this.#input = document.createElement('input');
    this.#input.type = 'checkbox';
    this.#input.id = id;

    // Create the label
    this.#label = document.createElement('label');
    this.#label.htmlFor = id;
    this.#label.textContent = `${settings.label} On`;

    // Add event listener
    this.#input.addEventListener('change', () => {
      if (!this.#suppressEvents) {
        onChangeAction(this.#input.checked);
      } else {
        this.#suppressEvents = false;
      }
    });

    // Assemble the container
    this.#container.appendChild(this.#input);
    this.#container.appendChild(this.#label);
  }

  /**
   * Gets the main container element
   * @returns {HTMLElement} The checkbox container div
   */
  getElement() {
    return this.#container;
  }

  /**
   * Triggered by the model whenever the model state changes.
   */
  update() {
    this.#suppressEvents = true;
    const checked = !!this.#onUpdateRead(this.#model);
    this.#input.checked = checked;

    // Reset suppressEvents after DOM operations are complete
    setTimeout(() => {
      this.#suppressEvents = false;
    }, 0);
  }
}

/**
 * Creates a checkbox connected to a physics parameter in the model
 * @param {string} key - The parameter key in the model's physicsParams
 * @param {object} settings - Checkbox settings (label, id)
 * @param {object} model - The application model
 * @returns {Checkbox} - The created checkbox instance
 */
export function setupPhysicsCheckbox(key, settings, model) {
  const onChangeAction = (checked) => {
    model.setPhysicsParam(key, checked);
  };

  const onUpdateRead = (model) => model.getPhysicsParam(key);
  
  const checkbox = new Checkbox(settings.id, settings, model, onChangeAction, onUpdateRead);

  const container = document.getElementById('physicsCheckboxes');
  if (container) {
    container.appendChild(checkbox.getElement());
  } else {
    console.warn('No .sliders container found in the DOM');
  }

  model.addObserver(checkbox);
  checkbox.update();

  return checkbox;
}

export class Counter {
  #model;
  #onUpdateRead;
  #container;
  #label;
  #valueSpan;

  /**
   * Creates a new counter with associated DOM elements
   * @param {string} id - The base ID for the counter elements
   * @param {object} settings
   * @param {object} model
   * @param {Function} onUpdateRead - How to read the value from the model if model triggers `update`
   */
  constructor(id, settings, model, onUpdateRead) {
    this.#model = model;
    this.#onUpdateRead = onUpdateRead;

    // Create the container
    this.#container = document.createElement('div');
    this.#container.className = 'counter-container';

    // Create the label and value span
    this.#label = document.createElement('span');
    this.#label.textContent = settings.label + ': ';

    this.#valueSpan = document.createElement('span');
    this.#valueSpan.id = id;
    this.#valueSpan.textContent = '0';

    // Assemble the container
    this.#container.appendChild(this.#label);
    this.#container.appendChild(this.#valueSpan);
  }

  /**
   * Gets the main container element
   * @returns {HTMLElement} The counter container div
   */
  getElement() {
    return this.#container;
  }

  /**
   * Triggered by the model whenever the model state changes.
   */
  update() {
    const value = this.#onUpdateRead(this.#model);
    this.#valueSpan.textContent = value;
  }
}

/**
 * Creates a counter connected to a measurement parameter in the model
 * @param {string} key - The parameter key in the model's measurementParams
 * @param {object} settings - Counter settings (label, id)
 * @param {object} model - The application model
 * @returns {Counter} - The created counter instance
 */
export function setupMeasurementCounter(key, settings, model) {
  const onUpdateRead = (model) => model.getHitCount(key);

  const counter = new Counter(settings.id, settings, model, onUpdateRead);

  // Try to find a .counters container, fallback to .sliders if not found
  let container = document.querySelector('.counters');
  if (!container) {
    container = document.querySelector('.sliders');
  }
  if (container) {
    container.appendChild(counter.getElement());
  } else {
    console.warn('No .counters or .sliders container found in the DOM');
  }

  model.addObserver(counter);
  counter.update();

  return counter;
}


export class Button {
  #model;
  #settings;
  #container;
  #button;
  #title;

  /**
   * Creates a new button with associated DOM elements
   * @param {string} id - The base ID for the button element
   * @param {object} config - { title, settings }
   * @param {object} model - The application model
   * @param {Function} onClickAction - What happens when the button is clicked
   */
  constructor(id, config, model, onClickAction) {
    this.#model = model;
    this.#settings = config.settings;

    // Create the container
    this.#container = document.createElement('div');
    this.#container.className = 'button-container';

    // Create the button
    this.#button = document.createElement('button');
    this.#button.id = id;
    this.#button.textContent = config.title;

    // Add event listener
    this.#button.addEventListener('click', () => {
      onClickAction(this.#settings.physicsParams);
    });

    // Assemble the container
    this.#container.appendChild(this.#button);
  }

  /**
   * Gets the main container element
   * @returns {HTMLElement} The button container div
   */
  getElement() {
    return this.#container;
  }

  /**
   * No-op for now, but present for observer compatibility
   */
  update() {
    // Buttons do not need to update for model changes in this context
  }
}

/**
 * Creates a button connected to a physicsParams preset in the model
 * @param {string} id - The button id
 * @param {object} config - { title, settings }
 * @param {object} model - The application model
 * @returns {Button} - The created button instance
 */
export function setupPhysicsButton(id, config, model) {
  const onClickAction = (physicsParams) => {
    for (const key in physicsParams) {
      if (Object.prototype.hasOwnProperty.call(physicsParams, key)) {
        model.setPhysicsParam(key, physicsParams[key]);
      }
    }
  };

  const button = new Button(id, config, model, onClickAction);

  // Try to find a .buttons container, fallback to .sliders if not found
  let container = document.querySelector('.buttons');
  if (!container) {
    container = document.querySelector('.sliders');
  }
  if (container) {
    container.appendChild(button.getElement());
  } else {
    console.warn('No .buttons or .sliders container found in the DOM');
  }

  // Optionally register as observer if needed for future updates
  // model.addObserver(button);

  return button;
}

/**
 * Creates a button connected to a physicsParams preset in the model
 * @param {string} title - The button text
 * @param {object} settings - Contains physicsParams to apply when clicked
 * @param {object} model - The application model
 * @returns {Button} - The created button instance
 */
export function setupButton(title, settings, model) {
  // Create a unique ID for the button based on the title
  const id = 'btn_' + title.toLowerCase().replace(/\s+/g, '_');
  
  const config = {
    title: title,
    settings: settings
  };
  
  // onClickAction: What to do when the button is clicked
  const onClickAction = (physicsParams) => {
    if (physicsParams) {
      // Update each physics parameter specified in the settings
      for (const key in physicsParams) {
        if (Object.prototype.hasOwnProperty.call(physicsParams, key)) {
          model.setPhysicsParam(key, physicsParams[key]);
        }
      }
    }
  };

  const button = new Button(id, config, model, onClickAction);

  // Try to find a .buttons container, fallback to .sliders if not found
  let container = document.querySelector('.buttons');
  if (!container) {
    container = document.querySelector('.sliders');
  }
  if (container) {
    container.appendChild(button.getElement());
  } else {
    console.warn('No .buttons or .sliders container found in the DOM');
  }

  // Button doesn't need to be an observer since it doesn't update with model changes
  // But we keep the update method for consistency with other UI components
  
  return button;
}
