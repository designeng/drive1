import _ from 'underscore';
import Handlebars from 'handlebars';

Handlebars.registerHelper('options', function(array, active, valueTpl) {
    let _valueTpl = Handlebars.compile(valueTpl);
    
    let result = _.map(array, (item) => {
        let selected = item.id == active ? 'selected' : '';
        return '<option value="' + _valueTpl(item) + '" ' + selected + '>' + item.name + '</option>';
    });
    
    return new Handlebars.SafeString(result.join(''));
});