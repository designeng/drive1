import _  from 'underscore';
import mainPageSpec           from './pages/main/page.spec';
import driveTestsPageSpec     from './pages/drive-tests/page.spec';
import videoPageSpec          from './pages/video/page.spec';
import demoPageSpec           from './pages/demo/page.spec';

import noopPageSpec           from './pages/noop/page.spec';

import notFoundSpec           from './pages/404/page.spec';

let routesUnderConstruction = [
      'companies',
      // 'video',
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
]

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
            url: '/drive-tests',
            routeSpec: driveTestsPageSpec
      },
      {
            url: '/video',
            routeSpec: videoPageSpec
      },

      {
            url: '/404error',
            routeSpec: notFoundSpec
      },

      {
            url: '/demo',
            routeSpec: demoPageSpec
      },
]

_.each(routesUnderConstruction, (item) => {
      routes.push({
            url: new RegExp('^\/' + item + '(?:\/(?=$))?$', 'i'),
            routeSpec: noopPageSpec
      })
});

export default routes;
