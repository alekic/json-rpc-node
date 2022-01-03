'use strict';

const { promisify } = require('util');
const { isEmpty, isObject } = require('./util');
const JsonRpcError = require('./error');
const { argumentify, validate } = require('./params');
const { hasValidId, isNotification, isValid } = require('./request');
const { JsonRpcErrorResponse, JsonRpcSuccessResponse } = require('./response');

class JsonRpcServer {

    constructor() {
        this.methods = {};
    }

    addMethod(name, fn, params, context) {
        if (typeof name !== 'string') {
            throw new TypeError('Method name must be a string');
        }

        if (name.startsWith('rpc.')) {
            // Method names that begin with the word rpc followed by a 
            // period character (U+002E or ASCII 46) are reserved for 
            // rpc-internal methods and extensions and MUST NOT be used 
            // for anything else.
            throw new Error("Method names must not start with 'rpc.'");
        }

        this.methods[name] = { fn, params, context };
    }

    async callMethod(name, args) {
        const { fn, params, context } = this.methods[name];
        const argsArray = argumentify(args, params);

        validate(argsArray, params);

        return fn.apply(context || this, argsArray);
    }

    hasMethod(name) {
        return Object.prototype.hasOwnProperty.call(this.methods, name);
    }

    removeMethod(name) {
        delete this.methods[name];
    }

    handle(request, callback) {
        const handler = Array.isArray(request)
            ? this.handleBatch
            : this.handleRequest;

        handler.call(this, request, callback);
    }

    handleBatch(batch, callback) {
        if (isEmpty(batch)) {
            return this.handleError(
                JsonRpcError.InvalidRequest(),
                batch,
                callback
            );
        }

        const handleRequest = promisify(this.handleRequest).bind(this);
        const promises = batch.map(request => handleRequest(request));

        Promise.all(promises)
            .then(responses => responses.filter(Boolean))
            .then(responses => callback(null, responses))
            .catch(error => callback(error));
    }

    handleRequest(request, callback) {
        if (!isValid(request)) {
            return this.handleError(
                JsonRpcError.InvalidRequest(),
                request,
                callback
            );
        }

        if (!this.hasMethod(request.method)) {
            return this.handleError(
                JsonRpcError.MethodNotFound(),
                request,
                callback
            );
        }

        this.callMethod(request.method, request.params)
            .then(result => this.handleSuccess(result, request, callback))
            .catch(error => this.handleError(error, request, callback));
    }

    handleSuccess(result, request, callback) {
        if (isNotification(request)) {
            return callback();
        }

        callback(null, new JsonRpcSuccessResponse(request.id, result));
    }

    handleError(error, request, callback) {
        if (isNotification(request)) {
            return callback();
        }

        const jsonRpcError = (error instanceof JsonRpcError)
            ? error
            : JsonRpcError.ApplicationError({ details: error.message });

        const hasId = isObject(request)
            && ('id' in request)
            && hasValidId(request);

        callback(null, new JsonRpcErrorResponse(
            hasId ? request.id : null,
            jsonRpcError.toJson()
        ));
    }
}

module.exports = JsonRpcServer;
