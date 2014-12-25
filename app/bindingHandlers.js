define(['knockout', 'moment', 'jquery', 'jqueryui'], function (ko, moment, $) {
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
    ko.bindingHandlers.saveAndGoTo = {
        init: function (element, valueAccessor) {
            var saveNewItem = valueAccessor();

            $(element).click(function () {
                saveNewItem()
                    .then(function (newItemId) {
                        $('#heading' + newItemId).find('a').trigger('click');
                    });
            });
        }
    };
    ko.bindingHandlers.cancelCreating = {
        init: function (element, valueAccessor) {
            var reset = valueAccessor();

            $(element).click(function () {
                reset();
                $(this).closest('.panel').find('a').trigger('click');
            });
        }
    };
});