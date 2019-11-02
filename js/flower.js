function createNode(name, attributes) {
  return $(document.createElementNS("http://www.w3.org/2000/svg", name)).attr(attributes);
}

function drawFlowerOld(container) {
	var cWidth = parseInt(container.attr('width'), 10);
	var cHeight = parseInt(container.attr('height'), 10);
	var svg = createNode('svg', { x: 0, y: 0, width: cWidth, height: cHeight });
	container.append(svg);

	drawFlowerWithFactorLoop(svg, 0.1, 0.001, 50);
}

function drawFlowerWithFactorLoop(svg, factor, factorDelta, delay) {
	drawFlowerWithFactor(svg, factor);

	factor += factorDelta;
	setTimeout(function () {
		$(".seed").remove();
		drawFlowerWithFactorLoop(svg, factor, factorDelta, delay);
	}, delay);
}

function drawFlowerFromAttributes(flower) {
	flower.find('.seed').remove();

	var seedWidth = flower.attr('seed-width');
	var rotationFactor = flower.attr('rotation-factor');
	var outFactor = flower.attr('out-factor');

	if (Math.floor(rotationFactor) == rotationFactor)
		rotationFactor = 1;
	else
		rotationFactor -= Math.floor(rotationFactor);
	
	var svg = flower.find('svg');
	var centerX = svg.attr('width') / 2;
	var centerY = svg.attr('height') / 2;
	var maxR = Math.max(centerX, centerY);
	var twoPi = 2 * Math.PI;
	var angle = 0;
	var r = 10;

	for (n = 0; n < 10000; ++n) {
		if (r > maxR) break;

		var x = centerX + (r * Math.cos(angle));
		var y = centerY + (r * Math.sin(angle));
		var seed = createNode('circle', { class: 'seed', cx: x, cy: y, r: seedWidth / 2 });
		svg.append(seed);
		angle += twoPi * rotationFactor;
		if (angle > twoPi) angle -= twoPi;
		r += (outFactor * rotationFactor * seedWidth);
	}
}

function updateFlowerAttributesFromUi(id) {
	var flower = $('#' + id);
	var values = $('#' + id + '-values');
	if (values.length) {
		var input = values.find('#seed-width-value');
		if (input.length) flower.attr('seed-width', parseFloat(eval(input.val())));
		input = values.find('#rotation-factor-value');
		if (input.length) flower.attr('rotation-factor', parseFloat(eval(input.val())));
		input = values.find('#out-factor-value');
		if (input.length) flower.attr('out-factor', parseFloat(eval(input.val())));
	}
}

function updateUiFromFlowerAttributes(id) {
	var flower = $('#' + id);
	var values = $('#' + id + '-values');
	if (values.length) {
		var input = values.find('#seed-width-value');
		if (input.length) input.val(flower.attr('seed-width'));
		input = values.find('#rotation-factor-value');
		if (input.length) input.val(flower.attr('rotation-factor'));
		input = values.find('#out-factor-value');
		if (input.length) input.val(flower.attr('out-factor'));
	}
}

function drawFlower(id) {
	updateFlowerAttributesFromUi(id);
	drawFlowerFromAttributes($('#' + id));
}

function alterRotationFactorAndDrawFlower(id, fn) {
	var flower = $('#' + id);
	var rotationFactorDelta = parseFloat(eval($('#' + id + '-values #rotation-factor-delta-value').val()));
	var rotationFactor = parseFloat(flower.attr('rotation-factor'));
	rotationFactor = fn(rotationFactor, rotationFactorDelta);
	$('#' + id + '-values #rotation-factor-value').val(rotationFactor);
	updateFlowerAttributesFromUi(id);
	drawFlowerFromAttributes(flower);
}

function incRotationFactorAndDrawFlower(id) {
	alterRotationFactorAndDrawFlower(id, function (a, b) {
		return a + b;
	});
}

function decRotationFactorAndDrawFlower(id) {
	alterRotationFactorAndDrawFlower(id, function (a, b) {
		return a - b;
	});
}

function updateFlowerAttributesFromAnimationUi(id) {
	var flower = $('#' + id);
	var values = $('#' + id + '-values');
	var input = values.find('#start-rotation-factor-value');
	flower.attr('rotation-factor', parseFloat(eval(input.val())));
}

function drawFlowerFromAttributesLoop(id) {
	var flower = $('#' + id);
	var values = $('#' + id + '-values');
	var delta = parseFloat(eval(values.find('#rotation-factor-delta-value').val()));
	var delay = parseFloat(eval(values.find('#delay-value').val()));

	console.log("drawFlowerFromAttributesLoop");
	console.log("delta=" + delta);
	console.log("delay=" + delay);
	console.log("animate=" + flower.attr('animate'));

	var rotationFactor = parseFloat(flower.attr('rotation-factor'));
	values.find('#rotation-factor-display').text(rotationFactor);
	drawFlowerFromAttributes(flower);
	
	flower.attr('rotation-factor', rotationFactor + delta);

	if (flower.attr('animate') == 1) {
		console.log("setTimout");
		setTimeout(function () {
			drawFlowerFromAttributesLoop(id);
		}, delay);
	}
	else {
		console.log("animate != 1");
	}
}

function startAnimation(id) {
	var flower = $('#' + id);
	flower.attr('animate', 1);

	updateFlowerAttributesFromAnimationUi(id);
	drawFlowerFromAttributesLoop(id);

	$('#stop-animation-button').prop('disabled', false);
	$('#start-animation-button').prop('disabled', true);
}

function stopAnimation(id) {
	var flower = $('#' + id);
	flower.attr('animate', 0);

	$('#stop-animation-button').prop('disabled', true);
	$('#start-animation-button').prop('disabled', false);
}

function main() {
	$('.flower').each(function () {
		var width = parseInt($(this).attr('width'), 10);
		var height = parseInt($(this).attr('height'), 10);
		var svg = createNode('svg', { x: 0, y: 0, width: width, height: height });
		$(this).append(svg);

		var id = $(this).attr('id');
		updateUiFromFlowerAttributes(id);
		drawFlower(id);
	});
};
