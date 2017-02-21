import { 
    Signal, 
    fromCallback, 
    fromDomEvent, 
    map, 
    filter,
    debounce,
    dropRepeats,
    flatMapLatest,
    listen
} from '../../src/index'
import { jsonp } from '../utils'

type Result = [string, string[]];

function searchWikipedia (term: string): Signal<Result> {
  return fromCallback<Result>(resolve =>
      jsonp('https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=' + term, {}, resolve)
  );
}

const input   = document.getElementById('textInput');
const results = document.getElementById('results');

// Get all distinct key up events from the input and only fire if long enough and distinct
const keyup: Signal<string> = dropRepeats( // Only if the value has changed
    debounce(
        filter(
            text => text.length > 2, // Only if the text is longer than 2 characters
            map(
                evt => evt.target.value.trim(), // Project the text from the input
                fromDomEvent(input, 'keyup')
            )
        ),
        750 // Pause for 750ms
    )
);

listen(keyup, c => console.log(c))

const searcher: Signal<Result> = flatMapLatest(searchWikipedia, keyup);

listen<Result>(searcher, result => {
    if (result instanceof Error) {
        results.innerHTML = '<li>' + result.message + '</li>';
    } else {
        results.innerHTML = result[1].map(v => '<li>' + v + '</li>').join('');
    }
});
