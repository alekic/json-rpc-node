'use strict';

const { JSON_RPC_VERSION } = require('./version');
const { isObject } = require('./util');

function isNotification(request) {
    return isValid(request) && !('id' in request);
}

function isValid(request) {
    return isObject(request)
        && hasValidJsonrpc(request)
        && hasValidId(request)
        && hasValidMethod(request)
        && hasValidParams(request);
}

function hasValidJsonrpc(request) {
    return request.jsonrpc === JSON_RPC_VERSION;
}

function hasValidId(request) {
    if ('id' in request) {
        return request.id === null
            || typeof request.id === 'number'
            || typeof request.id === 'string';
    }

    return true;
}

function hasValidMethod(request) {
    return typeof request.method === 'string';
}

function hasValidParams(request) {
    if ('params' in request) {
        return isObject(request.params)
            || Array.isArray(request.params);
    }

    return true;
}

module.exports = {
    hasValidJsonrpc,
    hasValidId,
    hasValidMethod,
    hasValidParams,
    isNotification,
    isValid
};
