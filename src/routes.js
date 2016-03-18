import mainPageSpec           from './pages/main/page.spec';
import driveTestsPageSpec     from './pages/drive-tests/page.spec';
import demoPageSpec           from './pages/demo/page.spec';

import notFoundSpec           from './pages/404/page.spec';

const routes = [
      {   
            url: '/main', 
            routeSpec: mainPageSpec
      },
      {   
            url: '/drive-tests', 
            routeSpec: driveTestsPageSpec
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
