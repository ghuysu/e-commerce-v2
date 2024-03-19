'use strict'

const _ = require('lodash')

const getInfoData = ({fields = [], object = {}}) => {
    return _.pick(object, fields)
}

const getSelectData = (select = []) => {
    return Object.fromEntries(select.map(e => [e, 1]))
}

const unGetSelectData = (select = []) => {
    return Object.fromEntries(select.map(e => [e, 0]))
}

const removeUndefinedObject = (obj) => {
    Object.keys(obj).forEach(k => {
        if(obj[k] == null || obj[k] == undefined){
            delete obj[k]
        }
    })

    return obj
}

const updateNestedObjectParser = obj => {
    const final = {};

    if (!obj || typeof obj !== 'object') {
        return final;
    }

    Object.keys(obj).forEach(k => {
        if (typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
            const response = updateNestedObjectParser(obj[k]);
            Object.keys(response).forEach(a => {
                final[`${k}.${a}`] = response[a];
            });
        } else {
            final[k] = obj[k];
        }
    });

    return final;
};

module.exports = {
    getInfoData,
    getSelectData,
    unGetSelectData,
    removeUndefinedObject,
    updateNestedObjectParser
}