'use strict';

const { JSON_RPC_VERSION } = require('./version');

class JsonRpcResponse {

    constructor(id) {
        this.jsonrpc = JSON_RPC_VERSION;
        this.id = id;
    }
}

class JsonRpcErrorResponse extends JsonRpcResponse {

    constructor(id, error) {
        super(id);
        this.error = error;
    }
}

class JsonRpcSuccessResponse extends JsonRpcResponse {

    constructor(id, result) {
        super(id);
        this.result = result;
    }
}

module.exports = {
    JsonRpcErrorResponse,
    JsonRpcSuccessResponse
};
