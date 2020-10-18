(function (window, $, undefined) {
    'use strict';

    // popup service
    var msg = {
        makeid: function (length) {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (var i = 0; i < length; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            return text;
        },
        count: window.popCount = 0,
        pop: function (message) {
            console.log(message);
            this.count++;
            var $id = this.makeid(5);
            var pops = $('.hd-pop');
            var gap = 10;
            var top = 20;
            var item = 70;
            if (pops.length === 0) this.count = 1;
            $('body').append('<div class="hd-pop" id="pop_' + $id + '">' + message + '</div>');
            $('#pop_' + $id).css('top', top + ((item + gap) * this.count));

            $('#pop_' + $id).addClass('animated lightSpeedIn');
            setTimeout(
                function () {
                    $('#pop_' + $id).addClass('animated lightSpeedOut');
                    setTimeout(
                        function () {
                            $('#pop_' + $id).remove();
                        }, 1000
                    );
                }, 2000
            );
        }
    };

    var utils = {
        navButton: function (id, name, elementClass) {
            var template = '<li id="' + id + '" class="' + elementClass + '"><a class="ab-item" disabled href="javascript:void(0);">' + name + '</a></li>';
            $('#frontend-editor').append(template);
        }
    };

    window.frontend_editor_is_initialized = false;
    var acfVars = {
        links: true,
        outline: false,
        textInputs: null,
        init: function () {
            $('#wp-admin-bar-root-default').append('<ul id="frontend-editor"></ul>');
            utils.navButton('wp-admin-bar-enable_fe', 'Enable F-end Editor', 'parent-element');

            if (window.frontend_editor_is_initialized) {
                $('#wp-admin-bar-enable_fe').addClass('is-active');
                initEditor.init();
            }

            $('#wp-admin-bar-enable_fe').click(function () {
                if ($(this).hasClass('is-active')) {
                    $('#frontend-editor .child-element').hide();
                    $(this).removeClass('is-active');
                    $(this).find('a').text('Enable F-end Editor');
                    acfVars.textInputs.attr('contenteditable', false)
                } else {
                    $('#frontend-editor .child-element').show();
                    $(this).addClass('is-active');
                    $(this).find('a').text('Disable F-end Editor');
                    if (acfVars.textInputs !== null) {
                        acfVars.textInputs.attr('contenteditable', true)
                    }
                    if (!frontend_editor_is_initialized) {
                        frontend_editor_is_initialized = true;
                        initEditor.init();
                    }
                }
            });
        }
    };

    var initEditor = {
        init: function () {
            var textInputs = $('[contenteditable]');
            var elements = document.querySelectorAll('.editableHD');
            var editor = new MediumEditor(elements);
            acfVars.textInputs = textInputs;
            textInputs.each(function () {
                var contents = $(this).html();
                $(this).on('focus', function () {
                }).on('blur', function () {
                    if (contents != $(this).html()) {
                        $(this).addClass('textChanged');
                        $('#wp-admin-bar-edit-live a').text('Save progress');
                        $('#wp-admin-bar-edit-live a').removeAttr('disabled');
                        contents = $(this).html();
                    }
                });
            });
        }
    }

    var acfEditor = {
        initToggle: function () {
            utils.navButton('wp-admin-bar-toggle-outline', 'Toggle outline', 'child-element');
            $('#wp-admin-bar-root-default').on('click', '#wp-admin-bar-toggle-outline', function () {
                if (acfVars.outline) {
                    $(this).find('a').text('Toggle outline');
                    acfVars.outline = false;
                    acfVars.textInputs.parent().removeClass('hd-toggle-acf-outline').css('outline', 'none');
                } else {
                    $(this).find('a').text('Hide outline');
                    acfVars.outline = true;
                    acfVars.textInputs.parent().addClass('hd-toggle-acf-outline').css('outline', '1px solid red');
                }
            });
        },
        initLinks: function () {
            utils.navButton('wp-admin-bar-toggle-actions', 'Disable links', 'child-element');
            $('#wp-admin-bar-root-default').on('click', '#wp-admin-bar-toggle-actions', function () {
                if (acfVars.links) {
                    $(this).find('a').text('Enable links');
                    acfVars.links = false;
                    acfVars.textInputs.parent('a').addClass('hd-disable-acf-links').css('cursor', 'text');
                    acfVars.textInputs.parent('button').addClass('hd-disable-acf-links').css('cursor', 'text');
                } else {
                    $(this).find('a').text('Disable links');
                    acfVars.links = true;
                    acfVars.textInputs.parent('a').removeClass('hd-disable-acf-links').css('cursor', 'auto');
                    acfVars.textInputs.parent('button').removeClass('hd-disable-acf-links').css('cursor', 'auto');
                }
            });

            $('body').on('click', '.hd-disable-acf-links', function (e) {
                console.log('a');
                e.preventDefault();
            });
        },
        initEdit: function () {
            utils.navButton('wp-admin-bar-edit-live', 'Save', 'child-element');
            $('#wp-admin-bar-root-default').on('click', '#wp-admin-bar-edit-live', function () {
                var editableText = $('[contenteditable].textChanged');
                var textString = [];
                editableText.each(function () {
                    var text = $(this).html();
                    var key = $(this).data('key');
                    var name = $(this).data('name');
                    var postid = $(this).data('postid');
                    var textArr = [key, text, name, postid];
                    textString.push(textArr);
                });

                if (editableText.length === 0) {
                    msg.pop('Nothing to save');
                    return;
                } else {
                    msg.pop('Saving your changes...');
                }

                $.ajax({
                    url: meta.ajaxurl,
                    data: {
                        'action': 'update_texts',
                        'textArr': textString
                    },
                    success: function (data) {
                        msg.pop('Changes have been saved!');
                        textString = [];
                        $('#wp-admin-bar-edit-live a').text('Save');
                        $('[contenteditable].textChanged').removeClass('textChanged');
                    },
                    error: function (errorThrown) {
                        msg.pop('Something went wrong!');
                        console.error('errorThrown');
                    }
                });

            });
        }
    };

    $(document).ready(function () {
        // register nav buttons
        acfVars.init();
        acfEditor.initToggle();
        acfEditor.initLinks();
        acfEditor.initEdit();

    });


})(window, window.jQuery);
