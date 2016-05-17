import _ from 'underscore';
import chalk from 'chalk';
import mainPageSpec from './pages/main/page.spec';
import categoryNewsPageSpec from './pages/categoryNews/page.spec';
import driveTestsPageSpec from './pages/driveTests/page.spec';
import videoPageSpec from './pages/video/page.spec';
import brandPageSpec from './pages/brand/page.spec';
import brandModelPageSpec from './pages/brand/model/page.spec';
import modelConfigurationPageSpec from './pages/brand/model/configuration/page.spec';
import articlePageSpec from './pages/article/page.spec';
import companiesPageSpec from './pages/companies/page.spec';
import feedbackPageSpec from './pages/feedback/page.spec';
import talkPageSpec from './pages/talk/page.spec';

import noopPageSpec from './pages/noop/page.spec';

import notFoundSpec from './pages/404/page.spec';

import receptionSpec from './reception.spec';

const success = (response) => {
      return (context) => {
            response.status(200).end(context.body.html);
      }
}

const successReception = (response) => {
      return (context) => {
            const {userid, login, email} = context.userProfileData;

            console.log("userid, login, email", userid, login, email);
            
            response.cookie('userid', userid);
            response.cookie('login', login);
            response.cookie('email', email);

            response.redirect(context.targetUrl);
      }
}

const error = (response) => {
      return (error) => {
            console.log(chalk.red("error:::::", error));
            response.status(500).end(error)
      }
}

let routesUnderConstruction = [
      'talk',
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
      {
            url: '/',
            routeSpec: mainPageSpec,
      },
      {
            url: '/404error',
            routeSpec: notFoundSpec
      },
      {
            url: '/drive-tests',
            routeSpec: driveTestsPageSpec,
      },
      {
            url: '/video',
            routeSpec: videoPageSpec,
      },
      {
            url: '/feedback',
            routeSpec: feedbackPageSpec,
      },
      {
            url: '/talk',
            routeSpec: talkPageSpec,
      },
      {
            url: '/talk/company/:talkCompanyId',
            routeSpec: talkPageSpec,
      },
      {
            url: '/talk/:theme',
            routeSpec: talkPageSpec,
      },
      // TODO: talkFirstId & talkSecondId - what they mean exactly?
      {
            url: '/talk/:theme/:talkFirstId',
            routeSpec: talkPageSpec
      },
      {
            url: '/talk/:theme/:talkFirstId/:talkSecondId',
            routeSpec: talkPageSpec
      },
      // /TODO
      {
            url: '/companies',
            routeSpec: companiesPageSpec
      },
      {
            url: '/companies/:brand',
            routeSpec: companiesPageSpec
      },
      {
            url: '/companies/service/:brand',
            routeSpec: companiesPageSpec
      },
      {
            url: '/companies/:sectionFirstId/:sectionSecondId',
            routeSpec: companiesPageSpec
      },
      {
            url: '/blog/company/:blogId',
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
      {
            url: '/brands/:brand/models/:year/:model/:configuration',
            routeSpec: modelConfigurationPageSpec
      },

      // left for backwards compatibility with previous site version,
      // redirect to '/brands/:brand/models/:year/:model' etc.
      {
            url: '/:brand/models/:year/:model'
      },
      {
            url: '/:brand/models/:year/:model/:configuration'
      },
      {
            url: '/:brand/drive-tests'
      },
];

_.each(routes, (route) => {
      _.extend(route, {success, error});
});

_.each(_.keys(footerLinks), (item) => {
      routes.unshift({
            url: new RegExp('^\/' + item + '(?:\/(?=$))?$', 'i'),
            routeSpec: articlePageSpec,
            provide: {
                  nodeId: footerLinks[item]
            },
            success,
            error,
      })
});

routes.unshift({
      url: '/local_reception',
      routeSpec: receptionSpec,
      success: successReception,
      error,
});

export default routes;