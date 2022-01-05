export const getNoParameters = {
  get: {
    tags: [
      'Regional Content Services',
    ],
    summary: 'Get all address lists',
    description: 'Get all address lists',
    operationId: 'RestRegionalAddressListGet',
    consumes: [],
    produces: [
      'application/json',
    ],
    responses: {
      400: {
        description: 'Bad Request',
        schema: {
          $ref: '#/definitions/Error',
        },
      },
      500: {
        description: 'Server Error',
        schema: {
          $ref: '#/definitions/Error',
        },
      },
      200: {
        description: 'An array of TridionItem objects',
        schema: {
          type: 'array',
          items: {
            $ref: '#/definitions/TridionItem',
          },
        },
      },
    },
  },
};

export const getOneParameter = {
  get: {
    tags: [
      'Regional Content Services',
    ],
    summary: 'Get articles',
    description: 'Get articles',
    operationId: 'RestRegionalByRegionArticleGet',
    consumes: [],
    produces: [
      'application/json',
    ],
    parameters: [
      {
        name: 'region',
        in: 'path',
        description: 'The name of the region(EMEA/APAC)',
        required: true,
        type: 'string',
        enum: [
          'EMEA',
          'APAC',
        ],
      },
    ],
    responses: {
      400: {
        description: 'Bad Request',
        schema: {
          $ref: '#/definitions/Error',
        },
      },
      500: {
        description: 'Server Error',
        schema: {
          $ref: '#/definitions/Error',
        },
      },
      200: {
        description: 'Array of TridionItem objects',
        schema: {
          type: 'array',
          items: {
            $ref: '#/definitions/TridionItem',
          },
        },
      },
    },
  },
};

export const pathParameterWithBodyParameter = {
  get: {
    tags: [
      'Access Services',
    ],
    summary: 'Checks if user has regional publish privileges for region',
    description: 'Checks if user has regional publish privileges for region',
    operationId: 'RestRegionalByRegionCanUserPublishGet',
    consumes: [],
    produces: [
      'text/plain',
      'application/json',
      'text/json',
    ],
    parameters: [
      {
        name: 'region',
        in: 'path',
        description: 'The name of the region(EMEA/APAC)',
        required: true,
        type: 'string',
        enum: [
          'EMEA',
          'APAC',
        ],
      },
      {
        name: 'userName',
        in: 'query',
        description: '',
        required: true,
        type: 'string',
      },
    ],
    responses: {
      403: {
        description: 'Forbidden',
        schema: {
          $ref: '#/definitions/Error',
        },
      },
      400: {
        description: 'Bad Request',
        schema: {
          $ref: '#/definitions/Error',
        },
      },
      500: {
        description: 'Server Error',
        schema: {
          $ref: '#/definitions/Error',
        },
      },
      200: {
        description: 'true if user is a member of the group, otherwise false.',
        schema: {
          type: 'boolean',
        },
      },
    },
  },
};

export const postLocalAreaMarketCreateEndpoint = {
  post: {
    tags: [
      'External Services',
    ],
    summary: 'Create new local market area',
    description: 'Create new local market area',
    operationId: 'RestExternalLocalMarketAreaCreatePost',
    consumes: [
      'application/json',
      'text/json',
      'application/json-patch+json',
    ],
    produces: [
      'application/json',
    ],
    parameters: [
      {
        name: 'localMarketAreaData',
        in: 'body',
        description: 'Data for local market area creation',
        required: false,
        schema: {
          $ref: '#/definitions/CreateLocalMarketAreaParameters',
        },
      },
    ],
    responses: {
      400: {
        description: 'Bad Request',
        schema: {
          $ref: '#/definitions/Error',
        },
      },
      500: {
        description: 'Server Error',
        schema: {
          $ref: '#/definitions/Error',
        },
      },
      200: {
        description: 'bool',
        schema: {
          type: 'boolean',
        },
      },
    },
  },
};

export const postLocalMarketAreaCreate = {
  localMarketAreaCode: `TEST${Math.ceil(Math.random() * 1000)}`,
  localMarketAreaName: 'Node Test',
  region: 'EMEA',
};

export const postCreateOrUpdateUserEndpoint = {
  post: {
    tags: [
      'Common List Services',
    ],
    summary: 'Create or update user',
    description: 'Create or update user',
    operationId: 'RestCommonUserCreateOrUpdatePost',
    consumes: [
      'application/json',
    ],
    produces: [
      'text/plain',
      'application/json',
      'text/json',
    ],
    parameters: [
      {
        name: 'parameters',
        in: 'body',
        description: 'CreateOrUpdateUserParameters',
        required: false,
        schema: {
          $ref: '#/definitions/CreateOrUpdateUserParameters',
        },
      },
    ],
    responses: {
      400: {
        description: 'Bad Request',
        schema: {
          $ref: '#/definitions/Error',
        },
      },
      500: {
        description: 'Server Error',
        schema: {
          $ref: '#/definitions/Error',
        },
      },
      200: {
        description: 'bool',
        schema: {
          type: 'boolean',
        },
      },
    },
  },
};

export const postCreateOrUpdateUser = {
  Name: `TEST-JEST-${Math.ceil(Math.random() * 1000)}`,
  Description: 'test.jest@test.com',
  GroupMembership: [
    {
      Name: 'EMEA - FAC - Atn - Content Entry',
      Uri: 'tcm:0-12611-65568',
      Description: 'FAC - Atn - Content Entry',
      GroupMembership: [],
    },
  ],
};

export const getUserRegionEndpointData = {
  get: {
    tags: [
      'Common List Services',
    ],
    summary: 'Get groups that the user can be a member of',
    description: 'Get groups that the user can be a member of',
    operationId: 'RestCommonUserGetAvailableGroupsByRegionByGroupGet',
    consumes: [],
    produces: [
      'application/json',
    ],
    parameters: [
      {
        name: 'region',
        in: 'path',
        description: 'The name of the region(EMEA/APAC)',
        required: true,
        type: 'string',
        enum: [
          'EMEA',
          'APAC',
        ],
      },
      {
        name: 'group',
        in: 'path',
        description: 'The name of the group (regional/local)',
        required: true,
        type: 'string',
        enum: [
          'Local',
          'Regional',
        ],
      },
    ],
    responses: {
      400: {
        description: 'Bad Request',
        schema: {
          $ref: '#/definitions/Error',
        },
      },
      500: {
        description: 'Server Error',
        schema: {
          $ref: '#/definitions/Error',
        },
      },
      200: {
        description: 'Json object',
        schema: {
          type: 'string',
        },
      },
    },
  },
};

export const getUserEndpointData = {
  get: {
    parameters: [
      {
        name: 'name',
        in: 'query',
        type: 'string',
        required: 'true',
      },
    ],
  },
};

export const postToggleProviderEndpoint = {
  post: {
    parameters: [
      {
        name: 'nuid',
        in: 'path',
        description: '',
        required: true,
        type: 'string',
      },
      {
        name: 'parameters',
        in: 'body',
        description: 'JSON obj provided by /checkProvidersStatus',
        required: false,
        schema: {
          $ref: '#/definitions/ProviderStatusParameters',
        },
      },
    ],
  },
};

export const getRegionDisplayDataEndpoint = {
  get: {
    parameters: [
      {
        name: 'region',
        in: 'path',
        description: 'The name of the region(EMEA/APAC)',
        required: true,
        type: 'string',
        enum: [
          'EMEA',
          'APAC',
        ],
      },
      {
        name: 'facility',
        in: 'path',
        description: 'The name of the facility',
        required: true,
        type: 'string',
      },
    ],
  },
};

export const getRegionSubdepartmentDisplayDataEndpoint = {
  get: {
    parameters: [
      {
        name: 'region',
        in: 'path',
        description: 'The name of the region(EMEA/APAC)',
        required: true,
        type: 'string',
        enum: [
          'EMEA',
          'APAC',
        ],
      },
      {
        name: 'facility',
        in: 'path',
        description: 'The name of the facility',
        required: true,
        type: 'string',
      },
      {
        name: 'subDepartment',
        in: 'path',
        description: 'The name of the subDepartment',
        required: true,
        type: 'string',
      },
    ],
  },
};

export const externalLMAEndpoint = {
  post: {
    parameters: [
      {
        name: 'localMarketAreaData',
        in: 'body',
        required: false,
      },
    ],
  },
};

export const getRegionArticleListEndpoint = {
  get: {
    parameters: [
      {
        name: 'region',
        in: 'path',
        description: 'Region (EMEA/APAC)',
        required: true,
        type: 'string',
        enum: [
          'EMEA',
          'APAC',
        ],
      },
      {
        name: 'locationType',
        in: 'path',
        description: 'Location Type',
        required: true,
        type: 'string',
        enum: [
          'Regional',
          'LocalMarketArea',
          'MedicalCenter',
          'Facility',
        ],
      },
      {
        name: 'locationName',
        in: 'query',
        description: 'Location Name',
        required: false,
        type: 'string',
      },
      {
        name: 'specialty',
        in: 'query',
        description: 'Specialty',
        required: false,
        type: 'string',
      },
    ],
  },
};
