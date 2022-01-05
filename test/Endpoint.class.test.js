import Service from '../src/Api.service';
import Endpoint from '../src/Endpoint.class';

import {
  getNoParameters,
  getOneParameter,
  pathParameterWithBodyParameter,
  postCreateOrUpdateUser,
  postCreateOrUpdateUserEndpoint,
  postLocalAreaMarketCreateEndpoint,
  postLocalMarketAreaCreate,
  getUserRegionEndpointData,
  getUserEndpointData,
  postToggleProviderEndpoint,
  getRegionDisplayDataEndpoint,
  getRegionSubdepartmentDisplayDataEndpoint,
} from './endpointData';

describe('Endpoint Class', () => {
  describe('static members', () => {
    it('has http verbs', () => {
      expect(Endpoint).toHaveProperty('verbs');
      expect(Endpoint.verbs.has('get')).toBe(true);
    });
    describe('generating method names', () => {
      it('generates a method name with a get', () => {
        const methodName = Endpoint.getMethodName('get', '/rest/regional/addressList');

        expect(methodName).toEqual('getRegionalAddressList');
      });
      it('generates a method name with a long path and get', () => {
        // eslint-disable-next-line max-len
        const methodName = Endpoint.getMethodName('get', '/rest/local/{region}/{locationType}/{locationName}/{specialty}/article');

        expect(methodName).toEqual('getLocalArticle');
      });
      it('generates a more specific method name if told to', () => {
        // eslint-disable-next-line max-len
        const methodName = Endpoint.getMethodName('get', 'rest/commonApis/region/facilities/facility/subdepartments/{subdepartment}/getDisplayData', 'commonApis', true);

        expect(methodName).toEqual('getRegionSubdepartmentDisplayData');
      });
      it('generates a more specific name by being given an index for elongation', () => {
        // eslint-disable-next-line max-len
        const methodName = Endpoint.getMethodName('get', 'rest/commonApis/region/facilities/facility/subdepartments/{subdepartment}/getDisplayData', 'commonApis', 2);

        expect(methodName).toEqual('getRegionSubdepartmentsSubdepartmentDisplayData');
      });
      it('generates a method name with a short path and post', () => {
        const methodName = Endpoint.getMethodName('post', '/rest/publishGeneral');

        expect(methodName).toEqual('postPublishGeneral');
      });
    });
    describe('can generate action parameters', () => {
      it('generates a single parameter on a get action', () => {
        const parameterMap = Endpoint.getActionParameterMap(['get'], getOneParameter);

        expect(parameterMap).toBeInstanceOf(Map);
        expect(parameterMap.size).toEqual(1);
        expect(parameterMap.has('get')).toEqual(true);

        expect(parameterMap.get('get')).toBeInstanceOf(Map);
        expect(parameterMap.get('get').has('region')).toEqual(true);
      });
      it('has an empty map if the action is in the data but there are no parameters for it', () => {
        const parameterMap = Endpoint.getActionParameterMap(['get'], getNoParameters);

        expect(parameterMap).toBeInstanceOf(Map);
        expect(parameterMap.size).toEqual(0);
        expect(parameterMap.has('get')).toEqual(false);
      });
      it('has an empty map if the action is NOT in the data', () => {
        const parameterMap = Endpoint.getActionParameterMap(['post'], getNoParameters);

        expect(parameterMap).toBeInstanceOf(Map);
        expect(parameterMap.size).toEqual(0);
      });
    });
    describe('can generate paths', () => {
      it('removes the rest part at the start', () => {
        const path = Endpoint.generateEndpointActionPath('/rest/foo/bar');

        expect(path).toEqual('/foo/bar');
      });
      it('will replace a part of the path with its value', () => {
        const path = Endpoint.generateEndpointActionPath('/foo/bar/{region}', { region: 'baz' });

        expect(path).toEqual('/foo/bar/baz');
      });
      it('will replace a multiple parts of the path with values', () => {
        const path = Endpoint.generateEndpointActionPath('/foo/bar/{region}/{local}', { region: 'baz', local: 'boop' });

        expect(path).toEqual('/foo/bar/baz/boop');
      });
    });
  });
  describe('constructor', () => {
    it('has data, path,namespace, and service by default', () => {
      const endpoint = new Endpoint();
      expect(endpoint).toHaveProperty('path', '');
      expect(endpoint).toHaveProperty('endpointData', {});
      expect(endpoint).toHaveProperty('service');
      expect(endpoint).toHaveProperty('pathNamespace', 'rest');
      expect(endpoint.service).toBeInstanceOf(Service);
    });
    it('will put my data, path, and service on it', () => {
      const service = new Service();
      const endpoint = new Endpoint('/rest/regional/addressList', getNoParameters, service);

      expect(endpoint).toHaveProperty('path', '/rest/regional/addressList');
      expect(endpoint).toHaveProperty('endpointData');
      expect(endpoint.endpointData).toMatchObject(getNoParameters);
      expect(endpoint.service).toMatchObject(service);
    });
    it('can tell me which actions are available', () => {
      const service = new Service();
      const endpoint = new Endpoint('/rest/regional/addressList', getNoParameters, service);

      expect(endpoint).toHaveProperty('actions');
      expect(endpoint.actions.has('get')).toBe(true);
    });
    it('has a Map of Maps of parameters allowed on actions', () => {
      const service = new Service();
      const endpoint = new Endpoint('/rest/regional/{region}/article', getOneParameter, service);

      expect(endpoint).toHaveProperty('actionParameters');
      expect(endpoint.actionParameters.size).toEqual(1);
      expect(endpoint.actionParameters.has('get')).toEqual(true);
      expect(endpoint.actionParameters.get('get').has('region')).toEqual(true);
      expect(endpoint.actionParameters.get('get').get('region')).toHaveProperty('type');
    });
  });
  describe('methodGeneration', () => {
    describe('methodNames', () => {
      it.skip('will look at the last part of a path and prevent multiple methods from getting lost', async () => {
        const service = new Service('api.place.com:5000', '/buildings');
        await service.init();

        expect(service.methods.has('postMdoExternalFacilityCreate'));
      });
      it('will have many creates with a namespace', async () => {
        const service = new Service('api.place.com:5000', '/buildings', 'buildings');
        await service.init();

        expect(service.methods.has('postFacilityCreate')).toEqual(true);
        expect(service.methods.has('postProviderCreate')).toEqual(true);
        expect(service.methods.has('postLocalMarketAreaCreate')).toEqual(true);
        expect(service.methods.has('postMedicalCenterCreate')).toEqual(true);
      });
      it('will look for collisions in the service and generate a longer method name on the second method', () => {
        const service = new Service('api.place.com:5000', '/toolings', 'commonApis');

        // eslint-disable-next-line max-len
        service.setEndpoint('/rest/commonApis/{region}/facilities/{facility}/getDisplayData', getRegionDisplayDataEndpoint);
        // eslint-disable-next-line max-len
        const getRegionSubEndpoint = service.setEndpoint('/rest/commonApis/{region}/facilities/{facility}/subdepartments/{subDepartment}/getDisplayData', getRegionSubdepartmentDisplayDataEndpoint);

        expect(getRegionSubEndpoint.endpointActions.has('getRegionSubDepartmentDisplayData')).toEqual(true);
      });
      it('will look for collisions in the service and generate a longer method name on the FIRST method', () => {
        const service = new Service('api.place.com:5000', '/toolings', 'commonApis');

        // eslint-disable-next-line max-len
        const getRegionEndpoint = service.setEndpoint('/rest/commonApis/{region}/facilities/{facility}/getDisplayData', getRegionDisplayDataEndpoint);
        // eslint-disable-next-line max-len
        service.setEndpoint('/rest/commonApis/{region}/facilities/{facility}/subdepartments/{subDepartment}/getDisplayData', getRegionSubdepartmentDisplayDataEndpoint);

        expect(getRegionEndpoint.endpointActions.has('getRegionFacilityDisplayData')).toEqual(true);
      });
    });
    describe('Get methods', () => {
      it('generates a get method', () => {
        const service = new Service();
        const endpoint = new Endpoint('/rest/regional/addressList', getNoParameters, service);

        expect(endpoint).toHaveProperty('get');
        expect(endpoint.get).toBeInstanceOf(Function);
      });
      it('generates a get method that doesn\'t need parameters and returns data', async () => {
        const service = new Service();
        await service.init();
        const endpoint = new Endpoint('/rest/regional/addressList', getNoParameters, service);
        const data = await endpoint.get();

        expect(data).toBeTruthy();
        expect(data.length).toBeGreaterThan(0);
      });
      it('does not mind if it has parameters it never needed', async () => {
        const service = new Service();
        await service.init();
        const endpoint = new Endpoint('/rest/regional/addressList', getNoParameters, service);
        const data = await endpoint.get({ foo: 'bar' });

        expect(data).toBeTruthy();
        expect(data.length).toBeGreaterThan(0);
      });
      it('gets with two parameters', async () => {
        const service = new Service('api.place.com:5000', '/toolings', 'commonApis');
        await service.init();

        const endpoint = new Endpoint(
          '/rest/commonApis/user/getAvailableGroups/{region}/{group}',
          getUserRegionEndpointData,
          service,
        );
        const data = await endpoint.get({
          region: 'EMEA',
          group: 'Local',
        });
        expect(data).toBeTruthy();
        expect(data.length).toBeGreaterThan(0);
      });
      it('throws an error if the method requires params and they are not there', async () => {
        const service = new Service();
        await service.init();

        await expect(async () => {
          const endpoint = new Endpoint('/rest/regional/{region}/article', getOneParameter, service);
          const data = await endpoint.get();
        }).rejects.toThrow('This action requires the parameters region');
      });
      it('throws an error if the method requires params and they are not valid', async () => {
        const service = new Service();
        await service.init();

        await expect(async () => {
          const endpoint = new Endpoint('/rest/regional/{region}/article', getOneParameter, service);
          const data = await endpoint.get({ foo: 'bar' });
        }).rejects.toThrow('The parameter names foo are not valid for this action.');
      });
      it('throws an error if a value is not in the enum', async () => {
        const service = new Service();
        await service.init();

        await expect(async () => {
          const endpoint = new Endpoint('/rest/regional/{region}/article', getOneParameter, service);
          const data = await endpoint.get({ region: 'foo' });
        }).rejects.toThrow('ncal,mas are the only permitted values for region');
      });
      it('generates a get method that needs one parameter and returns data', async () => {
        const service = new Service();
        await service.init();
        const endpoint = new Endpoint('/rest/regional/{region}/article', getOneParameter, service);
        const data = await endpoint.get({ region: 'EMEA' });

        expect(data).toBeTruthy();
        expect(data.length).toBeGreaterThan(0);
      });
      describe('get with body params', () => {
        it('generates a method with body parameters', async () => {
          const service = new Service('place.api.com', '/access');
          await service.init();
          const endpoint = new Endpoint('/rest/regional/{region}/canUserPublish', pathParameterWithBodyParameter, service);
          const data = await endpoint.get({
            region: 'EMEA',
            userName: 'D459062',
          });

          expect(data).toBeTruthy();
        });
      });
      describe('get with query params', () => {
        it('lets you create an endpoint that aint usual', async () => {
          const service = new Service();
          service.urlNamespace = 'cache';
          service.setBaseUrl('http://place.api.com/');
          const endpoint = new Endpoint('/cache/access/user', getUserEndpointData, service);

          const data = await endpoint.get({ name: 'D459062' });
          expect(data).toBeTruthy();
          expect(data).toHaveProperty('Name');
          expect(data).toHaveProperty('Uri');
          expect(data).toHaveProperty('Description');
        });
      });
    });
    describe('Post methods', () => {
      it('creates a user', async () => {
        const service = new Service('api.place.com:5000', '/toolings');
        await service.init();
        const endpoint = new Endpoint('/rest/commonApis/user/createOrUpdate', postCreateOrUpdateUserEndpoint, service);
        const data = await endpoint.post({ body: postCreateOrUpdateUser });
        expect(service.endpoints).toBeTruthy();
        expect(data).toBeTruthy();
        expect(data).toHaveProperty('Uri');
      });
      it('creates a local marketArea', async () => {
        const service = new Service('api.place.com:5000', '/buildings', 'buildings');
        await service.init();
        const endpoint = new Endpoint('/rest/buildings/localMarketArea/create', postLocalAreaMarketCreateEndpoint, service);
        const data = await endpoint.post({ body: postLocalMarketAreaCreate });

        expect(service.endpoints).toBeTruthy();
        expect(endpoint.actionParameters.has('post')).toEqual(true);
        expect(endpoint.actionParameters.get('post').has('body'));
        expect(data).toBeTruthy();
        expect(data).toEqual(true);
      });
      describe('post problems', () => {
        it('will replace a multiple parts of the path with values', () => {
          const path = Endpoint.generateEndpointActionPath(
            '/rest/commonApis/provider/nuid/{nuid}/toggleProviderStatus',
            { nuid: 'F493937', isActive: true },
          );

          expect(path).toEqual('/commonApis/provider/nuid/F493937/toggleProviderStatus');
        });
        it('fails if you do not post a body', async () => {
          const service = new Service('api.place.com:5000', '/toolings');
          await service.init();

          await expect(async () => {
            const endpoint = new Endpoint(
              '/rest/commonApis/provider/nuid/{nuid}/toggleProviderStatus',
              postToggleProviderEndpoint,
              service,
            );
            await endpoint.post({ nuid: 'F493937', parameters: { nuid: 'F493937', IsActive: true } });
          }).rejects.toThrow('This action requires a body parameter, only nuid,parameters were given.');
        });
        it('passes if you do post a body', async () => {
          const service = new Service('api.place.com:5000', '/toolings');
          await service.init();

          const endpoint = new Endpoint(
            '/rest/commonApis/provider/nuid/{nuid}/toggleProviderStatus',
            postToggleProviderEndpoint,
            service,
          );
          const data = await endpoint.post({ nuid: 'F493937', body: { nuid: 'F493937', isActive: true } });

          expect(data).toHaveProperty('isActive');
          expect(data).toBeTruthy();
        });
      });
    });
  });
});
