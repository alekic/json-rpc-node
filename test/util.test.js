'use strict';

const { expect } = require('chai');
const { isEmpty, isObject } = require('../lib/util');

describe('util', function () {
    describe('isEmpty', function () {
        it('should return true when value is null', function () {
            expect(isEmpty(null)).to.be.true;
        });

        it('should return true when value is undefined', function () {
            expect(isEmpty()).to.be.true;
        });

        it('should return true when value is a zero-length string', function () {
            expect(isEmpty('')).to.be.true;
        });

        it('should return true when value is a zero-length array', function () {
            expect(isEmpty([])).to.be.true;
        });

        it('otherwise should return false', function () {
            expect(isEmpty(false)).to.be.false;
            expect(isEmpty(' ')).to.be.false;
            expect(isEmpty(0)).to.be.false;
            expect(isEmpty([0])).to.be.false;
            expect(isEmpty({})).to.be.false;
        });
    });

    describe('isObject', function () {
        it('should return true when value is an Object', function () {
            expect(isObject({})).to.be.true;
        });

        it('otherwise should return false', function () {
            expect(isObject([])).to.be.false;
            expect(isObject(null)).to.be.false;
            expect(isObject()).to.be.false;
            expect(isObject(false)).to.be.false;
        });
    });
});
