'use strict';

class JsonRpcError extends Error {

    constructor(code, message, data) {
        if (typeof code !== 'number') {
            throw new TypeError('Error code must be a number');
        }

        if (typeof message !== 'string') {
            throw new TypeError('Error message must be a string');
        }

        super(message);

        this.code = code;
        this.data = data;
        this.name = 'JsonRpcError';
    }

    toJson() {
        return {
            code: this.code,
            message: this.message,
            data: this.data
        };
    }
}

JsonRpcError.ApplicationError = function (data) {
    return new JsonRpcError(-1, 'Application error', data);
};

JsonRpcError.InvalidRequest = function (data) {
    return new JsonRpcError(-32600, 'Invalid request', data);
};

JsonRpcError.MethodNotFound = function (data) {
    return new JsonRpcError(-32601, 'Method not found', data);
};

JsonRpcError.InvalidParams = function (data) {
    return new JsonRpcError(-32602, 'Invalid params', data);
};

JsonRpcError.InternalError = function (data) {
    return new JsonRpcError(-32603, 'Internal error', data);
};

JsonRpcError.ParseError = function (data) {
    return new JsonRpcError(-32700, 'Parse error', data);
};

module.exports = JsonRpcError;
