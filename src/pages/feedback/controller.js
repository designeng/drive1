import feedbackPageContent from '../../templates/build/pages/feedback';

function controller(getCarcassFn) {

    let pageContentHtml = feedbackPageContent();

    return {
        html: getCarcassFn(pageContentHtml)
    }
}

export default controller;