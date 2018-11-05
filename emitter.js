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

    static parseEvent(event) {
        let events = [];
        if (!event.includes('.')) {
            return [event];
        }
        let parts = event.split('.');
        for (let i = 0; i < parts.length; i++) {
            let arr = parts.slice(0, i + 1);
            events.push(arr.join('.'));
        }
        events = events.reverse();

        return events;
    }
}


/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    let events = new Map();
    function subscribe(eventName, context, handler, expression) {
        if (!events.has(eventName)) {
            events.set(eventName, []);
        }
        let event = new Event(context, handler, expression);
        events.get(eventName).push(event);
    }

    function alwaysAllowed(event, context, handler) {
        subscribe(event, context, handler, () => true);
    }

    function callEvent(event) {
        if (event.isAllowed(event.count)) {
            event.handler.call(event.context);
        }
        event.count += 1;
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
            alwaysAllowed(event, context, handler);

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
            Array.from(events.keys())
                .filter(x => x === event || x.startsWith(event + '.'))
                .forEach(eventName =>{
                    let subscribes = events.get(eventName);
                    events.set(eventName, subscribes.filter(x => x.context !== context));
                });

            return this;

        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object} this
         */
        emit: function (event) {
            let _events = Event.parseEvent(event);
            _events
                .filter(eventName => events.has(eventName))
                .forEach(eventName => {
                    events.get(eventName)
                        .forEach(callEvent);
                });

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
