'use strict';
/**
* Source: https://github.com/Orange-OpenSource/angular-swagger-ui/blob/master/src/scripts/modules/openapi3-converter.js
*
* License: MIT
*
**/

var HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'],
    SCHEMA_PROPERTIES = ['format', 'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'minLength', 'maxLength', 'multipleOf', 'minItems', 'maxItems', 'uniqueItems', 'minProperties', 'maxProperties', 'pattern', 'enum', 'default'],
    ARRAY_PROPERTIES = ['type', 'items'];
// MER removed 'additionalProperties' from SCHEMA_PROPERTIES

var urlParser = require('url');
const util = require('util');

/**
 * Transforms OpenApi 3.0 to Swagger 2
 */
module.exports = function convert(data) {
  // prepare openApiSpec objects
  let newSpec = JSON.parse(JSON.stringify(data));
  newSpec.swagger = '2.0';
  convertInfos(newSpec);
  convertOperations(newSpec);
  convertSecurityDefinitions(newSpec);
  if (newSpec.components) {
    newSpec.definitions = newSpec.components.schemas;
    delete newSpec.components.schemas;
    newSpec['x-components'] = newSpec.components;
    delete newSpec.components;
    fixRefs(newSpec);
  }
  newSpec.definitions
  return newSpec;
}

function fixRef(ref) {
  return ref
      .replace('#/components/schemas/', '#/definitions/')
      .replace('#/components/', '#/x-components/')
}

function fixRefs(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(fixRefs);
  } else if (typeof obj === 'object') {
    for (let key in obj) {
      if (key === '$ref') {
        obj.$ref = fixRef(obj.$ref);
      } else {
        fixRefs(obj[key]);
      }
    }
  }
}

function resolveReference(base, obj) {
  var ref = obj.$ref;
  if (!ref) return obj;
  var keys = ref.split('/');
  keys.shift();
  var cur = base;
  keys.forEach(k => cur = cur[k]);
  return cur;
}

/**
 * convert main infos and tags
 */
function convertInfos(openApiSpec) {
    var server = openApiSpec.servers && openApiSpec.servers[0];
    if (server) {
        let match = server.url.match(/(\w+):\/\/([^\/]+)(\/.*)?/);
        if (match) {
          openApiSpec.schemes = [match[1]];
          openApiSpec.host = match[2];
          openApiSpec.basePath = match[3] || '/';
        }
    }
    delete openApiSpec.servers;
    delete openApiSpec.openapi;
}

function convertOperations(openApiSpec) {
    var path, pathObject, method, operation;
    for (path in openApiSpec.paths) {
        pathObject = openApiSpec.paths[path] = resolveReference(openApiSpec, openApiSpec.paths[path]);
        for (method in pathObject) {
            if (HTTP_METHODS.indexOf(method) >= 0) {
                operation = pathObject[method] = resolveReference(openApiSpec, pathObject[method]);
                operation.consumes = ['application/json'];
                operation.produces = ['application/json'];
                convertParameters(openApiSpec, operation);
                convertResponses(openApiSpec, operation);
            }
        }
    }
}

function convertParameters(openApiSpec, operation) {
    var content, param;
    operation.parameters = operation.parameters || [];
    if (operation.requestBody) {
        param = resolveReference(openApiSpec, operation.requestBody);
        param.name = 'body';
        content = param.content;
        if (content) {
            delete param.content;
            if (content['application/x-www-form-urlencoded']) {
                param.in = 'formData';
                param.schema = content['application/x-www-form-urlencoded'].schema;
                param.schema = resolveReference(openApiSpec, param.schema);
                if (param.schema.type === 'object' && param.schema.properties) {
                    for (let name in param.schema.properties) {
                      let p = param.schema.properties[name];
                      p.name = name;
                      p.in = 'formData';
                      operation.parameters.push(p);
                    }
                } else {
                    operation.parameters.push(param);
                }
            } else if (content['multipart/form-data']) {
                param.in = 'formData';
                param.schema = content['multipart/form-data'].schema;
                operation.parameters.push(param);
            } else if (content['application/octet-stream']) {
                param.in = 'formData';
                param.type = 'file';
                param.name = param.name || 'file';
                delete param.schema;
                operation.parameters.push(param);
            } else if (content['application/json']) {
                param.in = 'body';
                param.schema = content['application/json'].schema;
                operation.parameters.push(param);
            } else {
                console.warn('unsupported request body media type', operation.operationId, content);
            }
        }
        delete operation.requestBody;
    }
    (operation.parameters || []).forEach(function(param, i) {
        param = operation.parameters[i] = resolveReference(openApiSpec, param);
        copySchemaProperties(param);
        if (param.in !== 'body') {
            copyArrayProperties(param);
            delete param.schema;
            delete param.explode; // MER
        }
    });
}

function copySchemaProperties(obj) {
    SCHEMA_PROPERTIES.forEach(function(prop) {
        if (obj.schema && obj.schema[prop]) {
            obj[prop] = obj.schema[prop];
            delete obj.schema[prop];
        }
    });
}

function copyArrayProperties(obj) {
    ARRAY_PROPERTIES.forEach(function(prop) {
        if (obj.schema && obj.schema[prop]) {
            obj[prop] = obj.schema[prop];
            delete obj.schema[prop];
        }
    });
}

function convertResponses(openApiSpec, operation) {
    var code, content, contentType, response, resolved;
    // TODO handle produces/consumes see https://github.com/LucyBot-Inc/api-spec-converter/commit/51de67ecd57cb48e54b88b7527fb112af7001bdb
    for (code in operation.responses) {
        content = false;
        contentType = 'application/json';
        response = operation.responses[code] = resolveReference(openApiSpec, operation.responses[code]);
        if (response.content) {
            if (response.content[contentType]) {
                content = response.content[contentType];
            }
            if (!content) {
                contentType = Object.keys(response.content)[0];
                content = response.content[contentType];
            }
        }
        if (content) {
            response.schema = content.schema;
            resolved = resolveReference(openApiSpec, response.schema);
            if (resolved.type === 'array') {
                response.schema = resolved;
            }
            if (content.example) {
                response.examples = {};
                response.examples[contentType] = content.example;
            }
            copySchemaProperties(response);
        }
        delete response.content;
        if (response.headers) {
            for (let h in response.headers) {
                let header = response.headers[h];
                copySchemaProperties(header);
                copyArrayProperties(header);
                delete header.schema;
            }
        }
        if (response.links) {
            response["x-links"] = response.links;
            delete response.links;
        }
    }
}

function convertSecurityDefinitions(openApiSpec) {
    if (openApiSpec.components && openApiSpec.components.securitySchemes) {
        openApiSpec.securityDefinitions = openApiSpec.components.securitySchemes;
    }
    for (let secKey in openApiSpec.securityDefinitions) {
        let security = openApiSpec.securityDefinitions[secKey];
        if (security.type === 'http' && security.scheme === 'basic') {
            security.type = 'basic';
        } else if (security.type === 'oauth2') {
            var flowName = Object.keys(security.flows)[0],
                flow = security.flows[flowName];

            if (flowName === 'clientCredentials') {
                security.flow = 'application';
            } else if (flowName === 'authorizationCode') {
                security.flow = 'accessCode';
            } else {
                security.flow = flowName;
            }
            security.authorizationUrl = flow.authorizationUrl;
            if (flow.tokenUrl) security.tokenUrl = flow.tokenUrl; // MER
            security.scopes = flow.scopes;
            delete security.flows;
        }
    }
    delete openApiSpec.components.securitySchemes;
}

