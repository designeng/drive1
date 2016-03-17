// additionalNav

// <div id="topnav-misc" class="topnav-misc" style="display: none;">
//     <span data-action="topnav.close"><i class="i arr"></i></span>
//     <ul>
//         <li><a href="/kunst">Kunst!</a></li>
//         <li><a href="/russia">Наши дороги</a></li>
//         <li><a href="/autosport">Автоспорт</a></li>
//         <li><a href="/spy">Шпионерия</a></li>
//         <li><a href="/business">Автомобизнес</a></li>
//         <li><a href="/technic">Техника</a></li>
//         <li><a href="/talks">Гостиная</a></li>
//         <li><a href="/columns">Авторские колонки</a></li>
//     </ul>
//     <div class="i"></div>
// </div>



// header

// <div id="header">
//     {{{topControls}}}
//     {{{logo}}}
//     {{! /static/cities }}
//     {{{citySelector}}}
//     {{{nav}}}
// </div>


// body

// {{{adTop}}}
// <div class="spr container-t"></div>
// <div class="hgr container-c site-wrapper-mobile">
//     {{{mobileMenuTrigger}}}
//     {{{header}}}
//     {{{mobileNav}}}
//     {{{additionalNav}}}
//     <div id="container" class="hgr wrapper-mobile">
//         {{! /static/brands }}
//         {{{brandsList}}}
//         {{{page}}}
//         {{{footer}}}
//     </div>
// </div>
// {{{sprContainer}}}
// {{{bottomScripts}}}

// ===================== utils ========================

invariant = x => x

// ===================== / utils ========================

// ===================== pageWrapper (carcass) ========================

@provide({endpoint: '/static/cities'})
citySelector()

header({
    ~ topControls,
    ~ logo,
    ~ citySelector,
    ~ nav
});

@provide({endpoint: '/static/brands'})
brandsList()

body({
    ~ mobileMenuTrigger,
    ~ header,
    ~ mobileNav,
    ~ additionalNav,
    ~ brandsList,
    ~ page,
    ~ footer
})

footer()

+ {{{ sprContainer }}}
+ {{{ bottomScripts }}}

// ===================== / pageWrapper (carcass) ========================

// ===================== pageContent ========================

@provide({endpoint: '/items/top_stories#topNews'})
topNews(~ itemLarge, 2, ~ itemMedium, 4)


@provide({endpoint: '/items/top_stories#mainNews'})
mainNews(~ itemCompact, 9)


@provide({endpoint: '/items/top_videos'})
topVideos(~ videoThumbnail, 4)


@provide({endpoint: '/items/top_blogs'})
topBlogs()

// html -> x -> x
@provide({endpoint: '/content/numbers'})
suggestedReading(invariant)


composeToHtml(~ pageContent)(
    ~ topNews,
    ~ mainNews,
    ~ topVideos,
    ~ topBlogs,
    ~ suggestedReading
)

// ======================= / pageContent ======================




// blogEntry

// {{#if companyName}}
//     <li>
//         <a class="index-com-news-caption" href="/company/{{companyId}}.html">{{companyName}}</a><br>
//         {{{caption}}}
//     </li>
// {{else}}
//     {{#if brandUrl}}
//         {{#if brandName}}
//             <li>
//                 <a class="index-com-news-caption" href="/{{brandUrl}}">{{brandName}}</a><br>
//                 {{{caption}}}
//             </li>
//         {{/if}}
//     {{/if}}
// {{/if}}



// brandsList

// <div class="bnav-w">
//     <div id="bnav" class="bnav hgr">
//         <ul class="bnav-list">
//             {{#each brands}}
//                 <li style="background-position: 0px {{this.backgroundOffset}}px;">
//                     <a class="brand" href="/{{this.id}}">{{this.name}}</a>
//                 </li>
//             {{/each}}
//         </ul>
//         <div class="i"></div>
//     </div>
// </div>




// citySelector

// <div id="city" data-action="citysel.show" title="Выберите город">
//     <span>Москва</span>
//     <i class="i"></i>
// </div>
// <div id="city-sel" style="display: none;">
//     <i class="i" data-action="citysel.close" title="Закрыть"></i>
//     <ul>
//         {{#each cities}}
//             <li data-value="{{this.code}}">{{this.name}}</li>
//         {{/each}}
//     </ul>
// </div>




// footer

// <div class="page-footer">
//     <div class="spr footer-spacer-mobile"></div>
//     <span class="footer-copyright">© 2005–{{currentDate}} ООО «Драйв», свидетельство о регистрации СМИ №ФС77-27653&nbsp;&nbsp;&nbsp;16+</span><br>
//     <div class="viewport-switcher" data-viewport="desktop" id="mobile-switcher">Полная версия сайта</div>
//     <div class="noprint footer-navigation">
//         <ul>
//             <li><a href="/about">О Драйве</a></li>
//             <li><a href="/ad">Размещение рекламы</a></li>
//             <li><a href="/d2b">Драйв для бизнеса</a></li>
//             <li><a href="/rewrite">Перепечатка материалов</a></li>
//             <li><a href="/moderation">Политика модерации</a></li>
//             <li><a href="/feedback">Обратная связь</a></li>
//             <li><a href="#" data-viewport="mobile" id="desktop-switcher" class="viewport-switcher">Мобильная версия</a></li>
//         </ul>
//         Читайте ДРАЙВ в <a href="http://eepurl.com/bPK1R9" onclick="window.open('http://eepurl.com/bPK1R9', 'popupwindow', 'scrollbars=yes,width=550,height=520');return false">почте</a>, <a href=/export/rss.xml>через RSS</a>,
//         <a href="https://www.facebook.com/drive.ru">в Фейсбуке</a>, <a href="https://twitter.com/DriveRussia/">в Твиттере</a>, <a href="https://plus.google.com/+DriveRussia" rel="publisher">в Google+</a> или <a href=https://www.yandex.ru/?add=12217>в Яндексе</a>.
//         {{! TODO: page-footer-totop }}
//     </div>
// </div>




// itemCompact

// <div class="nncard news-item">
//     <a class="news-item-link" href="{{url}}">
//         <img class="news-item-link__image" data-action="zoom" src="{{imageUrl}}" width="115" height="67" alt="">
//         <span class="news-item-link__click-area"></span>
//     </a>
//     <div class="header news-item-caption">
//         {{#if brandName}}
//             {{#if brandUrl}}
//                 <strong class="news-item-caption__category">
//                     <a href="{{brandUrl}}">{{brandName}}</a>
//                 </strong>
//             {{/if}}
//         {{else}}
//             {{#if time}}
//                 <strong class="news-item-caption__category">{{time}}</strong>
//             {{/if}}
//         {{/if}}
//         <h4 class="news-item-caption__text">{{{caption}}}</h4>
//     </div>
// </div>



// itemLarge

// <a href="{{url}}" class="top-news-item ncard ncard-big {{shadowClass}}">
//     <div class="image-wrapper image-wrapper_big">
//         <img class="top-news-item__image" src="{{imageUrl}}" width="460" height="260" alt="">
//     </div>
//     <i class="i vgr"></i>
//     <strong class="top-news-item__caption">
//         {{caption}}
//     </strong>
//     <ins></ins>
// </a>



// itemMed

// <a class="news-item ncard {{shadowClass}}" href="{{url}}">
//     <div class="news-item-link">
//         <img class="news-item-link__image" src="{{imageUrl}}" width="230" height="130">
//     </div>
//     <i class="i"></i>
//     <div class="news-item-caption">
//         <strong class="news-item-caption__text">{{caption}}</strong>
//         <ins></ins>
//     </div>
// </a>




// nav

// <div id="nav">
//     <ul class="spr nav-menu">
//         {{! class: active }}
//         <li><a href="/drive-tests">Наши<br> тест-драйвы</a></li>
//         <li><a href="/companies">Каталог<br> компаний</a></li>
//         <li><a href="/video">Наши<br> видео</a></li>
//         <li><a href="/talk">Форумы<br> и комментарии</a></li>
//         <li><a href="//www.drive2.ru">Сообщество<br>DRIVE2</a></li>
//         <li class="nav-arr" data-action="topnav.misc" style="margin-right: -10px;"><span><i class="i arr"></i></span></li>
//     </ul>
// </div>




// topControls

// <div id="top">
//     <div id="nav-top">
//         <ul>
//             <li><a href="{{loginUrl}}">Войти</a></li>
//             <li><a href="{{signupUrl}}">Регистрация</a></li>
//             <li><a href="//www.drive2.ru/recovery/">Забыли пароль?</a></li>
//         </ul>
//         <ul style="display: none;">
//             <li><a id="nav-top-user" href="//www.drive2.ru/users/">user</a></li>
//             <li><a href="//www.drive2.ru/my/profile/">Профиль</a></li>
//             <li><a href="{{logoutUrl}}">Выход</a></li>
//         </ul>
//     </div>

//     <script>drv.loginInit();</script>

//     {{! /content/special }}
//     {{{specialTitle}}}

//     <form id="site-search" action="/sitesearch/">
//         <input type="text" name="q"><button class="i" type="submit">Найти</button>
//         <input type="hidden" name="cx" value="009724753791916455779:ldzabcymo5c">
//         <input type="hidden" name="ie" value="UTF-8">
//     </form>
// </div>




// videoThumbnail

// <a href="{{url}}" class="vidcard">
//     <span class="thumb">
//         <img class="thumb__image" src="{{imageUrl}}" width="236" alt="">
//         <i class="i"></i>
//     </span>
//     <i class="i ii"></i>
//     <strong class="vidcard-caption">{{caption}}</strong>
// </a>



// main page - (pageContent ?)

// <div class="i clip clip-top"></div>
// <div id="main">
//     <div id="index-top-news" class="top-news-list top-news-list_flipping">
//         {{! /items/top_stories#topNews }}
//         {{{topNews}}}
//     </div>

//     <div id="index-op" class="hgr open-page">
//         <div class="hgr open-page-i cf container-mobile">
//             <div id="index-video">
//                 <h3 class="index-video-header">Видео</h3>
//                 {{! /items/top_videos }}
//                 {{{topVideos}}}
//             </div>

//             <div id="index-news-list" class="news-list">
//                 {{! /items/top_stories#mainNews }}
//                 {{{mainNews}}}
//                 <div class="show-more-link"><a class="index-news-list-more" href="/news/">Посмотреть больше новостей</a></div>
//                 {{{adMobile}}}
//             </div>

//             <div id="index-com-news">
//                 <h3>Блоги компаний<ins></ins></h3>
//                 <ul>
//                     {{! /items/top_blogs }}
//                     {{{topBlogs}}}
//                 </ul>
//             </div>
//         </div>
//     </div>
//     <div class="i clip clip-bottom"></div>
//     <div class="spr open-page-bottom"></div>
//     <script>
//         drv.idxFix();
//     </script>
//     {{! /content/numbers }}
//     {{{suggestedReading}}}
//     {{{adBottom}}}
// </div>




// ------------------

// brandFilter

// <div class="testdrives-nav">
//     <select onchange="document.location.href=this.options[this.selectedIndex].value">
//         <option value="/drive-tests/">Все марки</option>
//         {{#each brands}}
//             <option value="/{{this.id}}/drive-tests/">{{this.name}}</option>
//         {{/each}}
//     </select>
// </div>