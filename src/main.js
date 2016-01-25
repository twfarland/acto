import { create, fromPromise, fromDomEvent, fromInterval } from './create'
import { listen, send } from './interact'
import { map, filter, dropRepeats, fold, merge, sampleOn, slidingWindow } from './transform'

// ---------- export

const Main = { 
	create, fromPromise, fromDomEvent, fromInterval, 
	listen, send, 
	map, filter, dropRepeats, fold, merge, sampleOn, slidingWindow 
}

export default Main
