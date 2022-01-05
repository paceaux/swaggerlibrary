<br/>
<p align="center">
  <h3 align="center">NPM library for using Swagger-documented APIs</h3>

</p>



## Table Of Contents

* [About the Project](#about-the-project)
* [Built With](#built-with)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
* [Usage](#usage)
* [Authors](#authors)

## About The Project

This is a small NPM library that creates auto-generated methods, based on the swagger.json for a given Rest endpoint.

* /rest/content/swagger.json


## Built With

This is written in JavaScript and compiled with Babel. It relies on [axios](https://axios-http.com/) and [form-data](https://www.npmjs.com/package/form-data/v/2.3.3). 

## Getting Started

This is a library meant to be included in a JavaScript project. 


### Prerequisites

* [node 12+](https://nodejs.org/en/download/)
* Update NPM

```sh
npm install npm@latest -g
```

### Commands

| Command                       |   Purpose |
| ---                           |   ---     |
| `npm install`                 | Installs all packages |
| `npm run clean`               | Deletes the `build` folder |
| `npm run build`               | Compiles into a `build` folder |
| `npm run prepare`             | Cleans and builds (steps necessary for publishing)    | 
| `npm run lint`             | runs linter on JS files in src |
| `npm run lint:fix`         | runs `lint` and fixes all fixable things |
| `npm run tests-only`          | only runs unit tests (jest)  |
| `npm run test`             | runs unit tests first, then linter  |

## Usage
### Create a Service
The first argument is the host, the second argument is the path for a `swagger.json` file on that host
```
    const myApi = new Service('localhost', '/tools');
```

### Initialize the service
This will contact swagger.json at the given endpoint and create all of the methods that are possible. 

```JavaScript
await myApi.init()
```

Once it has been initialized, it will have endpoint data and a whole set of methods available for use. 

You can also initialize the api with arguments. 

The below will set the path for swagger to `/access`, add Axios (important for dependency injection), and then indicate that paths are namespaced under `people`.

```JavaScript
  const myApi = new Service();
  await myApi.init('/access', Axios, '/people');
```

### Finding a method
Methods are generated based on endpoints documented in swagger.json. The method name follows the formula: `<verb>/<firstUsablePartOfPath>/<lastUsablePartOfPath>`

Without a namespacing argument set in the service, this method is created:
e.g. 
* POST /rest/people/user/createOrUpdate => `postPeopleCreateOrUpdate`
* GET /rest/structuredContentList/templates/getContentPageByTemplate => `postStructuredContentListGetContentPageByTemplate`

Obviously this is badnews bears if there are multiple paths with the same ending. If you have provided a namespace argument, this will inform the endpoint generation that where to start with generating methods. 


e.g., this is what happens with `people` set as a namespace:
* POST /rest/people/user/createOrUpdate => `postUserCreateOrUpdate`
* GET /rest/structuredContentList/templates/getContentPageByTemplate => `postStructuredContentListGetContentPageByTemplate`

### Posting with a Method
If the method needs a JSON body, there's two options. 

*Post with an object containing a property called `body`*
```JavaScript
const service = new Service('localhost:5000', '/places');
await service.init();
const createUser = myApi.methods.get('postPlacesCreate');
const data = createUser({
  body: {
    Name: `John Smith`,
    Description: 'john.smith@place.com',
    GroupMembership: [
      {
        Name: 'EMEA - FAC - Atn - Content Entry',
        Uri: 'tcm:0-12611-65568',
        Description: 'FAC - Atn - Content Entry',
        GroupMembership: [],
      },
    ],
  }
}})
```

*post with an object containing parameters*

This will work, assuming the method accepts a json body. 
```JavaScript
const service = new Service('api.place.com:5000', '/places');
await service.init();
const createUser = myApi.methods.get('postPlacesCreate');
const data = createUser({ 
  Name: `John Smith`,
  Description: 'john.smith@place.com',
  GroupMembership: [
    {
      Name: 'EMEA - FAC - Atn - Content Entry',
      Uri: 'tcm:0-12611-65568',
      Description: 'FAC - Atn - Content Entry',
      GroupMembership: [],
    },
  ],
}})
```





## Authors

* **Frank M. Taylor** - *Principal Solutions Consultant, EXLRT* - [Frank M. Taylor]() - **
