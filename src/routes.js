import _  from 'underscore';
import mainPageSpec           from './pages/main/page.spec';
import categoryNewsPageSpec   from './pages/categoryNews/page.spec';
import driveTestsPageSpec     from './pages/driveTests/page.spec';
import videoPageSpec          from './pages/video/page.spec';
import demoPageSpec           from './pages/demo/page.spec';
import brandPageSpec          from './pages/brand/page.spec';
import brandModelPageSpec     from './pages/brand/model/page.spec';
import articlePageSpec        from './pages/article/page.spec';
import companiesPageSpec      from './pages/companies/page.spec';

import noopPageSpec           from './pages/noop/page.spec';

import notFoundSpec           from './pages/404/page.spec';

let routesUnderConstruction = [
      'companies',
      'talk',
      'talks',
      'feedback'
];

let footerLinks = {
      'about'     : '4efbb68409b6028e21000009',
      'ad'        : '4efbc1bd09b6026721000015',
      'd2b'       : '4f01afda09b602e35300001e',
      'rewrite'   : '4efbc00d09b6026721000014',
      'moderation': '4f10c30409b602e449000000',
};

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
            url: '/companies',
            routeSpec: companiesPageSpec
      },
      {
            url: '/companies/:brand',
            routeSpec: companiesPageSpec
      },
      // page with news list for given category
      {
            url: '/:category',
            routeSpec: categoryNewsPageSpec
      },
      
      {
            url: '/news/:brand',
            routeSpec: categoryNewsPageSpec
      },
      {
            url: '/brands/:brand',
            routeSpec: brandPageSpec
      },
      {
            url: '/brands/:brand/drive-tests',
            routeSpec: driveTestsPageSpec
      },
      {
            url: '/brands/:brand/models/:year/',
            routeSpec: noopPageSpec
      },
      {
            url: '/brands/:brand/models/:year/:model',
            routeSpec: brandModelPageSpec
      },

      // left for backwards compatibility with previous site version, 
      // redirect to '/brands/:brand/models/:year/:model' etc.
      {
            url: '/:brand/models/:year/:model'
      },
      {
            url: '/:brand/drive-tests'
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

_.each(_.keys(footerLinks), (item) => {
      routes.unshift({
            url: new RegExp('^\/' + item + '(?:\/(?=$))?$', 'i'),
            routeSpec: articlePageSpec,
            provide: {
                  articleId: footerLinks[item]
            }
      })
});

export default routes;