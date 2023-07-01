var Help = {
	init: function() {
		window.onload = function() {
			var helpIcon = document.getElementById('help-icon');
			helpIcon.addEventListener('click', function() {
				// Displaying the help dialog
				alertify.okBtn("Close").alert(_.template(document.getElementById('helpTmpl').innerHTML));
			});
			
			var xpadIcon = document.getElementById('xpad-icon');
			xpadIcon.addEventListener('click', function() {
				// Displayig the gamepad dialog
				alertify.okBtn("Close").alert(_.template(document.getElementById('xpadTmpl').innerHTML));
			});
		}
	},

	displayXpadInput: function(buttonType) {
		// Display the button type 
		var xpadSelectedInput = document.getElementById('xpad-selected-input');
		if (!_.isNull(xpadSelectedInput)) {
			if (_.contains(['A', 'X', 'Menu', 'D-Up', 'D-Down', 'D-Left', 'D-Right'], buttonType)) {
				xpadSelectedInput.innerText = buttonType;
			} else {
				xpadSelectedInput.innerText = 'Press any of the above mentioned buttons.';
			}
		}
	}
};

Help.init();
