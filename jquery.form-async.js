$(function(){
"use strict";

/*
    Usage Note:
    -----------

*/
	var _formatedErrors = function(errors) {
			var out = {},error=null;
			for (var field in errors) {
				if (typeof errors[field] == 'object') {
					for (var name in errors[field]) {
						error = errors[field][name];
					}
				} else {
					error = errors[field];
				}
				out[field] = error;
			}
			return out;
	};

	var _errors = function(form, errors) {
		var errors = _formatedErrors(errors);
			for (var field in errors) {
				if (form.find('label[for="'+field+'"]').size()) {
					form.find('label[for="'+field+'"]').
						closest('.form-group').append('<p class="help-block">'+errors[field]+'</p>').addClass('has-error');
				} else {
					form.find('[name="'+field+'"]').
						closest('.form-group').append('<p class="help-block">'+errors[field]+'</p>').addClass('has-error');
				}
			}
	};

	$(document).on('submit', 'form[data-async]', function(event) {
		event.preventDefault();
		var form = $(this),
			target=null;
		if (form.closest('.tab-pane').size()) {
			target = form.closest('.tab-pane');
		} else if (form.closest('.modal-content').size()) {
			target = form.closest('.modal-content');
		} else {
			target = form.parent();
		}
		form.ajaxSubmit({
		  	dataType: 'json',
			beforeSubmit: function(arr, form) {
				target.find('button,input[type=submit]').attr('disabled','disabled');
				form.find('.has-error .help-block').remove();
				form.find('.form-group').removeClass('has-error');
			},
		    success: function(json, statusText, xhr, form) {
	        	target.find('.indicator').remove();
	        	target.find('button,input[type=submit]').removeAttr('disabled');
				form.find('button,input[type=submit]').removeAttr('disabled');
        		if (json.redirect_to) {
					location.href = json.redirect_to;
        		} else if (json.cb) {
					$(window).trigger(json.cb,[form,json.args]);
        		} else {
        			location.reload();
        		}
	        },
			error: function(xhr, status, error, form){
			   	target.find('.indicator').remove();
				target.find('button,input[type=submit]').removeAttr('disabled');
			   	form.find('button,input[type=submit]').removeAttr('disabled');
			   	if (_(json.errors).size()) {
					_errors(form, json.errors);
			   	} else {
	        		$.bootstrapGrowl((xhr.responseJSON.name?xhr.responseJSON.name:xhr.responseJSON.message), {
						type: 'danger',
		        		offset: {from: 'bottom', amount: 20}
		        	});
	        	}
			}
		});
	});
});