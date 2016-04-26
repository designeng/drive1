export default function caption(item, options) {
    options = options || {mode: 'link'}
    return item.caption.replace(/\{(.*?)\}/, function(match, aText) {
        if(options.mode == 'text') {
            return aText
        } else if (options.mode == 'link') {
            return '<a href="' + item.url + '">' + aText + '</a>';
        }
    })
}