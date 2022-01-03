'use strict';

const { expect } = require('chai');
const JsonRpcError = require('../lib/error');
const { argumentify, validate } = require('../lib/params');

describe('params', function () {
    describe('argumentify', function () {
        it('should return shallow copy of args when args is an array', function () {
            expect(argumentify([1, 2, 3])).to.deep.equal([1, 2, 3]);
        });

        it('should return empty array when args is not an Object', function () {
            expect(argumentify()).to.deep.equal([]);
            expect(argumentify(0)).to.deep.equal([]);
            expect(argumentify('')).to.deep.equal([]);
            expect(argumentify(new Date())).to.deep.equal([]);
        });

        it('otherwise should convert args to an array', function () {
            const args = { age: 42, name: 'John' };
            const params = [
                { name: 'name' },
                { name: 'phone' }
            ];

            expect(argumentify(args, params)).to.deep.equal(['John', undefined]);
        });
    });

    describe('validate', function () {
        it('should throw when required parameter is undefined', function () {
            const args = [undefined];
            const params = [
                { name: 'name', required: true }
            ];

            expect(() => validate(args, params))
                .to.throw(JsonRpcError, 'Invalid params')
                .with.nested.property('data.details',
                    "Parameter 'name' is required."
                );
        });

        it('should throw when parameter type is invalid', function () {
            const args = ['John', ['red'], 12356];
            const params = [
                { name: 'name' },
                { name: 'colors', type: 'array', required: false },
                { name: 'phone', type: 'string' }
            ];

            expect(() => validate(args, params))
                .to.throw(JsonRpcError, 'Invalid params')
                .with.nested.property('data.details',
                    "Invalid type for parameter 'phone': " +
                    "expected 'string' but received 'number'."
                );
        });
    });
});
