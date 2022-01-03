'use strict';

const { expect } = require('chai');
const JsonRpcError = require('../lib/error');

describe('JsonRpcError', function () {
    describe('constructor', function () {
        it('should throw when error code is not a number', function () {
            expect(() => new JsonRpcError('foo')).
                to.throw(TypeError, 'Error code must be a number');
        });

        it('should throw when error message is not a string', function () {
            expect(() => new JsonRpcError(1, 2)).
                to.throw(TypeError, 'Error message must be a string');
        });
    });

    describe('toJson', function () {
        it('should return error as a simple JSON object', function () {
            const expected = {
                code: -32700,
                message: 'Parse error',
                data: {
                    details: 'Invalid JSON was received by the server.'
                }
            };

            const error = new JsonRpcError(
                expected.code,
                expected.message,
                expected.data
            ).toJson();

            expect(error).to.deep.equal(expected);
        });
    });

    describe('ApplicationError', function () {
        it("should return 'Application' error", function () {
            const expected = {
                code: -1,
                message: 'Application error',
                data: {
                    details: 'Oops, something went wrong.'
                }
            };

            const error = JsonRpcError.ApplicationError(expected.data).toJson();

            expect(error).to.deep.equal(expected);
        });
    });

    describe('InvalidRequest', function () {
        it("should return 'Invalid request' error", function () {
            const expected = {
                code: -32600,
                message: 'Invalid request',
                data: {
                    details: 'The JSON sent is not a valid Request object.'
                }
            };

            const error = JsonRpcError.InvalidRequest(expected.data).toJson();

            expect(error).to.deep.equal(expected);
        });
    });

    describe('MethodNotFound', function () {
        it("should return 'Method not found' error", function () {
            const expected = {
                code: -32601,
                message: 'Method not found',
                data: {
                    details: 'The method does not exist / is not available.'
                }
            };

            const error = JsonRpcError.MethodNotFound(expected.data).toJson();

            expect(error).to.deep.equal(expected);
        });
    });

    describe('InvalidParams', function () {
        it("should return 'Invalid params' error", function () {
            const expected = {
                code: -32602,
                message: 'Invalid params',
                data: {
                    details: 'Invalid method parameter(s).'
                }
            };

            const error = JsonRpcError.InvalidParams(expected.data).toJson();

            expect(error).to.deep.equal(expected);
        });
    });

    describe('InternalError', function () {
        it("should return 'Internal' error", function () {
            const expected = {
                code: -32603,
                message: 'Internal error',
                data: {
                    details: 'Internal JSON-RPC error.'
                }
            };

            const error = JsonRpcError.InternalError(expected.data).toJson();

            expect(error).to.deep.equal(expected);
        });
    });

    describe('ParseError', function () {
        it("should return 'Parse' error", function () {
            const expected = {
                code: -32700,
                message: 'Parse error',
                data: {
                    details: 'Invalid JSON was received by the server.'
                }
            };

            const error = JsonRpcError.ParseError(expected.data).toJson();

            expect(error).to.deep.equal(expected);
        });
    });
});
