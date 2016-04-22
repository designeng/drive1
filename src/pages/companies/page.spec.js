import wireDebugPlugin   from 'essential-wire/source/debug';
import requestPlugin        from '../../plugins/api/request';

import { getEndpoint } from '../../config/api';

import controller from './controller';

export default {
    $plugins: [
        // wireDebugPlugin,
        requestPlugin,
    ],

    cityData: {
        create: {
            module: (city) => {
                return city ? city : {id: 2191}
            },
            args: [
                {$ref: 'city'}
            ]
        }
    },

    companiesPageEndpoint: {
        create: {
            module: (brand, city) => {
                let rawEndpoint = brand ? getEndpoint('companiesBrandPage', {brand: brand.id}, {mode: 'raw'}) : getEndpoint('companiesPage', null, {mode: 'raw'});
                return [rawEndpoint, {city: city.id, raw: true}];
            },
            args: [
                {$ref: 'brand'},
                {$ref: 'cityData'}
            ]
        }
    },

    companiesPageData: {
        request: {
            endpoint: {$ref: 'companiesPageEndpoint'},
        }
    },

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'companiesPageData'},
                {$ref: 'getCarcassFn'}
            ]
        }
    }
}