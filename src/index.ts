import { Stream, fromEvent, mergeArray } from 'most';
import Dispatcher from '@cotto/action-dispatcher';
import { ActionCreator, EmptyActionCreator, Action } from 'typescript-fsa';
export { Dispatcher };

/**
 * Listen a action with stream.
 *
 * @export
 * @template P
 * @param {(ActionCreator<P> | EmptyActionCreator)} target
 * @param {Dispatcher<any>} src
 * @returns {Stream<P>}
 */
export function listen<P>(target: ActionCreator<P> | EmptyActionCreator, src: Dispatcher<any>): Stream<Action<P>>;
export function listen<T, K extends keyof T>(target: K, src: Dispatcher<T>): Stream<Action<T[K]>>;
export function listen<T, K extends keyof T, P>(target: K | ActionCreator<P> | EmptyActionCreator, src: Dispatcher<T>): Stream<any> {
    const ev = typeof target === 'string' ? target : target.type;
    return fromEvent(ev, src);
}

// ==================================================================
// BootEpics
// ==================================================================
export interface Epic<C, R, A = {}> {
    (event: Dispatcher<A>, context: C): Stream<R>;
}

/**
 * Boostrap epics with dispatcher.
 *
 * @export
 * @template A
 * @template C
 * @template R
 * @param {{
 *     epics: Epic<A, C, R>[],
 *     context: C,
 *     dispatcher?: Dispatcher<A>
 * }} { epics, context, dispatcher = new Dispatcher<A>() }
 * @returns
 */
export function bootEpics<C, R, A = {}>({ epics, context, dispatcher = new Dispatcher<A>() }: {
    epics: Epic<C, R>[],
    context: C,
    dispatcher?: Dispatcher<A>
}) {

    return mergeArray(epics.map(ep => ep(dispatcher, context)));
}
