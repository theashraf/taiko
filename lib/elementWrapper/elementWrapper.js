const { firstElement } = require('./helper');

const { descEvent } = require('../eventBus');
let _getIfExists;
class ElementWrapper {
  constructor(get, description, getIfExists) {
    this._get = get;
    this._description = description;
    _getIfExists = getIfExists;
  }

  async get(retryInterval, retryTimeout) {
    console.warn('DEPRECATED use .elements()');
    return this.elements(retryInterval, retryTimeout);
  }

  get description() {
    return this._description;
  }

  async exists(retryInterval, retryTimeout) {
    try {
      await firstElement.apply(this, retryInterval, retryTimeout);
    } catch (e) {
      descEvent.emit('success', 'Does not exists');
      return false;
    }
    descEvent.emit('success', 'Exists');
    return true;
  }

  async text() {
    const elem = await firstElement.apply(this);
    return await elem.text();
  }

  async isVisible(retryInterval, retryTimeout) {
    const elem = await firstElement.apply(
      this,
      retryInterval,
      retryTimeout,
    );
    if (await elem.isVisible()) {
      descEvent.emit('success', 'Element is Visible');
      return true;
    }
    return false;
  }

  async elements(retryInterval, retryTimeout) {
    return await _getIfExists(this._get, this._description)(
      null,
      retryInterval,
      retryTimeout,
    );
  }
}

module.exports = ElementWrapper;
