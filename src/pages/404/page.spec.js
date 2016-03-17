import wireDebugPlugin   from 'essential-wire/source/debug';
import requestPlugin     from '../../plugins/api/request';
import _                 from 'underscore';

export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin
    ],

    page: {
        create: {
            module: (page, url) => {
                return page({ items:  'Страница ' + url + ' не найдена'});
            },
            args: [
                () => {}, //noop
                {$ref: 'requestUrl'}
            ]
        }
    }
}