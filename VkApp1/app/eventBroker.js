function Event() {
    this.handlers = [];
}

Event.prototype = {
    Subscribe: function(handler, context) {
        var that = this;
        if (!context) {
            context = this;
        }
        if (typeof handler === "function") {
            this.handlers.push({
                handler: handler,
                context: context
            });
            return function() {
                that.Unsubscribe(handler, context);
            };
        }
    },

    Unsubscribe: function(handler, context) {
        if (!handler) {
            this.UnsubscribeAll();
        }
        var index = this.handlers.length,
            i;
        for (i = 0; i < this.handlers.length; i += 1) {
            if (this.HandlerMatches(i, handler, context)) {
                index = i;
                break;
            }
        }
        this.handlers.splice(index, 1);
    },

    HandlerMatches: function(index, handler, context) {
        if (context) {
            if (this.handlers[index].handler === handler && this.handlers[index].context === context) {
                return true;
            }
        } else {
            if (this.handlers[index].handler === handler) {
                return true;
            }
        }
        return false;
    },

    UnsubscribeAll: function() {
        delete this.handlers;
        this.handlers = [];
    },

    Raise: function() {
        var i;
        for (i = 0; i < this.handlers.length; i += 1) {
            this.handlers[i].handler.apply(this.handlers[i].context, arguments);
        }
    }
};


function EventBroker(eventSet) {
    var self = this, eventName, key;
    this.eventMap = {};
    for (key in eventSet) {
        if (eventSet.hasOwnProperty(key)) {
            eventName = eventSet[key];
            self.eventMap[eventName] = new Event();
        }
    }
}

EventBroker.prototype = {
    publish: function (eventName) {
        var eventArgs = Array.prototype.slice.call(arguments, 1);

        Event.prototype.Raise.apply(this.eventMap[eventName], eventArgs);
    },
    subscribe: function (eventName, handler, context) {
        this.eventMap[eventName].Subscribe(handler, context);
    },
    unsubscribe: function (eventName, handler, context) {
        this.eventMap[eventName].Unsubscribe(handler, context);
    }
};