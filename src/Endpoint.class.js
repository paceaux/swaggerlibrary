import FormData from 'form-data';

import { HTTP_VERBS } from './constants';
// Node allows circular dependencies and it's necessary because a service is a collection of endpoints
// eslint-disable-next-line import/no-cycle
import Service from './Api.service';

class Endpoint {
    static verbs = HTTP_VERBS;

    /**
     * The service that can be used for making requests
     *
     * @type {Service}
     * @public
     */
    service = new Service();

    /**
     * data that Swagger has about endpoint
     *
     * @type {object}
     * @public
     */
    endpointData = {};

    /**
     * relative raw path based on Swagger data
     *
     * @type {string}
     * @public
     */
    path = '';

    /**
     * a part of the endpoint path that is considered a namespace (and removed from method names)
     *
     * @type {string}
     * @public
     */
    pathNamespace = 'rest';

    // endpointActions = new Map();

    /**
     * Should the endpoint action names be longer than just <verb><firstPath><lastPath>
     *
     * @type {boolean|number}
     * @public
     */
    isGeneratingLongMethodName = false;

    /**
     * generates a name for the method based on the action and path
     *
     * @param  {string} action get, post, put, delete,etc
     * @param  {string} path 'rest/regional/{region}/enmiProgram'
     * @param {string} [namespace='rest'] A namespace to strip
     * @param {boolean|number} [longName=false] generate a longer name to avoid collisions
     * @returns {string} 'getRegionalEnmiProgram'
     */
    static getMethodName(action, path, namespace = 'rest', longName = false) {
      const deparameterize = (string) => string.replace(/({|})/g, '');

      const pathParts = path.split('/').filter((el) => el);
      const finalPath = deparameterize(pathParts[pathParts.length - 1]);
      const namespaceIndex = pathParts.indexOf(namespace);
      const firstPath = deparameterize(pathParts[namespaceIndex + 1]);
      const methodStart = action.toLowerCase();

      const uppercase = (string) => {
        const sanitizedString = deparameterize(string);
        const firstLetter = sanitizedString.charAt(0).toUpperCase();
        const lowerString = sanitizedString.slice(1);
        return `${firstLetter}${lowerString}`;
      };
      const methodMiddle = uppercase(firstPath);

      // in the case tht the word get,put,update,delete appears in the method name, remove it
      const nonRedundantFinalPath = finalPath.indexOf(methodStart) === 0
        ? finalPath.substring(methodStart.length)
        : finalPath;
      let methodEnd = finalPath !== firstPath ? uppercase(nonRedundantFinalPath) : '';

      if (longName) {
        const startElongatingAt = ((pathParts.length - 1) - longName);

        const elongatedName = pathParts
          .slice(startElongatingAt, -1)
          .map(uppercase)
          .join('');

        methodEnd = `${elongatedName !== methodMiddle ? elongatedName : ''}${methodEnd}`;
      }

      return `${methodStart}${methodMiddle}${methodEnd}`;
    }

    /**
     * generates a fully valid endpoint path
     *
     * @param  {string} path /rest/regional/{region}/enmi
     * @param  {object} [parameters] an object with key value pairs
     * @returns {string} /regional/EMEA/enmi
     */
    static generateEndpointActionPath(path, parameters) {
      let computedPath = path.replace('/rest', '');

      if (parameters && Object.keys(parameters).length > 0) {
        Object.keys(parameters).forEach((parameterName) => {
          const value = parameters[parameterName];

          if (value) {
            computedPath = computedPath.replace(`{${parameterName}}`, value);
          }
        });
      }

      return computedPath;
    }

    /**
     * Gets a Map of a map containing the parameters allowed for each verb
     *
     * @param  {Set<string>|Array<string>} [actions=[]] an enumerable of allowed actions
     * @param  {object} endpointData swagger json
     * @returns {Map<'action', Map<'parameterName', object>>} A Map containing maps of the parameters allowed on each verb
     */
    static getActionParameterMap(actions = [], endpointData) {
      const actionParameters = new Map();

      actions.forEach((action) => {
        const parameterMap = new Map();
        const { parameters } = endpointData[action] ?? { };
        if (parameters && parameters.length > 0) {
          parameters.forEach((parameter) => {
            parameterMap.set(parameter.name, parameter);
            /*
              even a json body has a parameter name -- and it doesn't need one
              This normalizes the body so that a method can always use the name "body"
             */
            if (parameter?.in === 'body') {
              parameterMap.set('body', parameter);
              parameterMap.delete(parameter.name);
            }
          });
          actionParameters.set(action, parameterMap);
        }
      });
      return actionParameters;
    }

    /**
     * Takes a responses object and converts it to a map, adding an entry for ok responses
     *
     * @param  {object} [responses={}] data pulled from endpointData.get
     * @returns {Map<'', object>} map containing all server responses
     */
    static getResponseMap(responses = {}) {
      const responseMap = new Map();

      Object.entries(responses).forEach(([key, value]) => {
        responseMap.set(key, value);
        const responseCode = parseInt(key, 10);
        const isOk = responseCode >= 200 && responseCode < 300;

        if (isOk) {
          responseMap.set('ok', value);
        }
      });
      return responseMap;
    }

    /**
     * @param  {string} path relative url of the endpoint
     * @param  {object} endpointData data from the swagger api about this endpoint
     * @param {Service} service a service used to get the swagger data
     */
    constructor(path = '', endpointData = {}, service = new Service()) {
      this.path = path;
      this.pathNamespace = service.urlNamespace;
      this.endpointData = endpointData;
      this.service = service;
      this.actionParameters = Endpoint.getActionParameterMap(this.actions, this.endpointData);

      this.actions.forEach((action) => {
        const { methodName, endpointAction } = this.generateEndpointAction(action);

        this[action] = endpointAction;
        this[methodName] = this[action];
      });
    }

    /**
     * A unique list of the allowed actions (verbs) for the endpoint
     *
     * @type {Set<string>}
     */
    get actions() {
      const actions = new Set();

      const keysFromEndpointData = Object.keys(this.endpointData);

      keysFromEndpointData.forEach((key) => {
        if (Endpoint.verbs.has(key)) {
          actions.add(key);
        }
      });
      return actions;
    }

    /**
     * all of the actions available on an endpoint
     *
     * @type {Map<string, endpointAction>}
     * @public
     */
    get endpointActions() {
      const endpointActions = new Map();

      this.actions.forEach((action) => {
        const { parameters } = this.endpointData[action];
        const { methodName, endpointAction } = this.generateEndpointAction(action, parameters);

        endpointActions.set(methodName, endpointAction);
      });
      return endpointActions;
    }

    /**
     * @typedef EndpointActionParameters
     * @property {object} queryParameters parameters to use in a query
     * @property {FormData} formData data created as formData
     * @property {object} bodyData data that should be submited as the body of the request
     */
    /**
     * Generates the data that can be used in an endpointAction
     *
     * @param  {object} providedParameters param
     * @param  {string} providedAction the action (verb) that the parameters apply to
     * @returns {EndpointActionParameters} the parameters to use in the endpointAction
     */
    getEndpointActionParameters(providedParameters, providedAction) {
      const query = {};
      const formData = new FormData();
      let bodyData = null;
      Object.entries(providedParameters).forEach(([providedParameterName, paramValue]) => {
        const parameterAttributes = this.actionParameters.get(providedAction).get(providedParameterName);
        const isEnum = Object.keys(parameterAttributes).includes('enum');
        const isQuery = parameterAttributes.in && parameterAttributes.in === 'query';
        const isFormData = parameterAttributes.in && parameterAttributes.in === 'formData';
        const isBodyData = parameterAttributes.in && parameterAttributes.in === 'body';
        if (isEnum) {
          const allowedValues = parameterAttributes.enum.map((val) => val.toLowerCase());

          if (!allowedValues.includes(paramValue.toLowerCase())) {
            throw new Error(`${allowedValues} are the only permitted values for ${providedParameterName}.`);
          }
        }

        if (isFormData) {
          formData.append(providedParameterName, paramValue);
        }

        if (isBodyData) {
          bodyData = paramValue;
        }

        if (isQuery) {
          query[providedParameterName] = paramValue;
        }
      });

      return {
        params: query,
        formData,
        bodyData,
      };
    }

    /**
     * @typedef GeneratedEndpointAction
     * @property {string} methodName name that can be used to access the method
     * @property {Function} endpointAction an async function that calls the endpoint for the given action
     */
    /**
     * The special sauce. Generates a method that runs on a URL
     *
     * @param  {string} action name of the action: get, put, delete, etc
     * @returns {GeneratedEndpointAction} Object with the name of the generated endpoint and function
     */
    generateEndpointAction(action) {
      const methodName = Endpoint.getMethodName(action, this.path, this.pathNamespace, this.isGeneratingLongMethodName);
      const responseMap = Endpoint.getResponseMap(this.endpointData[action].responses);

      const endpointAction = async function endpointAction(parameters = {}) {
        let requestPath = Endpoint.generateEndpointActionPath(this.path);
        let result = null;
        let bodyData = parameters.body ? parameters.body : parameters;
        const actionHasParameters = this.actionParameters.has(action);
        const validParameterNames = actionHasParameters
          ? [...this.actionParameters.get(action).keys()]
          : [];
        const providedParameterNames = Object.keys(parameters);
        const requiresBodyParameters = actionHasParameters
          && this.actionParameters.get(action).has('body');

        const hasValidParameterNames = actionHasParameters
          && validParameterNames
            .every((validParameterName) => providedParameterNames.includes(validParameterName));

        if (actionHasParameters && providedParameterNames.length === 0) {
          throw new Error(`This action requires the parameters ${validParameterNames}`);
        }

        if (actionHasParameters && !hasValidParameterNames && !requiresBodyParameters) {
          throw new Error(`The parameter names ${providedParameterNames} are not valid for this action.`);
        }

        if (actionHasParameters && !hasValidParameterNames && requiresBodyParameters) {
          throw new Error(`This action requires a body parameter, only ${providedParameterNames} were given.`);
        }

        if (hasValidParameterNames) {
          requestPath = Endpoint.generateEndpointActionPath(requestPath, parameters);
          /*
          this is an assumption based on current state where the swaggers don't show
          that anything taking data in the body also uses a query
          */
          if (!requiresBodyParameters) {
            bodyData = this.getEndpointActionParameters(parameters, action);
          }
        }

        const okResponse = responseMap.get('ok');
        const { description } = okResponse;
        const hasStreamAsResponse = description.toLowerCase().includes('filestream');

        if (hasStreamAsResponse) {
          bodyData.responseType = 'blob';
        }
        try {
          const { data } = await this.service.axios[action](
            requestPath,
            { ...bodyData },
          );
          result = data;
        } catch (error) {
          result = { error, requestPath, bodyData };
          throw (result);
        }
        return result;
      };

      // leave responses as property on method for inspection
      endpointAction.responses = responseMap;

      return {
        methodName,
        endpointAction,
      };
    }
}

export default Endpoint;
