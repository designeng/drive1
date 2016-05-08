import wireDebugPlugin from 'essential-wire/source/debug';
import requestPlugin from '../../plugins/api/request';

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
            module: (brand, sectionFirstId, sectionSecondId, city) => {
                console.log("sectionFirstId, sectionSecondId::::", sectionFirstId, sectionSecondId);
                
                brand = brand ? brand.id : null;
                city = city.id;
                let rawEndpoint = getEndpoint('companiesPage', {brand, city}, {mode: 'raw'});
                return [rawEndpoint, {raw: true}];
            },
            args: [
                {$ref: 'brand'},
                {$ref: 'sectionFirstId'},
                {$ref: 'sectionSecondId'},
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