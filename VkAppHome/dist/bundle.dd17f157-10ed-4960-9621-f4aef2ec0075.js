function VkApp() {
    //dependency injection region

    var urlHelper = new UrlHelper();
    var captchaService = new CaptchaService();
    var eventBroker = new EventBroker();
    var context = new AppContext(eventBroker);
    var settingsController = new SettingsController(context);
    var callService = new CallService(context, captchaService);
    var filtersController = new FiltersController(urlHelper, eventBroker);
    var searchService = new SearchService(callService, eventBroker);
    var resultsController = new ResultsController(context, eventBroker);
    var formatter = new MessagesFormatter();
    var progressBar = new MessageProgressBar(context);
    var messageSender = new MessageSender(context, callService, formatter, progressBar, eventBroker);
    var messagesController = new MessagesController(formatter, messageSender, formatter, urlHelper, eventBroker);

    //end dependency injection


    return {
        init: function (authResponseUrl) {
            var that = this;
            var authParameters = urlHelper.parseUrlParameters(authResponseUrl);

            if (!authParameters) {
                alert("Не введен, либо введен неверный авторизационный токен.");
                return;
            }

            VK.init({
                apiId: 6757014
            });

            this.userId = authParameters["user_id"];
            callService.init(authParameters["access_token"]);

            callService.call('users.get', { user_ids: this.userId })
                .then(function (response) {
                    that.user = response[0];
                    $(".initialization").hide();
                    $(".app").show();
                    eventBroker.publish(VkAppEvents.authenticationCompleted, that.user);
                });
        }
    };
}


function AppContext(eventBroker) {
    var context = {
        settings: {
            messagesInterval: 10,
            debugMode: false
        }
    };

    eventBroker.subscribe(VkAppEvents.authenticationCompleted, function (user) {
        context.user = user;
        context.searchResult = {};
    });

    eventBroker.subscribe(VkAppEvents.searchCompleted, function (users) {
        context.searchResult.users = users;
    });

    return context;
}
function CallService(context, captchaService) {
    function handleError(error, method, params, deferred) {
        if (error.error_code === 14) {
            captchaService.handle(error, function (captcha) {
                params["captcha_sid"] = captcha.sid;
                params["captcha_key"] = captcha.key;

                call(method, params, deferred);
            }, function () {
                deferred.reject(error.error_msg);
            });

            return;
        }

        deferred.reject(error.error_msg);
    }

    function call(method, params, deferred) {
        VK.Api.call(method, params, function (r) {
            if (r.response) {
                deferred.resolve(r.response);
                return;
            }

            if (r.error) {
                handleError(r.error, method, params, deferred);
            }
        });
    }

    return {
        init: function (accessToken) {
            this.accessToken = accessToken;
        },

        call: function (method, parameters) {
            var params = $.extend(parameters, { v: "5.73" });
            var deferred = new $.Deferred();

            if (VK._session) {
                VK._session.sid = this.accessToken;
            }

            if (context.settings.debugMode && method === "messages.send") {
                setTimeout(function () { deferred.resolve(); }, 1000);
            } else {
                call(method, params, deferred);
            }

            return deferred.promise();
        }
    };
}
function CaptchaService() {
    return {
        handle: function (error, success, fail) {
            if (error.error_code === 14) {
                var $dialog = $("#captchaDialog").dialog({
                    modal: true,
                    title: "Введите капчу:",
                    open: function (event, ui) {
                        $(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
                        $(this).find(".captcha-img").attr("src", error.captcha_img);
                        $(this).find("#captchaInput").val("");
                    },
                    buttons: {
                        "Ok": function () {
                            var captchakey = $(this).find("#captchaInput").val();
                            success({ sid: error.captcha_sid, key: captchakey });
                            $dialog.dialog("close");
                        },
                        "Отмнена": function () {
                            fail();
                            $dialog.dialog("close");
                        }
                    }
                });

                return;
            }

            fail();
        }
    };
}
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

function EventBroker() {
    var self = this, eventName, key;
    this.eventMap = {};
    for (key in VkAppEvents) {
        if (VkAppEvents.hasOwnProperty(key)) {
            eventName = VkAppEvents[key];
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
function FiltersController(urlHelper, eventBroker) {
    var $panel;

    function getPostParams() {
        return urlHelper.parseWallUrl($panel.find("#postId").val());
    }

    function getSubscribedGroupId() {
        return urlHelper.getPublicId($panel.find("#subscriptionInput").val());
    }

    function isChecked(checkboxSelector) {
        return $panel.find(checkboxSelector)[0].checked;
    }

    function markAsInvalid(selector) {
        $panel.find(selector).addClass("invalid");
    }

    function buildSearchParameters() {
        var parameters = {
            postInfo: getPostParams(),
            hits: parseInt($panel.find("#hitsCount").val())
        };

        if (isChecked("#withoutConversationsWithMe")) {
            parameters.withoutConversationsWithMe = true;
        }

        if (isChecked("#canSendMessage")) {
            parameters.canSendMessageOnly = true;
        }

        if (isChecked("#subscriptionEnabledCheckbox")) {
            parameters.notSubscribedToPublic = getSubscribedGroupId();
        }

        return parameters;
    }


    function initView() {
        $panel = $(".panel.filter");

        function refreshRowForCheckbox($checkbox) {
            var row = $checkbox.closest(".row");
            if ($checkbox[0].checked) {
                row.removeClass("disabled");
            } else {
                row.addClass("disabled");
            }
        }

        function isValid() {
            if (!getPostParams()) {
                markAsInvalid("#postId");
                return false;
            }

            if (isChecked("#withoutConversationsWithMe") && !getSubscribedGroupId()) {
                markAsInvalid("#subscriptionInput");
            }

            return true;
        }

        function initRowDisabling(checkboxId) {
            var $checkbox = $panel.find("#" + checkboxId);
            refreshRowForCheckbox($checkbox);
            $checkbox.on("change", function () {
                refreshRowForCheckbox($checkbox);
            });
        }

        initRowDisabling("subscriptionEnabledCheckbox");
        initRowDisabling("withoutConversationsWithMe");
        initRowDisabling("canSendMessage");

        $panel.find("input").on("change", function() {
            $(this).removeClass("invalid");
        });

        $panel.find("#searchButton").on("click",
            function () {
                if (isValid()) {
                    var searchParameters = buildSearchParameters();
                    eventBroker.publish(VkAppEvents.search, searchParameters);
                }
            });
    }

    initView();
}
function MessageProgressBar(context) {
    var $dialog;

    function getTitle() {
        var title = "Отправка сообщений:";
        if (context.settings.debugMode) {
            title += " (DEBUG MODE - эмуляция)";
        }
        return title;
    }

    return {
        init: function (users, cancelCallback) {
            $dialog = $("#messagesProgressDialogTemplate").tmpl().dialog({
                modal: true,
                width: 500,
                title: getTitle(),
                open: function (event, ui) {
                    $(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
                    var $progressbar = $(this).find("#progressbar").progressbar({
                        max: users.length,
                        value: 0,
                        change: function () {
                            $(this).find(".progress-label").text("Отправлено " + $progressbar.progressbar("value") + " из " + users.length + " сообщений.");
                        },
                        complete: function () {
                            $(this).find(".progress-label").text("Все сообщения успешно отправлены!");
                        }
                    });
                },
                buttons: {
                    "Стоп!": function () {
                        cancelCallback();
                    }
                }
            });
        },

        increase: function () {
            var $progressbar = $dialog.find("#progressbar");
            var val = $progressbar.progressbar("value") || 0;
            $progressbar.progressbar("value", val + 1);
        },

        finish: function (error) {
            if (error) {
                $dialog.find(".summary").text(error).show();
            }
            $dialog.dialog('option', 'buttons', { "Закрыть": function () { $dialog.dialog("destroy"); } });
        }

    };
}
function MessagesController(formatter, messageSender, formatter, urlHelper, eventBroker) {
    var $panel = $(".message-panel");
    var $textarea = $panel.find("#message");
    var $attachments = $panel.find("#attachments");

    function getMessage() {
        var message = $textarea.val();
        if (!message) {
            alert("Введите сообщение!");
        }
        return message;
    }

    function getAttachments() {
        var attachments = [];
        $attachments.find(".attachment").each(function () {
            attachments.push($(this).attr("attachment-id"));
        })
        return attachments;
    }

    function sendMessage(send) {
        var message = getMessage();
        if (message) {
            var attachments = getAttachments();
            send(message, attachments);
        }
    };

    $panel.find("#sendMessageButton").on("click",
        function () {
            sendMessage(function (message, attachments) {
                messageSender.sendToAll(message, attachments);
            });
        });

    $panel.find("#sendMessageToMeButton").on("click",
        function () {
            sendMessage(function (message, attachments) {
                messageSender.sendToMe(message, attachments);
            });
        });

    $panel.find(".first-name").on("click",
        function () {
            formatter.insertAtCaret($textarea[0], formatter.firstNameTag);
        });

    $panel.find(".last-name").on("click",
        function () {
            formatter.insertAtCaret($textarea[0], formatter.lastNameTag);
        });

    function showUrlDialog(title, addAction) {
        var dialog = $("#addByUrlDialog").dialog({
            modal: true,
            width: 600,
            title: title,
            open: function () {
                $(this).find("#photoUrlInput")
                    .val("")
                    .removeClass("invalid")
                    .on("change", function () {
                        $(this).removeClass("invalid");
                    });
            },
            buttons: {
                "Добавить": function () {
                    var $input = $(this).find("#photoUrlInput");
                    var url = $input.val();
                    if (!addAction(url)) {
                        $input.addClass("invalid");
                        return;
                    }
                    dialog.dialog("close");
                },
                "Отмнена": function () {
                    dialog.dialog("close");
                }
            }
        });
    }

    function addAttachment(attachment) {
        $attachments.append($("#attachmentTemplate").tmpl(attachment));
    }

    $panel.find(".attach-photo").on("click",
        function () {
            showUrlDialog("Добавить фото", function (url) {
                var photoInfo = urlHelper.parsePhotoUrl(url);
                if (!photoInfo) {
                    return false;
                }

                var id = formatter.formatAttachmentId("photo", photoInfo);
                var attachment = {
                    id: id,
                    title: "Фото",
                    name: id,
                    url: url
                };

                addAttachment(attachment);
                return true;
            });
        });
    
    $panel.find(".attach-video").on("click",
        function () {
            showUrlDialog("Добавить видео", function (url) {
                var videoInfo = urlHelper.parseVideoUrl(url);
                if (!videoInfo) {
                    return false;
                }

                var id = formatter.formatAttachmentId("video", videoInfo);
                var attachment = {
                    id: id,
                    title: "Видео",
                    name: id,
                    url: url
                };

                addAttachment(attachment);
                return true;
            });
        });

    $attachments.on("click", ".remove-btn", function () {
        $(this).closest(".attachment").remove();
    });

    eventBroker.subscribe(VkAppEvents.searchCompleted, function () {
        $panel.show();
    });

}
function MessageSender(context, callService, formatter, progressBar, eventBroker) {

    function sendMessage(message, attachments, users) {
        var timeout, canceled, deferred;
        attachments = formatter.formatAttachments(attachments);

        function send(users) {
            var user = users[0];
            users = users.slice(1, users.length);
            var formattedMessage = formatter.format(message, user);

            callService.call("messages.send", { user_id: user.id, message: formattedMessage, attachment: attachments })
                .then(function () {
                    progressBar.increase();
                    user.sent = true;
                    eventBroker.publish(VkAppEvents.sendMessageOk, user.id);
                    if (!canceled) {
                        if (users.length > 0) {
                            timeout = setTimeout(function () {
                                send(users, deferred);
                            }, context.settings.messagesInterval * 1000);
                        } else {
                            deferred.resolve();
                        }
                    }
                },
                    function (error) {
                        eventBroker.publish(VkAppEvents.sendMessageFailed, user.id, error);
                        deferred.reject(error);
                    });

            return deferred.promise();
        }

        if (users && users.length > 0) {
            deferred = new $.Deferred();

            progressBar.init(users, function () {
                canceled = true;
                clearTimeout(timeout);
                deferred.reject("Отправка сообщений прервана.");
            });

            send(users).then(function () {
                progressBar.finish();
            }, function (error) {
                progressBar.finish("Во время отправки сообщений что-то пошло не так :(\r\nОшибка: " + error);
            });
        }
    };

    return {
        sendToAll: function (message, attachments) {
            var users = context.searchResult.users.filter(function (user) { return !user.sent; });
            sendMessage(message, attachments, users);
        },

        sendToMe(message, attachments) {
            sendMessage(message, attachments, [context.user]);
        }
    };
}
function MessagesFormatter() {
}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

MessagesFormatter.prototype.firstNameTag = "<FirstName>";
MessagesFormatter.prototype.lastNameTag = "<LastName>";

MessagesFormatter.prototype.format = function (message, user) {
    function wrapBlank(text) {
        return " " + text + " ";
    }

    return message
        .replaceAll(this.firstNameTag, wrapBlank(user.first_name))
        .replaceAll(this.lastNameTag, wrapBlank(user.last_name));
};

MessagesFormatter.prototype.formatAttachmentId = function (type, item) {
    return type + item.ownerId + "_" + item.itemId;
};

MessagesFormatter.prototype.formatAttachments = function (attachments) {
    return attachments ? attachments.join(",") : null;
};

MessagesFormatter.prototype.insertAtCaret = function (txtarea, text) {
    var scrollPos = txtarea.scrollTop;
    var strPos = 0;
    var br = ((txtarea.selectionStart || txtarea.selectionStart === '0') ?
        "ff" : (document.selection ? "ie" : false));
    if (br === "ie") {
        txtarea.focus();
        var range = document.selection.createRange();
        range.moveStart('character', -txtarea.value.length);
        strPos = range.text.length;
    } else if (br === "ff") {
        strPos = txtarea.selectionStart;
    }

    var front = (txtarea.value).substring(0, strPos);
    var back = (txtarea.value).substring(strPos, txtarea.value.length);
    txtarea.value = front + text + back;
    strPos = strPos + text.length;
    if (br === "ie") {
        txtarea.focus();
        var ieRange = document.selection.createRange();
        ieRange.moveStart('character', -txtarea.value.length);
        ieRange.moveStart('character', strPos);
        ieRange.moveEnd('character', 0);
        ieRange.select();
    } else if (br === "ff") {
        txtarea.selectionStart = strPos;
        txtarea.selectionEnd = strPos;
        txtarea.focus();
    }

    txtarea.scrollTop = scrollPos;
};
function ResultsController(context, eventBroker) {
    var $panel = $(".results");

    function renderUsers(users) {
        var $users = $("#usersTemplate").tmpl(users);
        $panel.html($users);
    }

    function getUserStatusPanel(userId) {
        return $panel.find("[user-id=" + userId + "] .status-panel");
    }

    function markAsSent(userId) {
        getUserStatusPanel(userId).append("<div class='ok'></div>");
    }

    function markAsFailed(userId, error) {
        getUserStatusPanel(userId).append("<div class='fail' title='" + error + "'></div>");
    }

    eventBroker.subscribe(VkAppEvents.searchCompleted, function (users) { renderUsers(users); });
    eventBroker.subscribe(VkAppEvents.sendMessageOk, function (userId) { markAsSent(userId); });
    eventBroker.subscribe(VkAppEvents.sendMessageFailed, function (userId, error) { markAsFailed(userId, error); });
}
function SearchService(callService, eventBroker) {
    var that = this;
    that.eventBroker = eventBroker;
    that.callService = callService;

    function initEvents() {
        eventBroker.subscribe(VkAppEvents.search, function (searchParams) { that.search(searchParams); });
    }

    initEvents();
}

SearchService.prototype.search = function (searchParams) {
    function joinUserIds(users) {
        return users.map(function(x) { return x.id }).join(",");
    }

    var that = this;
    that.callService.call("likes.getList",
            {
                type: 'post',
                owner_id: searchParams.postInfo.ownerId,
                item_id: searchParams.postInfo.itemId,
                skip_own: 1,
                count: 100
            })
        .then(function(likes) {
            return that.callService.call("users.get",
                {
                    user_ids: likes.items.join(','),
                    fields: 'photo_50,can_write_private_message'
                });
        })
        .then(function(users) {
            if (searchParams.canSendMessageOnly) {
                users = users.filter(function(x) { return x.can_write_private_message; });
            }
            return users;
        })
        .then(function(users) {
            if (searchParams.withoutConversationsWithMe) {
                return that.callService.call("messages.getConversationsById",
                        {
                            peer_ids: joinUserIds(users)
                        })
                    .then(function(conversations) {
                        var conversationsDict = {};
                        for (var i = 0; i < conversations.items.length; i++) {
                            var conversationInfo = conversations.items[i];
                            if (conversationInfo.in_read || conversationInfo.out_read || conversationInfo.last_message_id) {
                                conversationsDict[conversationInfo.peer.id] = true;
                            }
                        }

                        return users.filter(function(x) { return !conversationsDict[x.id]; });
                    });
            }
            return users;
        })
        .then(function (users) {
            if (searchParams.notSubscribedToPublic) {
                return that.callService.call("groups.isMember",
                    {
                        group_id: searchParams.notSubscribedToPublic,
                        user_ids: joinUserIds(users)
                        })
                    .then(function (results) {
                        var membersDict = {};
                        for (var i = 0; i < results.length; i++) {
                            if (results[i].member) {
                                membersDict[results[i].user_id] = true;
                            }
                        }

                        return users.filter(function (x) { return !membersDict[x.id]; });
                    });
            }

            return users;
        })
        .then(function (users) {
            if (users.length > searchParams.hits) {
                return users.slice(0, searchParams.hits);
            }

            //TODO: if users.length<searchParams.hits && total count > chunk size then call recursive this method to load more results and merge it
            return users;
        })
        .then(function (users) {
            that.eventBroker.publish(VkAppEvents.searchCompleted, users);
        });
};
function SettingsController(context) {
    function updateSettings($dialog) {
        var messagesInterval = parseInt($dialog.find("#timeInterval").val());
        if (messagesInterval) {
            context.settings.messagesInterval = messagesInterval;
        }

        context.settings.debugMode = !!$dialog.find("#debugMode")[0].checked;
    }

    $(".settings-btn").on("click", function () {
        var $dialog = $("#settingsDialogTemplate").tmpl(context.settings).dialog({
            modal: true,
            width: 600,
            title: "Настройки:",
            open: function (event, ui) {
                $(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
            },
            buttons: {
                "Применить": function () {
                    updateSettings($dialog);
                    $dialog.dialog("destroy");
                },
                "Отмнена": function () {
                    $dialog.dialog("destroy");
                }
            }
        });
    });
}
function UrlHelper() {
    function parseUrlParameters(url, delimiter) {
        var paramsRaw = url.split(delimiter)[1].split('&');
        var resultParameters = {};
        for (var i = 0; i < paramsRaw.length; i++) {
            var paramName = paramsRaw[i].split('=');
            resultParameters[paramName[0]] = paramName[1] === undefined ? true : decodeURIComponent(paramName[1]);
        }
        return resultParameters;
    }

    function parseVkItemParameters(type, itemParameters) {
        if (itemParameters.indexOf(type) < 0)
            return null;

        var splittedParams = itemParameters.replace(type, "").split("_");

        return {
            ownerId: splittedParams[0],
            itemId: splittedParams[1].split("/")[0]
        };
    }

    function runSafe(action) {
        try {
            return action();
        } catch (error) {
            return null;
        }
    }

    function parseVkItemUrlSafe(key, type, url) {
        //try to parse from url parameters
        var item = runSafe(function () {
            var parameters = parseUrlParameters(url, "?");
            var itemParametersRaw = parameters[key];
            return parseVkItemParameters(type, itemParametersRaw);
        });

        //try to parse as direct link
        if (!item) {
            item = runSafe(function () {
                var itemParametersRaw = url.split("/").pop();
                return parseVkItemParameters(type, itemParametersRaw);
            });
        }

        return item;
    }

    return {
        parseUrlParameters: function (url) {
            return runSafe(function () {
                return parseUrlParameters(url, "#");
            });
        },

        parseWallUrl: function (url) {
            return parseVkItemUrlSafe("w", "wall", url);
        },

        parsePhotoUrl: function (url) {
            return parseVkItemUrlSafe("z", "photo", url);
        },

        parseVideoUrl: function (url) {
            return parseVkItemUrlSafe("z", "video", url);
        },

        getPublicId: function (publicUrl) {
            return runSafe(function () {
                var splitted = publicUrl.split("/");
                var publicId = splitted[splitted.length - 1];

                if (publicId.indexOf("club") === 0) {
                    publicId = publicId.replace("club", "");
                }

                return publicId;
            });
        }
    };
}

VkAppEvents = {
    authenticationCompleted: "authenticationCompleted",

    search: "search",
    searchCompleted: "searchCompleted",

    sendMessageOk: "sendMessageOk",
    sendMessageFailed: "sendMessageFailed"
};
