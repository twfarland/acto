

const head = document.getElementsByTagName('head')[0]
var uuid = 0;

export function jsonp (url: string, data: any, done) {

    uuid++;

    const cback = "jsonp__" + uuid;
    url += (url.match(/\?/) ? '&' : '?') + 'callback=' + cback;
    
    window[cback] = data => {
        done(data)
        head.removeChild(script);
        delete window[cback];
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    
    head.appendChild(script);
}
 