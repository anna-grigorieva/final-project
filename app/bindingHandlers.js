define(['knockout', 'moment', 'jquery', 'jqueryui', 'ckeditor'], function (ko, moment, $) {
    ko.bindingHandlers.selectDate = {
        init: function (element, valueAccessor) {
            var value = valueAccessor();
            $(element).datepicker({
                'dateFormat': 'mm/dd/yy',
                'onSelect': function () {
                    value($(this).datepicker("getDate"));
                }
            });
        },
        update: function (element, valueAccessor) {
            var value = valueAccessor();
            if (value()) {
                $(element).datepicker("setDate", new Date(value()));
                value($(element).datepicker("getDate"));
            }
        }
    };
    ko.bindingHandlers.texteditor = {
        init: function (element, valueAccessor) {
            var value = valueAccessor();

            CKEDITOR.replace($(element).attr('id'));
            value(CKEDITOR.instances.editor);
        }
    };
    ko.bindingHandlers.popover = {
        init: function (element, valueAccessor) {
            var value = valueAccessor();

            $(element).popover({
                content: value,
            });

            $(element)
                .on('mouseover', function () {
                    $(element).popover('show');
                })
                .on('mouseout', function () {
                    $(element).popover('hide');
                })
        }
    }
});