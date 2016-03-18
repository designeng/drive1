import mainPageSpec from './pages/main/page.spec';
import demoPageSpec from './pages/demo/page.spec';

import notFoundSpec from './pages/404/page.spec';
import testPageSpec from './pages/test/page.spec';

const routes = [
      {   
            url: '/main', 
            routeSpec: mainPageSpec
      },
      {   
            url: '/demo', 
            routeSpec: demoPageSpec
      },
      {   
            url: '/404error', 
            routeSpec: notFoundSpec
      },
      {   
            url: '/test', 
            routeSpec: testPageSpec
      }
]

export default routes;
