import _  from 'underscore';
import mainPageSpec           from './pages/main/page.spec';
import newsPageSpec           from './pages/news/page.spec';
import driveTestsPageSpec     from './pages/drive-tests/page.spec';
import videoPageSpec          from './pages/video/page.spec';
import demoPageSpec           from './pages/demo/page.spec';
import brandPageSpec          from './pages/brand/page.spec';
import brandModelPageSpec     from './pages/brand/model/page.spec';

import noopPageSpec           from './pages/noop/page.spec';

import notFoundSpec           from './pages/404/page.spec';

let routesUnderConstruction = [
      'companies',
      'talk',
      'talks',
      'kunst',
      'russia',
      'autosport',
      'spy',
      'business',
      'technic',
      'columns',
      'about',
      'ad',
      'd2b',
      'rewrite',
      'moderation',
      'feedback'
];

const routes = [
      // TODO: handle aliases?
      {
            url: '/',
            routeSpec: mainPageSpec
      },
      {
            url: '/main',
            routeSpec: mainPageSpec
      },
      {
            url: '/news',
            routeSpec: newsPageSpec
      },
      {
            url: '/drive-tests',
            routeSpec: driveTestsPageSpec
      },
      {
            url: '/video',
            routeSpec: videoPageSpec
      },
      {
            url: '/:brand',
            routeSpec: brandPageSpec
      },
      {
            url: '/:brand/models/:year/',
            routeSpec: noopPageSpec
      },
      {
            url: '/:brand/models/:year/:model',
            routeSpec: brandModelPageSpec
      },

      // TODO: complete/remove
      {
            url: '/404error',
            routeSpec: notFoundSpec
      },
      {
            url: '/demo',
            routeSpec: demoPageSpec
      },
];

// _.each(routesUnderConstruction, (item) => {
//       routes.push({
//             url: new RegExp('^\/' + item + '(?:\/(?=$))?$', 'i'),
//             routeSpec: noopPageSpec
//       })
// });

export default routes;
