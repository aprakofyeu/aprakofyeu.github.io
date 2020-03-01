function InvitesPanelController(initializationService, inputsHelper, invitesService, callService, context, eventBroker) {
    var $panel = $(".invites-panel");
    var $implicitFlowWarningPanel = $panel.find("#implicitFlowWarningPanel");
    var $invitesPanel = $panel.find("#invitesPanel");
    var $invitedUsersPanel = $panel.find("#invitedUsersPanel");
    var inputs = inputsHelper.for($invitesPanel);
    var $invitedUserTemplate = $panel.find("#invitedUserTemplate");

    var friendsInfo, initialized = false;

    function getInfoLabel() {
        return "Разослать приглашения в группу <b>" +
            context.targetGroup.name +
            "</b> друзьям, кто не получал его более <b>" +
            context.settings.invitesInterval +
            "</b> дней.";
    }

    function getFriendsInfoLabel(friendsInfo) {
        return "У вас всего <b>" + friendsInfo.friendsCount +
            "</b> друзей.<br/>Из них <b>" + friendsInfo.subscribedCount +
            "</b> уже подписаны в группу <b>" + context.targetGroup.name +
            "</b>.<br/>Возможно пригласить <b>" + friendsInfo.availableToInviteCount +
            "</b>.";
    }

    function hideLoader() {
        $panel.find("#invitesInitialLoader").hide();
        $panel.find("#friendsInfoLoader").hide();
    }

    function showLoader() {
        $panel.find("#friendsInfoLoader").show();
    }

    function showError(error) {
        $panel.find(".summary.fail")
            .html("Ошибка: " + error)
            .show();

        hideLoader();
        $implicitFlowWarningPanel.hide();
        inputs.disable("#inviteButton");
        $invitesPanel.show();
    }

    function refreshImplicitFlowWarning()
    {
        if (context.implicitFlow) {
            $implicitFlowWarningPanel.hide();
        } else {
            $implicitFlowWarningPanel.show();
        }
    }

    function refreshInviteButton() {
        if (context.implicitFlow && friendsInfo && friendsInfo.availableToInviteCount > 0) {
            inputs.enable("#inviteButton");
        } else {
            inputs.disable("#inviteButton");
        }
    }

    function initUi() {
        invitesService.loadFriendsInfo().then(function (result) {
            friendsInfo = result;
            var infoLabel = getFriendsInfoLabel(friendsInfo);
            $panel.find("#friendsInfoLabel").html(infoLabel);
            refreshImplicitFlowWarning();
            refreshInviteButton(friendsInfo);
            hideLoader();
            $invitesPanel.show();
        });
    }

    function refreshUi() {
        if (!initialized) {
            initUi();
            initialized = true;
        }

        $panel.find("#invitesInfoLabel").html(getInfoLabel());
        refreshImplicitFlowWarning();
        refreshInviteButton();
    }

    function appendInvitedUser(user, success) {
        var $user = $invitedUserTemplate.tmpl({ user: user, success: success });
        $invitedUsersPanel.append($user);
    }

    function inviteSuccess(user) {
        appendInvitedUser(user, true);
    }

    function invitationCompleted() {
        hideLoader();

        $panel.find(".summary.info").show();
    }

    function inviteError(user, error) {
        appendInvitedUser(user, false);
        showError(error);
    }

    $panel.find("#switchToImplicitFlow").on("click",
        function () {
            initializationService.goToImplicitFlowAuthenticationStep();
        });


    $panel.find("#inviteButton").on("click",
        function () {
            invitesService.inviteFriends();

            $panel.find("#inviteButton").hide();
            $invitedUsersPanel.show();
            showLoader();
        });

    eventBroker.subscribe(VkAppEvents.showInvites, refreshUi);
    eventBroker.subscribe(VkAppEvents.invitesLoadingError, showError);
    eventBroker.subscribe(VkAppEvents.inviteUserSuccess, inviteSuccess);
    eventBroker.subscribe(VkAppEvents.inviteCompleted, invitationCompleted);
    eventBroker.subscribe(VkAppEvents.inviteError, inviteError);

}