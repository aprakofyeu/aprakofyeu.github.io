function CaptchaService() {
    return {
        handle: function (error, success, fail) {
            if (error.error_code === 14) {
                var dialog = $("#captchaDialog").dialog({
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
                            dialog.dialog("close");
                        },
                        "Отмнена": function () {
                            fail();
                            dialog.dialog("close");
                        }
                    }
                });

                return;
            }

            fail();
        }
    };
}