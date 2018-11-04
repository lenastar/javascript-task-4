'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
const isStar = true;

class Event {
    constructor(context, handler, expression) {
        this.context = context;
        this.handler = handler;
        this.count = 0;
        this.isAllowed = expression;
    }
}

function parseEvent(event) {
    let events = [event];
    if (!event.includes('.')) {
        return events;
    }
    let current = event;
    let lastIndex = current.lastIndexOf('.');
    while (lastIndex > -1) {
        current = current.slice(0, lastIndex);
        events.push(current);
        lastIndex = current.lastIndexOf('.');
    }

    return events;
}


/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    let events = new Map();
    function subscribe(event, context, handler, expression) {
        if (!events.has(event)) {
            events.set(event, []);
        }
        let _event = new Event(context, handler, expression);
        events.get(event).push(_event);
    }

    return {

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Object} this
         */
        on: function (event, context, handler) {
            console.info(event, context, handler);
            subscribe(event, context, handler, () => true);

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object} this
         */
        off: function (event, context) {
            console.info(event, context);
            let subscribes = Array.from(events.keys())
                .filter(x => x.includes(event));
            subscribes.forEach(el =>{
                if (events.has(el)) {
                    events.set(el, events.get(el).filter(x => x.context !== context));
                }
            });

            return this;

        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object} this
         */
        emit: function (event) {
            let _events = parseEvent(event);
            for (let i of _events) {
                if (events.has(i)) {
                    events.get(i).forEach(x => {
                        if (x.isAllowed(x.count)) {
                            x.handler.call(x.context);
                        }
                        x.count += 1;
                    });
                }
            }

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object} this
         */
        several: function (event, context, handler, times) {
            if (times < 1) {
                this.on(event, context, handler);
            }
            subscribe(event, context, handler, count => count < times);

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object} this
         */
        through: function (event, context, handler, frequency) {
            console.info(event, context, handler, frequency);
            if (frequency < 1) {
                this.on(event, context, handler);
            }
            subscribe(event, context, handler, count => count % frequency === 0);

            return this;
        }
    };
}

module.exports = {
    getEmitter,

    isStar
};
