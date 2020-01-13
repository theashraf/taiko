const ElementWrapper = require('./elementWrapper');
const FileFieldWrapper = require('./fileFieldWrapper');
const RadioButtonWrapper = require('./radioButtonWrapper');
const TextBoxWrapper = require('./textBoxWrapper');
const CheckBoxWrapper = require('./checkBoxWrapper');
const DropDownWrapper = require('./dropDownWrapper');

const { xpath, isString } = require('../helper');
const {
  RelativeSearchElement,
  handleRelativeSearch,
} = require('../proximityElementSearch');
const { $$xpath, getIfExists } = require('../elementSearch');
const { descEvent, isSelector, isElement } = require('../helper');

function hasProximitySelectors(values) {
  return values.selector.args.length > 0;
}

const prepareParameters = (attrValuePairs, options, ...args) => {
  if (options instanceof RelativeSearchElement) {
    args = [options].concat(args);
    options = {};
  }
  let values = {
    selector: { attrValuePairs: attrValuePairs, args: args },
  };
  if (attrValuePairs instanceof RelativeSearchElement) {
    args = [attrValuePairs].concat(args);
    values.selector = { args: args };
  } else if (
    isString(attrValuePairs) ||
    isSelector(attrValuePairs) ||
    isElement(attrValuePairs)
  ) {
    values.selector = { label: attrValuePairs, args: args };
  }
  values.options = options || {};
  if (
    values.options.selectHiddenElement &&
    hasProximitySelectors(values)
  ) {
    console.warn(
      'WARNING: Proximity of hidden element are not available hence proximity selector will be ignored',
    );
  }
  return values;
};

const getQuery = (attrValuePairs, tag = '') => {
  let path = tag;
  for (const key in attrValuePairs) {
    if (key === 'class') {
      path += `[contains(@${key}, ${xpath(attrValuePairs[key])})]`;
    } else {
      path += `[@${key} = ${xpath(attrValuePairs[key])}]`;
    }
  }
  return path;
};

const getElementGetter = (
  selector,
  query,
  tags,
  selectHiddenElement,
) => {
  let get;
  if (selector.attrValuePairs) {
    let query = tags
      .split('|')
      .map(tag => getQuery(selector.attrValuePairs, tag))
      .join('|');
    get = async () =>
      await handleRelativeSearch(
        await $$xpath(query, selectHiddenElement),
        selector.args,
      );
  } else if (selector.label) {
    get = async () =>
      await handleRelativeSearch(await query(), selector.args);
  } else {
    get = async () =>
      await handleRelativeSearch(
        await $$xpath(tags, selectHiddenElement),
        selector.args,
      );
  }
  return get;
};

const desc = (selector, query, tag) => {
  let description = '';
  if (selector.attrValuePairs) {
    description = getQuery(selector.attrValuePairs, tag);
  } else if (selector.label) {
    description = `${tag} with ${query} ${selector.label} `;
  }

  for (const arg of selector.args) {
    description += description === '' ? tag : ' and';
    description += ' ' + arg.toString();
  }

  return description;
};

const createElementWrapper = (get, description, elementType) => {
  let elementWrapper;
  switch (elementType) {
    case 'fileField':
      elementWrapper = FileFieldWrapper;
      break;
    case 'textBox':
      elementWrapper = TextBoxWrapper;
      break;
    case 'radioButton':
      elementWrapper = RadioButtonWrapper;
      break;
    case 'checkBox':
      elementWrapper = CheckBoxWrapper;
      break;
    case 'dropDown':
      elementWrapper = DropDownWrapper;
      break;
    default:
      elementWrapper = ElementWrapper;
  }
  return new elementWrapper(get, description, descEvent, getIfExists);
};

module.exports = {
  prepareParameters,
  getElementGetter,
  desc,
  createElementWrapper,
};
