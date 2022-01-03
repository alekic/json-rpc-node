'use strict';

const { expect } = require('chai');
const {
    hasValidId,
    hasValidJsonrpc,
    hasValidMethod,
    hasValidParams,
    isValid,
    isNotification
} = require('../lib/request');

describe('request', function () {
    beforeEach(function () {
        this.request = {
            jsonrpc: '2.0',
            id: 1,
            method: 'sum',
            params: [1, 2]
        };
    });

    describe('hasValidJsonrpc', function () {
        it('should return true when Request has a jsonrpc property with value "2.0"', function () {
            expect(hasValidJsonrpc({ jsonrpc: '2.0' })).to.be.true;
        });

        it('otherwise should return false', function () {
            expect(hasValidJsonrpc({})).to.be.false;
            expect(hasValidJsonrpc({ jsonrpc: 2.0 })).to.be.false;
            expect(hasValidJsonrpc({ jsonrpc: '2' })).to.be.false;
            expect(hasValidJsonrpc({ jsonrpc: '1.0' })).to.be.false;
        });
    });

    describe('hasValidId', function () {
        it("should return true when Request doesn't have an id property", function () {
            expect(hasValidId({})).to.be.true;
        });

        context('when Request has an id property', function () {
            it('should return true when id is a string', function () {
                expect(hasValidId({ id: 1 })).to.be.true;
            });

            it('should return true when id is a number', function () {
                expect(hasValidId({ id: '123' })).to.be.true;
            });

            it('should return true when id is null', function () {
                expect(hasValidId({ id: null })).to.be.true;
            });

            it('otherwise should return false', function () {
                expect(hasValidId({ id: false })).to.be.false;
                expect(hasValidId({ id: undefined })).to.be.false;
            });
        });
    });

    describe('hasValidMethod', function () {
        it('should return true when Request has a method property of type string', function () {
            expect(hasValidMethod({ method: 'sum' })).to.be.true;
        });

        it('otherwise should return false', function () {
            expect(hasValidMethod({})).to.be.false;
            expect(hasValidMethod({ method: 0 })).to.be.false;
            expect(hasValidMethod({ method: function () { } })).to.be.false;
        });
    });

    describe('hasValidParams', function () {
        it("should return true when Request doesn't have a params property", function () {
            expect(hasValidParams({})).to.be.true;
        });

        context('when Request has a params property', function () {
            it('should return true when params is an Object', function () {
                expect(hasValidParams({ params: {} })).to.be.true;
            });

            it('should return true when params is an array', function () {
                expect(hasValidParams({ params: [] })).to.be.true;
            });

            it('otherwise should return false', function () {
                expect(hasValidParams({ params: null })).to.be.false;
                expect(hasValidParams({ params: undefined })).to.be.false;
            });
        });
    });

    describe('isNotification', function () {
        it('should return false when Request is invalid', function () {
            expect(isNotification()).to.be.false;
            expect(isNotification({})).to.be.false;
            expect(isNotification(null)).to.be.false;
        });

        context('when Request is valid', function () {
            it("should return true when Request doesn't have an id property", function () {
                delete this.request.id;

                expect(isNotification(this.request)).to.be.true;
            });

            it('should return false when Request has an id property', function () {
                expect(isNotification(this.request)).to.be.false;
            });
        });
    });

    describe('isValid', function () {
        it('should return true when Request is an Object with valid properties', function () {
            expect(isValid(this.request)).to.be.true;
        });

        it('otherwise should return false', function () {
            expect(isValid()).to.be.false;
            expect(isValid([])).to.be.false;
            expect(isValid(null)).to.be.false;
        });
    });
});
