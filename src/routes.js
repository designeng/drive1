import homePageSpec from './pages/home/page.spec';
import demoPageSpec from './pages/demo/page.spec';

import notFoundSpec from './pages/404/page.spec';

const routes = [
      {   
            url: '/home', 
            routeSpec: homePageSpec
      },
      {   
            url: '/demo', 
            routeSpec: demoPageSpec
      },
      {   
            url: '/404error', 
            routeSpec: notFoundSpec
      }
]

export default routes;
