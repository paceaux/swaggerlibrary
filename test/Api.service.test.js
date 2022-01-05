import Axios from 'axios';

import Service from '../src/Api.service';
import Endpoint from '../src/Endpoint.class';
import { API_HOST } from '../src/constants';

import { getUserEndpointData, externalLMAEndpoint, getRegionArticleListEndpoint } from './endpointData';

describe('ApiService', () => {
  describe('static members', () => {
    describe('baseurl', () => {
      it('returns a URL object', () => {
        const url = Service.getBaseUrl();

        expect(url).toBeInstanceOf(URL);
      });
      it('returns the local/dev url by default ', () => {
        const url = Service.getBaseUrl();

        expect(url.href).toBe(`http://${API_HOST}/rest`);
      });
      it('can return a different host if sent one ', () => {
        const url = Service.getBaseUrl('api.place.com');

        expect(url.href).toBe('http://api.place.com/rest');
      });
    });
    describe('axiosInstance', () => {
      it('generates an axios instance', () => {
        const axiosInstance = Service.getAxiosInstance();

        expect(axiosInstance).toBeInstanceOf(Function);
      });
      it('can have an empty url', () => {
        const axiosInstance = Service.getAxiosInstance();

        expect(axiosInstance.defaults.baseURL).toBe('');
      });
      it('has a baseUrl if we give it', () => {
        const axiosInstance = Service.getAxiosInstance('http://foo.bar');

        expect(axiosInstance.defaults.baseURL).toBe('http://foo.bar');
      });
    });
    describe('getApiInfo', () => {
      it('gets the swagger info', async () => {
        const baseUrl = Service.getBaseUrl(API_HOST);
        const axios = Service.getAxiosInstance(baseUrl.href, Axios);
        const data = await Service.getApiInfo(axios);
        expect(data).toHaveProperty('swagger', '2.0');
      });
    });
    describe('collision detection', () => {
      it('gets indexes of paths w/ identical endings', () => {
        const paths = [
          '/rest/external/facility/create',
          '/rest/external/provider/create',
          '/rest/external/localMarketArea/create',
          'rest/external/{region}/article/{locationType}/list',
        ];
        const indexesWSameEndings = Service.getIndexesOfPathsWithIdenticalEndings(paths);

        expect(indexesWSameEndings).toEqual(expect.arrayContaining([0, 1, 2]));
      });
      it('gets indexes of paths w/ identical endings', () => {
        const paths = [
          '/rest/external/facility/create',
          '/rest/external/provider/create',
          '/rest/external/localMarketArea/create',
          'rest/external/{region}/article/{locationType}/list',
          'rest/external/{region}/faq/{locationType}/list',
          'rest/external/{region}/form/{locationType}/list',
          'rest/external/provider/terminate',
        ];
        const indexesWSameEndings = Service.getIndexesOfPathsWithIdenticalEndings(paths);

        expect(indexesWSameEndings).toEqual(expect.arrayContaining([0, 1, 2, 3, 4, 5]));
      });
      it('will look and paths and calculate how far to offset in order to get unique names', () => {
        const paths = [
          'rest/external/{region}/article/{locationType}/list',
          'rest/external/{region}/faq/{locationType}/list',
          'rest/external/{region}/form/{locationType}/list',
        ];
        const lastUniquePathIndex = Service.getIndexOfLastUniquePathInPaths(paths);

        expect(lastUniquePathIndex).toEqual(3);
      });
      it('will look and paths and calculate how far to offset in order to get unique names', () => {
        const paths = [
          '/rest/external/facility/create',
          '/rest/external/provider/create',
          '/rest/external/localMarketArea/create',
        ];
        const lastUniquePathIndex = Service.getIndexOfLastUniquePathInPaths(paths);

        expect(lastUniquePathIndex).toEqual(2);
      });
      it('will look at paths of different path sizes and give the offset for the largest', () => {
        const paths = [
          '/rest/common/{region}/facilities/{facility}/getDisplayData',
          '/rest/common/{region}/facilities/{facility}/subdepartments/{subDepartment}/getDisplayData',
        ];
        const lastUniquePathIndex = Service.getIndexOfLastUniquePathInPaths(paths);

        expect(lastUniquePathIndex).toEqual(6);
      });
    });
  });
  describe('constructor', () => {
    it('will have a baseUrl that matches current test environment', () => {
      const myApi = new Service();

      expect(myApi.baseURL.href).toBe(`http://${API_HOST}/rest`);
    });
    it('the https scheme can be set', () => {
      const myApi = new Service('foo', '/tools', 'rest', 'https');
      myApi.apiScheme = 'https';

      expect(myApi.baseURL.href).toBe(`https://foo/rest`);
    });
    it('will have an axios instance that matches current test environment', () => {
      const myApi = new Service();

      expect(myApi.axios.defaults.baseURL).toBe(`http://${API_HOST}/rest`);
    });
    it('will have a default swaggerPath', () => {
      const myApi = new Service();

      expect(myApi).toHaveProperty('swaggerPath', '/tools');
    });
    it('can be sent a custom swagger path', () => {
      const myApi = new Service(API_HOST, '/access');

      expect(myApi).toHaveProperty('swaggerPath', '/access');
    });
    it('prepends a / if it isn\'t given one', () => {
      const myApi = new Service(API_HOST, 'access');

      expect(myApi).toHaveProperty('swaggerPath', '/access');
    });
    it('can have the baseUrl just set in a method as a string', () => {
      const myApi = new Service();

      myApi.setBaseUrl(`http://${API_HOST}/cache`);
      expect(myApi.baseURL.toString()).toEqual(`http://${API_HOST}/cache`);
      expect(myApi.apiScheme).toEqual('http');
      expect(myApi.apiHost).toEqual(API_HOST);
      expect(myApi.basePath).toEqual('cache');
    });
    it('can have the baseUrl just set in a method as a URL', () => {
      const myApi = new Service();

      myApi.setBaseUrl(new URL('https://api.place.com/cache/'));
      expect(myApi.baseURL.toString()).toEqual('https://api.place.com/cache/');
      expect(myApi.apiScheme).toEqual('https');
      expect(myApi.apiHost).toEqual('api.place.com');
      expect(myApi.basePath).toEqual('cache');
    });
    it('can have the baseUrl just set in a method as a host', () => {
      const myApi = new Service();

      myApi.setBaseUrl('api.place.com');
      expect(myApi.baseURL.toString()).toEqual('http://api.place.com/rest');
      expect(myApi.apiScheme).toEqual('http');
      expect(myApi.apiHost).toEqual('api.place.com');
      expect(myApi.basePath).toEqual('rest');
    });
  });
  describe('methods', () => {
    describe('getApiInfo', () => {
      it('gets some API info', async () => {
        const myApi = new Service();
        const data = await myApi.getApiInfo();
        expect(data).toHaveProperty('swagger', '2.0');
        expect(data).toHaveProperty('info');
      });
    });
    describe('init', () => {
      it('gets all endpoints', async () => {
        const myApi = new Service();
        await myApi.init();
        expect(myApi).toHaveProperty('endpoints');
        expect(myApi.endpoints.length).toBeGreaterThan(0);
        expect(myApi.endpoints[0]).toBeInstanceOf(Endpoint);
      });
      it('can initialize on a different swagger instance and that will set a new swagger path', async () => {
        const myApi = new Service();
        await myApi.init('/access');
        expect(myApi).toHaveProperty('swaggerPath', '/access');
        expect(myApi.endpoints.length).toBeGreaterThan(0);
        expect(myApi.endpoints[0]).toBeInstanceOf(Endpoint);
      });
      it('will have a map of methods', async () => {
        const myApi = new Service('api.place.com:5000', '/tools');
        await myApi.init();
        expect(myApi).toHaveProperty('swaggerPath', '/tools');
        expect(myApi).toHaveProperty('methods');
        expect(myApi.methods.size).toBeGreaterThan(10);
      });
    });
    describe('setting endpoints', () => {
      it('can manually set a method', () => {
        const service = new Service();
        service.urlNamespace = 'cache';
        service.setBaseUrl('http://api.place.com/');
        service.setEndpoint('/cache/access/user', getUserEndpointData);

        expect(service.endpoints.length).toBeGreaterThan(0);
        expect(service.methods.has('getAccessUser')).toEqual(true);
      });
      it('will set an endpoint that has a long method name', () => {
        const service = new Service('http://api.place.com/', '/external');
        const endpoint = service.setEndpoint('/rest/external/localMarketArea/create', externalLMAEndpoint, true);

        expect(endpoint.endpointActions.has('postMdoExternalLocalMarketAreaCreate')).toEqual(true);
      });
      it('will set an endpoint that has a slightly longer method name with a bool', () => {
        const service = new Service('http://api.place.com/', '/external', 'external');
        const endpoint = service.setEndpoint(
          '/rest/external/{region}/article/{locationType}/list',
          getRegionArticleListEndpoint,
          true,
        );
        expect(endpoint.endpointActions.has('getRegionLocationTypeList')).toEqual(true);
      });
      it('will give an endpoint methodname with an int of 1 that is same as a bool', () => {
        const service = new Service('http://api.place.com/', '/external', 'external');
        const endpoint = service.setEndpoint(
          '/rest/external/{region}/article/{locationType}/list',
          getRegionArticleListEndpoint,
          1,
        );
        expect(endpoint.endpointActions.has('getRegionLocationTypeList')).toEqual(true);
      });
      it('will set an endpoint that has a longer method name', () => {
        const service = new Service('http://api.place.com/', '/external', 'external');
        const endpoint = service.setEndpoint(
          '/rest/external/{region}/article/{locationType}/list',
          getRegionArticleListEndpoint,
          2,
        );
        expect(endpoint.endpointActions.has('getRegionArticleLocationTypeList')).toEqual(true);
      });
      it('will not duplicate endpoints with the same path', () => {
        const service = new Service('http://api.place.com/', '/external', 'external');
        service.setEndpoint(
          '/rest/external/{region}/article/{locationType}/list',
          getRegionArticleListEndpoint,
          2,
        );
        service.setEndpoint(
          '/rest/external/{region}/article/{locationType}/list',
          getRegionArticleListEndpoint,
          2,
        );
        expect(service.methods.size).toEqual(1);
      });
    });
    describe('automatic method collision detection', () => {
      it('has as many methods as it does endpoints', async () => {
        const myApi = new Service('api.place.com:5000', '/tools');
        await myApi.init();
        expect(myApi.methods.size).toBeGreaterThanOrEqual(myApi.endpoints.length);
      });
    });
    describe('using the methods', () => {
      it.skip('can get user groups', async () => {
        const service = new Service('api.place.com:5000', '/tools', 'mdoCommon');
        await service.init();
        const { methods } = service;
        const method = methods.get('getUserAvailableGroups');

        const data = await method({
          region: 'EMEA',
          group: 'local',
        });
        expect(data).toBeTruthy();
      });
      it('can use a manually set a method', async () => {
        const service = new Service();
        service.urlNamespace = 'cache';
        service.setBaseUrl('http://api.place.com/');
        service.setEndpoint('/cache/access/user', getUserEndpointData);

        const { methods } = service;
        const method = methods.get('getAccessUser');
        const data = await method({ name: 'D459062' });
        expect(data).toBeTruthy();
        expect(data).toHaveProperty('Name');
        expect(data).toHaveProperty('Uri');
        expect(data).toHaveProperty('Description');
      });
    });
  });
});
