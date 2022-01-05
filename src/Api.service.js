import Axios from 'axios';
import {
  API_HOST,
  BASE_PATH,
  API_SCHEME,
  HTTP_VERBS,
} from './constants';
// Node allows circular dependencies and it's necessary because an endpoint uses a service
// eslint-disable-next-line import/no-cycle
import Endpoint from './Endpoint.class';

/**
 * @typedef {"http" | "https"} ApiScheme the protocol to use for the api
 */
class Service {
  /**
   * @type {string}
   * @static
   */
  static basePath = BASE_PATH;

  /**
   * Generates the base url that the service uses
   *
   * @param  {string} [apiHost=API_HOST] the host for the api
   * @param {ApiScheme} apiScheme http or https
   * @param  {string} [basePath=basePath] a path on top of the host for the api
   * @returns {URL} a url object.
   */
  static getBaseUrl(apiHost = API_HOST, apiScheme = API_SCHEME, basePath = Service.basePath) {
    return new URL(basePath, `${apiScheme}://${apiHost}`);
  }

  /**
   * Generates an instance of axios specific to the url
   *
   * @param  {string} [baseURL=''] the base url for the api (host + extra paths)
   * @param  {Axios} [axiosClass=Axios] The axios library
   * @returns {Axios} an instance of Axios
   */
  static getAxiosInstance(baseURL = '', axiosClass = Axios) {
    return axiosClass.create({
      baseURL,
      headers: {
      },
    });
  }

  /**
   * @param  {Axios} axiosInstance an instance of Axios with a baseURL added
   * @param  {string} swaggerPath basePath for the location of swagger data
   * @returns {Promise<object>} data returned from the swagger api
   */
  static async getApiInfo(axiosInstance, swaggerPath = '/Tools') {
    let results = null;
    if (!axiosInstance) {
      throw new Error('An instance of Axios was not provided');
    }
    try {
      const response = await axiosInstance.get(`${swaggerPath}/swagger.json`);
      const { data } = response;
      results = data;
    } catch (getError) {
      results = getError;
    }
    return results;
  }

  /**
   * evaluates the last part of each relative url in an array and reports the index of that item if it is a duplicate
   * This is a component of method name collision detection
   *
   * @param  {Array<string>} arrayOfPaths and array of relative URLs
   * @returns {Array<number>} an array of integers indicating the position of an
   */
  static getIndexesOfPathsWithIdenticalEndings(arrayOfPaths) {
    const lastPathDups = new Set();

    arrayOfPaths.forEach((item, index) => {
      const pathparts = item.split('/').filter((el) => el);
      const lastPath = pathparts[pathparts.length - 1];

      const dupIndex = arrayOfPaths.findIndex((item2) => {
        const parts = item2.split('/').filter((el) => el);
        const lastPart = parts[parts.length - 1];
        return lastPart === lastPath;
      });
      if (dupIndex !== -1 && dupIndex !== index) {
        lastPathDups.add(index);
        lastPathDups.add(dupIndex);
      }
    });
    return [...lastPathDups];
  }

  /**
   * Evaluates an array of paths, starting at the end, and determines the index of the first unique part of the path
   *
   * @param  {Array<string>} arrayOfPaths and array of relative URLs
   * @returns {number} the last index of a part of a path that is unique in a set
   */
  static getIndexOfLastUniquePathInPaths(arrayOfPaths) {
    // sort the paths so the biggest is first
    const sortedPaths = [...arrayOfPaths]
      .sort((path1, path2) => {
        const pathParts1 = path1.split('/').filter((el) => el);
        const pathParts2 = path2.split('/').filter((el) => el);
        let sortPos = 0;
        if (pathParts1.length > pathParts2.length) sortPos = -1;
        if (pathParts1.length < pathParts2.length) sortPos = 1;
        return sortPos;
      });
    let pathsToEvaluate = [...sortedPaths];
    // get the index of each item in the array with an identical ending
    let indices = Service.getIndexesOfPathsWithIdenticalEndings(arrayOfPaths);
    // get the last index of the largest path
    let lastUniqueIndex = pathsToEvaluate[0]
      .split('/')
      .filter((el) => el)
      .length - 1;
    // start at the end, and keep going so long as we get indexes showing that there are duplicates
    while (indices.length > 0) {
      // remove the last path at each iteration
      pathsToEvaluate = pathsToEvaluate
        .map((pathToEvaluate) => pathToEvaluate
          .split('/')
          .slice(0, -1)
          .join('/'));
      indices = Service.getIndexesOfPathsWithIdenticalEndings(pathsToEvaluate);
      lastUniqueIndex -= 1;
    }

    return lastUniqueIndex;
  }
  /**
   * The internal version of the swaggerpath
   *
   * @type {string}
   * @private
   */

  #swaggerPath = '';

  /**
   * Version of the API the library is using. only populated after init()
   *
   * @type {string}
   * @public
   */
    apiVersion = '';

    /**
     * Title of the API. Only populated after .init()
     *
     * @type {string}
     * @public
     */
    title = '';

    /**
     * Endpoints for the service
     *
     * @type {Array<Endpoint>}
     * @public
     */
    endpoints = [];

    /**
     * @param  {string} [apiHost=API_HOST] the host domain for the api. This will vary based on environment
     * @param  {string} [swaggerPath='/Tools'] a path for a specific set of swagger data
     * @param {string} [urlNamespace='rest'] a part of the urls that acts as a "namespace"
     * @param {ApiScheme} [apiScheme='https'] http or https
     * @param  {object} [dependencies={Axios}] an object containing all dependencies, including Axios
     */
    constructor(
      apiHost = API_HOST,
      swaggerPath = '/Tools',
      urlNamespace = 'rest',
      apiScheme = API_SCHEME,
      dependencies = { Axios },
    ) {
      /**
       * The host and port
       *
       * @type {string}
       * @public
       */
      this.apiHost = apiHost;
      /**
       * Default is HTTPS, but maybe dev environment isn't
       *
       * @type {ApiScheme}
       * @public
       */
      this.apiScheme = apiScheme;

      /**
       * The base path
       *
       * @type {string}
       * @public
       */
      this.basePath = Service.BASE_PATH;
      /**
       * The baseUrl for the service
       *
       * @type {URL}
       * @public
       */
      this.baseURL = Service.getBaseUrl(this.apiHost, this.apiScheme, this.basePath);

      /**
       * @type {string}
       * @public
       */
      this.#swaggerPath = swaggerPath.indexOf('/') !== 0
        ? `/${swaggerPath}`
        : swaggerPath;

      /**
       * @type {string}
       * @public
       */
      this.urlNamespace = urlNamespace;

      /**
       * @type {object}
       * @public
       */
      this.dependencies = dependencies;

      /**
       * the axios instance injected into the service
       *
       * @type {Axios}
       * @public
       */
      this.axios = Service.getAxiosInstance(this.baseHref, dependencies.Axios);
    }

    /**
     * The fully qualified URL for the API
     *
     * @type {string}
     */
    get baseHref() {
      let href = '';

      if (this.baseURL.href) {
        href = this.baseURL.href;
      }

      return href;
    }

    /**
     * the path to the swagger instance
     *
     * @type {string}
     */
    get swaggerPath() {
      const swaggerPath = this.#swaggerPath;

      return swaggerPath.indexOf('/') !== 0
        ? `/${swaggerPath}`
        : swaggerPath;
    }

    get methods() {
      const { endpoints } = this;
      const methods = new Map();
      endpoints.forEach((endpoint) => {
        endpoint.endpointActions.forEach((action, actionName) => {
          methods.set(actionName, action.bind(endpoint));
        });
      });
      return methods;
    }

    get endpointPaths() {
      return this
        .endpoints
        .map((endpoint) => endpoint.path);
    }

    /**
     * An override for setting scheme, host, and path at once as either a valid URL or a string
     *
     * @param  {URL|string} urlOrHost a URL object or a string that's the hostname
     * @param  {string} [basePath=this.basePath] a basePath (usually /rest)
     * @param  {ApiScheme} [scheme=this.apiScheme] http or https
     */
    setBaseUrl(urlOrHost, basePath = this.basePath, scheme = this.apiScheme) {
      try {
        this.baseURL = new URL(urlOrHost);
      } catch {
        this.baseURL = Service.getBaseUrl(urlOrHost, scheme, basePath);
      }
      this.apiScheme = this.baseURL.protocol.replace(':', '');
      this.apiHost = this.baseURL.host;
      this.basePath = this.baseURL.pathname.replace(/\//g, '');
      this.axios = Service.getAxiosInstance(this.baseHref, this.dependencies.Axios);
    }

    /**
     * @param {Axios} [axios=this.axios] an instance of Axios
     * @param {string} [swaggerPath=this.swaggerPath] The basePath of swagger.json
     * @returns {Promise<object>} all of the swagger.json info for the service instance
     */
    async getApiInfo(axios = this.axios, swaggerPath = this.swaggerPath) {
      let apiInfo = null;
      try {
        apiInfo = Service.getApiInfo(axios, swaggerPath);
      } catch (getInfoError) {
        apiInfo = getInfoError;
      }
      return apiInfo;
    }

    /**
     * @param  {string|Endpoint} pathOrEndpointObj relative path on the api
     * @param  {object|boolean} endpointDataOrCollisions endpoint data with at least one property which is an HTTP_VERB
     * @param {boolean|number} [collisions=false] whether to account for collisions, and if so, how many
     * @returns {Endpoint} the endpoint that was generated from the data
     */
    #setEndpoint(pathOrEndpointObj, endpointDataOrCollisions, collisions = false) {
      const hasPathString = typeof (pathOrEndpointObj) === 'string';
      const hasEndpointObj = pathOrEndpointObj.constructor.name === 'Endpoint';
      const hasDataObject = typeof (endpointDataOrCollisions) === 'object';
      const endpointCollisions = typeof (endpointDataOrCollisions) === 'boolean' || typeof (endpointDataOrCollisions) === 'number'
        ? endpointDataOrCollisions
        : collisions;

      const shouldGenerateEndpoint = hasPathString && hasDataObject;

      // endpoint is either null, or theobject provided
      let endpoint = hasEndpointObj ?? pathOrEndpointObj;
      // endpoint path comes either from the object provided, or the string
      const endpointPath = hasEndpointObj
        ? endpoint.path
        : pathOrEndpointObj;

      if (shouldGenerateEndpoint) {
        const endpointKeys = Object.keys(endpointDataOrCollisions);
        const dataHasValidVerb = endpointKeys.some((key) => HTTP_VERBS.has(key));
        if (!dataHasValidVerb) throw new Error(`Endpoint data does not have allowed verbs like ${HTTP_VERBS.join(',')}`);
        endpoint = new Endpoint(endpointPath, endpointDataOrCollisions, this);
      }

      if (endpoint) { // we either are using and endpoint, or created one
        endpoint.isGeneratingLongMethodName = endpointCollisions;
        if (this.endpointPaths.includes(endpointPath)) {
          // the endpoint is already on the service
          const existingEndpointIndex = this.endpointPaths.indexOf(endpointPath);
          this.endpointPaths[existingEndpointIndex] = endpoint;
        } else {
          // endpoint doesn't exist on the service
          // first, get endpoint's method Names
          const endpointMethodNames = [...endpoint.endpointActions.keys()];
          // next, find out if the service already has them
          const hasDuplicateEndpointMethodNames = endpointMethodNames
            .some((endpointMethodName) => this.methods.has(endpointMethodName));

          if (!hasDuplicateEndpointMethodNames) {
            // endpoint is new, method names were new
            this.endpoints.push(endpoint);
          }
        }
      }
      return endpoint;
    }

    /**
     * @param  {string|Endpoint} pathOrEndpointObj relative path on the api
     * @param  {object|boolean} endpointDataOrCollisions endpoint data with at least one property which is an HTTP_VERB
     * @param {boolean|number} [collisions=false] whether to account for collisions, and if so, how many
     * @returns {Endpoint} the endpoint that was generated from the data
     */
    setEndpoint(pathOrEndpointObj, endpointDataOrCollisions, collisions = false) {
      const hasEndpointObj = pathOrEndpointObj.constructor.name === 'Endpoint';
      const hasDataObject = typeof (endpointDataOrCollisions) === 'object';
      const endpointCollisions = typeof (endpointDataOrCollisions) === 'boolean' || typeof (endpointDataOrCollisions) === 'number'
        ? endpointDataOrCollisions
        : collisions;
      let calculatedCollisions = endpointCollisions;

      let endpoint = hasEndpointObj ?? pathOrEndpointObj;
      const endpointPath = hasEndpointObj
        ? endpoint.path
        : pathOrEndpointObj;

      if (!calculatedCollisions) {
        // merge the new endpoint path w/ existing
        const newEndpointPaths = [...this.endpointPaths, endpointPath];
        // get an array of any w/ duplicate endings
        const identicalEndingIndices = Service.getIndexesOfPathsWithIdenticalEndings(newEndpointPaths);

        // check and see if there's identical paths
        if (identicalEndingIndices.length > 0) {
          // whittle down the list of paths to just the ones with identical path endings
          const pathsWithCollisions = [...newEndpointPaths].filter((el, index) => identicalEndingIndices.includes(index));
          // now find out what it takes to make them unique
          const indexOfLastUniquePath = Service.getIndexOfLastUniquePathInPaths(pathsWithCollisions);
          const endpointPathParts = endpointPath.split('/').filter((el) => el);
          calculatedCollisions = endpointPathParts.length - 1 - indexOfLastUniquePath;

          // now reduce the list of paths to ones OTHER than the latest
          const oldPathsWithCollisions = pathsWithCollisions
            .filter((p) => p !== endpointPath);
          // now get the endpoint objects based on their paths
          const oldEndpointsWithCollisions = this.endpoints
            .filter((oldEndpoint) => oldPathsWithCollisions.includes(oldEndpoint.path));
          // loop over those paths and set a collision level for them
          oldEndpointsWithCollisions.forEach((oldEndpoint) => {
            const collisionSize = calculatedCollisions;
            // shadup ESLint. I'm not passing this through a complex function for one thing
            // eslint-disable-next-line no-param-reassign
            oldEndpoint.isGeneratingLongMethodName = collisionSize;
          });
        }
      }
      const endpointArg1 = pathOrEndpointObj;
      const endpointArg2 = hasDataObject ? endpointDataOrCollisions : calculatedCollisions;
      const endpointArg3 = hasDataObject ? calculatedCollisions : false;

      endpoint = this.#setEndpoint(endpointArg1, endpointArg2, endpointArg3);
      return endpoint;
    }

    /**
     * @param {string} swaggerPath the path for the swagger
     * @param {Axios} axios an instance of axios
     * @param {string} urlNamespace the part of the path that is a namespace
     * @returns {Promise<void>} adds the swagger.json info to the service instance
     */
    async init(swaggerPath = this.#swaggerPath, axios = this.axios, urlNamespace = this.urlNamespace) {
      if (swaggerPath !== this.#swaggerPath) this.#swaggerPath = swaggerPath;

      this.urlNamespace = urlNamespace;

      try {
        const apiData = await this.getApiInfo(axios, swaggerPath);

        if (apiData.info) {
          this.apiVersion = apiData.info.version;
          this.title = apiData.info.title;
        }

        if (Object.keys(apiData.paths).length > 0) {
          const apiPaths = Object.entries(apiData.paths);
          const identicalEndingIndices = Service.getIndexesOfPathsWithIdenticalEndings(Object.keys(apiData.paths));

          apiPaths
            .forEach(([pathName, pathData], index) => {
              let collisions = false;
              if (identicalEndingIndices.includes(index)) {
                collisions = true;
              }
              this.#setEndpoint(pathName, pathData, collisions);
            });
        }
        return this;
      } catch (initErr) {
        return initErr;
      }
    }
}

export default Service;
