import _ from 'underscore';
import providePlugin from '../plugins/api/provide';

export default function provide(config) {
    if(!config) {
        throw new Error('[provideDecorator:] Set up valid config!')
    }
    return (target, name, description) => {
        _.isArray(target.$plugins) ? void 0 : target.$plugins = [];
        target.$plugins.push(providePlugin);

        console.log("description::::", target[name]);

        return {
            value: {
                provide: {
                    endpoint: config.endpoint,
                    what: config.what
                }
            }
        }
    }
}

// TODO
export function preprocess(config) {
    if(!config) {
        throw new Error('[preprocessDecorator:] Set up valid config!')
    }
    return (target, name, description) => {
        return {
            value: 123
        }
    }
}