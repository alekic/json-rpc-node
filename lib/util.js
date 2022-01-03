'use strict';

module.exports = {
    isEmpty: function (value) {
        return (value == null)
            || (value === '')
            || (Array.isArray(value) && value.length === 0);
    },

    isObject: function (value) {
        return toString.call(value) === '[object Object]';
    }
};
