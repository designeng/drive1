import CryptoJS from 'crypto-js';

// TODO: url - uri consistency
export default function receptionUrl(requestUrl) {
    let uri = "https://dev.drive.ru/api.php?mode=login&url=http://dev.drive.ru" + requestUrl;
    let hash = CryptoJS.SHA1(uri, "HXPu05QUBDAwdC7W0SPvwpYwBQAlZrqAIsCsS1p");

    return "https://www.drive2.ru/reception/?dr_hash=" + hash + "&dr_url=" + encodeURI(uri);
}