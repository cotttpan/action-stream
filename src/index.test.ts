import { bootEpics, Dispatcher, listen, Epic as _Epic } from './index';
import { actionCreatorFactory } from 'typescript-fsa';

const createAction = actionCreatorFactory();
const a1 = createAction<number>('a1');
const a2 = createAction<number>('a2');

interface ActionMap {
    a3: number;
    a4: string;
}

type Epic = _Epic<ActionMap, { str: string, done: Function }, boolean>;

const dispatcher = new Dispatcher<ActionMap>();

test('listen a action creator', (done) => {
    expect.assertions(4);

    const e1: Epic = (ev, ctx) => listen(a1, ev)
        .tap(() => expect(ev).toBe(dispatcher))
        .tap(x => expect(typeof x).toBe('number'))
        .tap(() => expect(ctx.str).toBe('xxx'))
        .tap(x => ctx.next(a2(x * 10)))
        .constant(true);

    const e2: Epic = (ev, ctx) => listen(a2, ev)
        .tap(x => expect(x).toBe(10))
        .constant(true)
        .tap(() => ctx.done());

    const usecase$ = bootEpics({
        epics: [e1, e2],
        context: { str: 'xxx', done },
        dispatcher
    });

    usecase$.drain();
    dispatcher.dispatch(a1(1));
});


test('listen a action name', (done) => {
    expect.assertions(2);

    const e3: Epic = (ev, { next }) => listen('a3', ev)
        .tap(x => expect(x).toBe(1))
        .tap(x => next('a4', String(x)))
        .constant(true);

    const e4: Epic = (ev, ctx) => listen('a4', ev)
        .tap(x => expect(x).toBe('1'))
        .constant(true)
        .tap(() => ctx.done());

    const usecase$ = bootEpics({
        epics: [e3, e4],
        context: { str: 'xxx', done },
        dispatcher
    });

    usecase$.drain();
    dispatcher.dispatch('a3', 1);
});
