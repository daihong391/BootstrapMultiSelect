'use strict';
/*!
 * Bootstrap-multiselect v1.1.0
 * Author: Henry Dai
 * Website: http://bootstrapmultiselect.blogspot.ca/2017/06/bootstrap-multi-select-plugin-purpose.html
 * Contact: daihong391@gmail.com
 *
 * Copyright 2017-2019 bootstrap-multiselect
 * Licensed under MIT
 */

if (jQuery === 'undefined')
    throw new Error('MultiSelect\' requires jQuery');

if (!(typeof $().modal == 'function'))
    throw new Error('MultiSelect\' requires bootstrap');

//Crockford's supplant method (poor man's templating)
if (!String.prototype.supplant) {
    String.prototype.supplant = function (o) {
        return this.replace(/{([^{}]*)}/g, function (a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        });
    }
}

(function ($) {
    // Multi Select function
    $.fn.multiSelect = function (options) {
        var $this = this;

        // Check the existence of the element
        if (!$this.length) {
            return 'no elements to process';
        }

        // Check if any options passed
        if (!options) {
            options = {};
        }

        if (typeof options === 'string') {
            if (options === 'onClose') {
                $this.each(function (i, a) {
                    $.multiSelect.elements[$(a).attr('data-msid')].onClose();
                });
            }

            if (options === 'clear') {
                $this.each(function (i, a) {
                    $.multiSelect.elements[$(a).attr('data-msid')].clear();
                })
            }

            if (options === 'hide') {
                $this.each(function (i, a) {
                    $.multiSelect.elements[$(a).attr('data-msid')].hide();
                });
            }

            if ($.inArray(options, ['clear', 'hide']) !== -1) {
                return;
            }
        }

        // loop the page for all elements
        $this.each(function (i, e) {
            var $elm = $(e);

            if ($elm[0].tagName != 'SELECT') {
                console.warn('Sorry, cannot initialized a ' + $elm[0].tagName + ' element');
                return true;
            }

            if ($elm.attr('data-msid') !== undefined) {
                console.error('This element has already initialized');
            }

            var id = Math.floor(Math.random() * 999999);
            $elm.attr('data-msid', id);
            var multiSelectObj = new MultiSelect(e, options);
            $.multiSelect.elements[id] = multiSelectObj;
        });
    }

    var MultiSelect = function (a, options) {
        this.$e = $(a);
        this.$id = this.$e.data('msid');
        this.isMultiple = this.$e.attr('multiple') ? true : false;
        this.isHidden = !this.$e.is(':visible') ? true : false;

        $.extend(this, options);
        this.init();
    }

    MultiSelect.prototype = {
        init: function () {
            this._extractOptions();
            this._buildHtml();
            this._updateButtonContent();
            this._bindEvents();
        },
        _bindEvents: function () {
            var that = this;
            this.$c.find(".multiSelect-control").on('click', function () {
                if (that.isMultiple) {
                    if ($(this).hasClass('selected')) {
                        $(this).removeClass('selected');
                        $(this).find('.glyphicon').removeClass('glyphicon-check');
                        $(this).find('.glyphicon').addClass('glyphicon-unchecked');
                    } else {
                        $(this).addClass('selected');
                        $(this).find('.glyphicon').addClass('glyphicon-check');
                        $(this).find('.glyphicon').removeClass('glyphicon-unchecked');
                    }
                } else {
                    if (!$(this).hasClass('selected')) {
                        $(this).addClass('selected');
                        $(this).find('.glyphicon').addClass('glyphicon-check');
                        $(this).find('.glyphicon').removeClass('glyphicon-unchecked');
                    }
                    $(this).siblings().removeClass('selected');
                    $(this).siblings().find('.glyphicon').removeClass('glyphicon-check');
                    $(this).siblings().find('.glyphicon').addClass('glyphicon-unchecked');
                }
            });
            this.$c.find(".multiSelect-saveBtn").on('click', function () {
                var selectedOptions = [];
                var selectedValues = [];
                that.$c.find('.selected').each(function (i, e) {
                    selectedOptions.push({
                        value: $(e).data('value'),
                        text: e.text
                    });
                    selectedValues.push($(e).data('value'));
                });

                that.$selectOptions = selectedOptions;

                that.$e.val(selectedValues);

                that._updateBtn();

                if (typeof that.onClose === 'function') {
                    that.onClose();
                }

                that.$c.modal('hide');
            });
            this.$triggerElement.on('click', function () {
                that._syncR();
            });
        },
        _syncR: function() {
            var that = this;
            var selectValues = that.$e.val() !== null ? that.$e.val() : [];
            this.$c.find('.multiSelect-control').each(function () {
                if ($.inArray($(this).data('value'), selectValues) !== -1) {
                    $(this).addClass('selected');
                    $(this).find('.glyphicon').addClass('glyphicon-check');
                    $(this).find('.glyphicon').removeClass('glyphicon-unchecked');
                } else {
                    $(this).removeClass('selected');
                    $(this).find('.glyphicon').removeClass('glyphicon-check');
                    $(this).find('.glyphicon').addClass('glyphicon-unchecked');
                }
            });
        },
        _updateBtn: function () {
            var len = this.$selectOptions.length;
            if (this.isMultiple) {
                if (!len) {
                    this.$triggerElement.find('.text').text('None Selected');
                } else if (len === 1) {
                    this.$triggerElement.find('.text').text('1 item Selected');
                } else {
                    this.$triggerElement.find('.text').text(len + ' items Selected');
                }
            } else {
                if (!len) {
                    this.$triggerElement.find('.text').text('None Selected');
                } else {
                    this.$triggerElement.find('.text').text(this.$selectOptions[0].text);
                }
            }
        },
        _buildHtml: function () {
            if (!this.isMultiple) {
                this.$e.first()[0].insertBefore($('<option selected>None Selected</option>')[0], this.$e.first()[0][0]);
            }

            var width = '';
            if (this.width !== undefined) {
                width = this.width;
            }

            this.$e.before('<button style="float:none; width:' + width + ';" type="button" class="btn btn-default col-xs-7 col-md-3" data-toggle="modal" data-target="#multiSelect_' + this.$id + '"><span class="text"></span> <span class="caret pull-right"></span></button>');
            this.$triggerElement = this.$e.prev();

            if (this.isHidden) {
                this.$triggerElement.hide();
            }

            this.$e.hide();

            this.$selectOptions = [];

            var title = '';
            if (this.title !== undefined) {
                title = this.title;
            }
            if (this.isMultiple) {
                if (title === '') {
                    title = 'Please select options';
                }
            } else {
                if (title === '') {
                    title = $.fn.multiSelect.defaults.title;
                }
            }

            var $c = $.fn.multiSelect.defaults.template.supplant({
                id: 'multiSelect_' + this.$id,
                title: title,
                Cancel: $.fn.multiSelect.defaults.buttonCancel,
                Save: $.fn.multiSelect.defaults.buttonSave
            });

            this.$c = $($c).appendTo($('body'));

            this.$multiList = this.$c.find(".multiListContainer");

            this._appendOptionsList();
        },
        _appendOptionsList: function(){
            this.$multiList.html('');
            var that = this;

            $.each(this.options, function (i, e) {
                that.$multiList.append('<a href="#" class="form-control form-group multiSelect-control" data-value="' + e.value + '"><span class="glyphicon mr-2"></span>' + e.text + '</a>');
            });
        },
        _extractOptions: function() {
            var options = [];

            $.each(this.$e.find('option'), function (i, e) {
                options.push({
                    value: e.value,
                    text: e.text
                })
            });

            this.options = options;
        },
        clear: function(){
            this.$e.val("");
            this.$triggerElement.find('.text').text("None Selected");
            this.$c.find('.multiSelect-control').removeClass('selected');
            this.$c.find('.glyphicon').removeClass('glyphicon-check');
            this.$c.find('.glyphicon').addClass('glyphicon-unchecked');
        },
        hide: function(){
            this.$triggerElement.hide();
        },
        _setTitle: function (modalTitle) {
            this.$c.find('.modal-title').text(modalTitle);
        },
        _updateButtonContent: function () {
            var selectedOption = this.$triggerElement.next().find('option:selected');

            if (this.isMultiple) {
                if (selectedOption.length === 0) {
                    this.$triggerElement.find('.text').text('None Selected');
                } else if (selectedOption.length === 1) {
                    this.$triggerElement.find('.text').text(selectedOption.length + ' item selected');
                } else {
                    this.$triggerElement.find('.text').text(selectedOption.length + ' items selected');
                }
            } else {
                if (this.$e.val() === "") {
                    this.$triggerElement.find('.text').text('None Selected');
                } else {
                    this.$triggerElement.find('.text').text(this.$e.val());
                }
            }
        }
    }

    $.multiSelect = {
        elements: {},
        animation: []
    }

    $.fn.multiSelect.defaults = {
        template: '<div class="modal fade" id="{id}" data-backdrop="static" data-keyboard="false">' +
                    '<div class="modal-dialog" role="document">' +
                        '<div class="modal-content">' +
                            '<div class="modal-header">' +
                                '<h5 class="modal-title">{title}</h5>' +
                            '</div>' +
                            '<div class="modal-body"><div class="multiListContainer"></div></div>' +
                            '<div class="modal-footer" style="margin-top: 0;">' +
                                '<button type="button" class="btn btn-secondary" data-dismiss="modal">{Cancel}</button>' +
                                '<button type="button" class="btn btn-primary multiSelect-saveBtn">{Save}</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                   '</div>',
        title: 'Select an option',
        buttonSave: 'Save',
        buttonCancel: 'Cancel',
        onOpen: function () {
        },
        onClose: function () {
        }
    }
})(jQuery);
