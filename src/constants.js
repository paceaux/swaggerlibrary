/**
 * @constant
 * @type {string}
 */
const API_HOST = 'localhost:5000';

/**
 * @constant
 * @type {string}
 */
const BASE_PATH = 'rest';

/**
 * @constant
 * @type {string}
 */
const API_SCHEME = 'http';

/**
 * @constant
 * @enum {string}
 */
const HTTP_VERBS = new Set([
  'get',
  'head',
  'post',
  'put',
  'delete',
  'connect',
  'options',
  'trace',
  'patch',
]);

export {
  API_HOST,
  API_SCHEME,
  BASE_PATH,
  HTTP_VERBS,
};
