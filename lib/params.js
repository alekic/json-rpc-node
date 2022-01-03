'use strict';

const JsonRpcError = require('./error');
const { isObject } = require('./util');

function argumentify(args, params) {
    if (Array.isArray(args)) {
        return args.slice();
    }

    if (!isObject(args)) {
        return [];
    }

    return params.map(param => args[param.name]);
}

function validate(args, params) {
    for (const [index, param] of params.entries()) {
        const arg = args[index];
        const argType = typeOf(arg);
        const isRequired = param.required !== false;

        if (isRequired && (arg === undefined)) {
            throw JsonRpcError.InvalidParams({
                details: `Parameter '${param.name}' is required.`
            });
        }

        if (param.type &&
            arg !== undefined &&
            argType !== param.type
        ) {
            throw JsonRpcError.InvalidParams({
                details: `Invalid type for parameter '${param.name}': ` +
                    `expected '${param.type}' but received '${argType}'.`
            });
        }
    }
}

function typeOf(value) {
    return Array.isArray(value) ? 'array' : typeof value;
}

module.exports = {
    argumentify,
    validate
};
