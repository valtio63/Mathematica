export class Slider {
  #container;
  #input;
  #valueSpan;
  #value;
  #min;
  #max;
  #suppressEvents = false;

  /**
   * Creates a new slider with associated DOM elements
   * @param {string} id - The base ID for the slider elements
   * @param {string} labelText - The label text (without the value)
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @param {number} value - Initial value
   * @param {number} step - Step size
   */
  constructor(id, labelText, min, max, value, step = 1) {
    this.#min = min;
    this.#max = max;
    this.#value = value;

    // Create the container
    this.#container = document.createElement('div');
    this.#container.className = 'slider-container';

    // Create the label
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = `${labelText}: `;
    
    // Create the value span
    this.#valueSpan = document.createElement('span');
    this.#valueSpan.id = `${id}Value`;
    this.#valueSpan.textContent = value;
    
    // Append the span to the label
    label.appendChild(this.#valueSpan);
    
    // Create the input
    this.#input = document.createElement('input');
    this.#input.type = 'range';
    this.#input.id = id;
    this.#input.min = min;
    this.#input.max = max;
    this.#input.step = step;
    this.#input.value = value;
    
    // Add event listener
    this.#input.addEventListener('input', () => {
      if (!this.#suppressEvents) {
        this.#value = parseFloat(this.#input.value);
        this.#valueSpan.textContent = this.#value;
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
   * Sets the slider value and updates the UI without triggering events
   * @param {number} newValue - The new value
   */
  setValue(newValue) {
    // Ensure value is within range
    const constrainedValue = Math.min(Math.max(newValue, this.#min), this.#max);
    this.#value = constrainedValue;
    
    // Update DOM elements without triggering callbacks
    this.#suppressEvents = true;
    this.#valueSpan.textContent = constrainedValue;
    this.#input.value = constrainedValue;
    this.#suppressEvents = false;
  }

  /**
   * Gets the current slider value
   * @returns {number} The current value
   */
  getValue() {
    return this.#value;
  }

  /**
   * Adds an event listener to the slider input
   * @param {string} event - The event name (e.g., 'input', 'change')
   * @param {Function} callback - The callback function
   */
  addEventListener(event, callback) {
    this.#input.addEventListener(event, callback);
  }
}
