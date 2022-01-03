'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const {
    JSON_RPC_VERSION,
    JsonRpcError,
    JsonRpcErrorResponse,
    JsonRpcSuccessResponse,
    JsonRpcServer
} = require('../lib');

const expect = chai.expect;
chai.use(sinonChai);

describe('JsonRpcServer', function () {
    beforeEach(function () {
        this.callback = function () { };
        this.server = new JsonRpcServer();
    });

    describe('addMethod', function () {
        it('should make hasMethod respond correctly', function () {
            this.server.addMethod('sum');

            const hasMethod = this.server.hasMethod('sum');

            expect(hasMethod).to.be.true;
        });

        it('should throw when name is not a string', function () {
            expect(() => this.server.addMethod())
                .to.throw(TypeError, 'Method name must be a string');
        });

        it('should throw when name starts with "rpc."', function () {
            expect(() => this.server.addMethod('rpc.foo'))
                .to.throw(Error, "Method names must not start with 'rpc.'");
        });
    });

    describe('callMethod', function () {
        beforeEach(function () {
            this.context = {};
            this.sum = sinon.stub();
            this.server.addMethod(
                'sum',
                this.sum,
                [
                    { name: 'a' },
                    { name: 'b' }
                ],
                this.context
            );

            this.summands = [1, 2];
        });

        it('should call method with provided arguments', function () {
            const promise = this.server.callMethod('sum', this.summands);

            return promise.then(() => {
                expect(this.sum).to.have.been.calledWith(...this.summands);
            });
        });

        it('should call method on provided context', function () {
            const promise = this.server.callMethod('sum', this.summands);

            return promise.then(() => {
                expect(this.sum).to.have.been.calledOn(this.context);
            });
        });

        it('should return Promise which resolves with the method result', function () {
            this.sum.withArgs(...this.summands).returns(3);

            const promise = this.server.callMethod('sum', this.summands);

            return promise.then(result => {
                expect(result).to.equal(3);
            });
        });

        it('should propagate error thrown from method', function () {
            const underlyingError = new Error('Oops, something went wrong.');
            this.sum.withArgs(...this.summands).throws(underlyingError);

            const promise = this.server.callMethod('sum', this.summands);

            return promise.catch(error => {
                expect(error).to.equal(underlyingError);
            });
        });

        it('should accept arguments provided as an Object', function () {
            const promise = this.server.callMethod('sum', { a: 1, b: 2 });

            return promise.then(() => {
                expect(this.sum).to.have.been.calledWith(1, 2);
            });
        });
    });

    describe('hasMethod', function () {
        it('should return false when method is not defined', function () {
            const hasMethod = this.server.hasMethod('foo');

            expect(hasMethod).to.be.false;
        });
    });

    describe('removeMethod', function () {
        it('should make hasMethod respond correctly', function () {
            this.server.addMethod('sum');
            this.server.removeMethod('sum');

            const hasMethod = this.server.hasMethod('sum');

            expect(hasMethod).to.be.false;
        });
    });

    describe('handle', function () {
        beforeEach(function () {
            this.server.handleBatch = sinon.spy();
            this.server.handleRequest = sinon.spy();
        });

        it('should handle single Request object', function () {
            const request = { method: 'foo' };

            this.server.handle(request, this.callback);

            expect(this.server.handleRequest)
                .to.have.been.calledWith(request, this.callback);
        });

        it('should handle batch of Request objects', function () {
            const batch = [
                { method: 'foo' },
                { method: 'bar' }
            ];

            this.server.handle(batch, this.callback);

            expect(this.server.handleBatch)
                .to.have.been.calledWith(batch, this.callback);
        });
    });

    describe('handleBatch', function () {
        beforeEach(function () {
            this.request1 = { jsonrpc: JSON_RPC_VERSION, id: 1, method: 'method1' };
            this.request2 = { jsonrpc: JSON_RPC_VERSION, id: 2, method: 'method2' };

            this.response1 = new JsonRpcSuccessResponse(this.request1.id, 1);
            this.response2 = new JsonRpcSuccessResponse(this.request2.id, 2);

            this.server.handleRequest = sinon.stub();
            this.server.handleRequest.withArgs(this.request1).yields(null, this.response1);
            this.server.handleRequest.withArgs(this.request2).yields(null, this.response2);

            this.batch = [this.request1, this.request2];
        });

        it("should callback with 'Invalid request' Response when batch is empty", function (done) {
            const expected = new JsonRpcErrorResponse(
                null,
                JsonRpcError.InvalidRequest().toJson()
            );

            this.server.handleBatch([], function (err, response) {
                expect(err).to.not.exist;
                expect(response).to.deep.equal(expected);
                done();
            });
        });

        it('should callback with array of Responses', function (done) {
            const expected = [this.response1, this.response2];

            this.server.handleBatch(this.batch, function (err, responses) {
                expect(err).to.not.exist;
                expect(responses).to.deep.equal(expected);
                done();
            });
        });

        context('when an unexpected error occurs', function () {
            beforeEach(function () {
                this.underlyingError = new Error('Network error');
                this.server.handleRequest.reset();
                this.server.handleRequest.throws(this.underlyingError);
            });

            it('should callback with the underlying error', function (done) {
                const that = this;

                this.server.handleBatch(this.batch, function (err) {
                    expect(err).to.deep.equal(that.underlyingError);
                    done();
                });
            });
        });
    });

    describe('handleRequest', function () {
        beforeEach(function () {
            this.testMethod = sinon.stub().returns(42);
            this.server.addMethod('test', this.testMethod, []);
            this.request = { jsonrpc: JSON_RPC_VERSION, id: 1, method: 'test' };
        });

        context('when the rpc call succeeds', function () {
            it('should callback with Response containing the result', function (done) {
                const expected = new JsonRpcSuccessResponse(this.request.id, 42);

                this.server.handleRequest(this.request, function (err, response) {
                    expect(err).to.not.exist;
                    expect(response).to.deep.equal(expected);
                    done();
                });
            });
        });

        context('when the rpc call encounters an error', function () {
            beforeEach(function () {
                this.underlyingError = new Error('Houston, we have a problem!');
                this.testMethod.throws(this.underlyingError);
            });

            it('should callback with Response containing the error data', function (done) {
                const expected = new JsonRpcErrorResponse(
                    this.request.id,
                    JsonRpcError.ApplicationError({
                        details: this.underlyingError.message
                    }).toJson()
                );

                this.server.handleRequest(this.request, function (err, response) {
                    expect(err).to.not.exist;
                    expect(response).to.deep.equal(expected);
                    done();
                });
            });
        });

        it("should callback with 'Invalid request' Response when Request is invalid", function (done) {
            const expected = new JsonRpcErrorResponse(
                null,
                JsonRpcError.InvalidRequest().toJson()
            );

            this.server.handleRequest(1, function (err, response) {
                expect(err).to.not.exist;
                expect(response).to.deep.equal(expected);
                done();
            });
        });

        it("should callback with 'Method not found' Response when method doesn't exist", function (done) {
            const request = { jsonrpc: JSON_RPC_VERSION, id: 1, method: 'foo' };
            const expected = new JsonRpcErrorResponse(
                request.id,
                JsonRpcError.MethodNotFound().toJson()
            );

            this.server.handleRequest(request, function (err, response) {
                expect(err).to.not.exist;
                expect(response).to.deep.equal(expected);
                done();
            });
        });

        context('when handling a Notification', function () {
            beforeEach(function () {
                this.notification = { jsonrpc: JSON_RPC_VERSION, method: 'test' };
            });

            it('should callback with no result when the rpc call succeeds', function (done) {
                this.server.handleRequest(this.notification, function (err, response) {
                    expect(err).to.not.exist;
                    expect(response).to.not.exist;
                    done();
                });
            });

            it('should ignore any errors', function (done) {
                this.testMethod.throws();

                this.server.handleRequest(this.notification, function (err, response) {
                    expect(err).to.not.exist;
                    expect(response).to.not.exist;
                    done();
                });
            });
        });
    });
});
