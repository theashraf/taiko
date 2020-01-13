/**
 * Copyright 2018 Thoughtworks Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * This module is imported from Puppeteer(https://github.com/GoogleChrome/puppeteer)
 * Few modifications are done on the file.
 */

const fs = require('fs');
const path = require('path');
let projectRoot = null;
const timeouts = [];
const EventEmitter = require('events');
const descEvent = new EventEmitter();
const { Element } = require('./element');
const { ElementWrapper } = require('./elementWrapper');

class Helper {
  /**
   * @return {string}
   */
  static projectRoot() {
    if (!projectRoot) {
      projectRoot = fs.existsSync(
        path.join(__dirname, '..', 'package.json'),
      )
        ? path.join(__dirname, '..')
        : path.join(__dirname, '..', '..');
    }
    return projectRoot;
  }

  static addEventListener(emitter, eventName, handler) {
    emitter.on(eventName, handler);
    return { emitter, eventName, handler };
  }

  static removeEventListeners(listeners) {
    for (const listener of listeners) {
      listener.emitter.removeListener(
        listener.eventName,
        listener.handler,
      );
    }
    listeners.splice(0, listeners.length);
  }

  static promisify(nodeFunction) {
    function promisified(...args) {
      return new Promise((resolve, reject) => {
        function callback(err, ...result) {
          if (err) {
            return reject(err);
          }
          if (result.length === 1) {
            return resolve(result[0]);
          }
          return resolve(result);
        }
        nodeFunction.call(null, ...args, callback);
      });
    }
    return promisified;
  }
}

/**
 * @param {*} value
 * @param {string=} message
 */
function assert(value, message) {
  if (!value) {
    throw new Error(message);
  }
}

const assertType = (
  obj,
  condition = isString,
  message = 'String parameter expected',
) => {
  if (!condition(obj)) {
    throw new Error(message);
  }
};

const isFunction = functionToCheck => {
  return typeof functionToCheck === 'function';
};

const isString = obj =>
  typeof obj === 'string' || obj instanceof String;

const isObject = obj =>
  typeof obj === 'object' || obj instanceof Object;

const isStrictObject = obj =>
  obj &&
  typeof obj === 'object' &&
  (obj.constructor === Object || obj.constructor.name === 'Object');

function wait(time) {
  var promise = new Promise(resolve =>
    setTimeout(() => {
      resolve();
    }, time),
  );
  return promise;
}

const commandlineArgs = () => {
  const args = {};
  process.argv.slice(2, process.argv.length).forEach(arg => {
    if (arg.slice(0, 2) === '--') {
      const longArg = arg.split('=');
      args[longArg[0].slice(2, longArg[0].length)] = longArg[1];
    }
  });
  return args;
};

const sleep = milliseconds => {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if (new Date().getTime() - start > milliseconds) {
      break;
    }
  }
};

const waitUntil = async (condition, retryInterval, retryTimeout) => {
  if (!retryTimeout) {
    return;
  }
  var start = new Date().getTime();
  while (true) {
    try {
      if (await condition()) {
        break;
      }
    } catch (e) {}
    if (new Date().getTime() - start > retryTimeout) {
      throw new Error(
        `waiting failed: retryTimeout ${retryTimeout}ms exceeded`,
      );
    }
    sleep(retryInterval);
  }
};

const waitForNavigation = (timeout, promises = []) => {
  return new Promise((resolve, reject) => {
    Promise.all(promises)
      .then(resolve)
      .catch(reject);
    const timeoutId = setTimeout(() => reject('Timedout'), timeout);
    timeouts.push(timeoutId);
  });
};

const xpath = s =>
  `concat(${s
    .match(/[^'"]+|['"]/g)
    .map(part => {
      if (part === "'") {
        return '"\'"';
      }
      if (part === '"') {
        return "'\"'";
      }
      return "'" + part + "'";
    })
    .join(',') + ', ""'})`;

const handleUrlRedirection = url => {
  if (url.substr(-1) === '/') {
    url = url.substring(0, url.length - 1);
  }
  if (url.includes('www.')) {
    url = url.replace('www.', '');
  }
  return url;
};

const isSelector = obj =>
  (obj &&
    Object.prototype.hasOwnProperty.call(obj, 'elements') &&
    Object.prototype.hasOwnProperty.call(obj, 'exists')) ||
  obj instanceof ElementWrapper;

const isElement = obj => obj && obj instanceof Element;

module.exports = {
  helper: Helper,
  assert,
  isFunction,
  isString,
  isObject,
  isStrictObject,
  wait,
  commandlineArgs,
  waitForNavigation,
  xpath,
  timeouts,
  waitUntil,
  handleUrlRedirection,
  assertType,
  descEvent,
  isSelector,
  isElement,
};
