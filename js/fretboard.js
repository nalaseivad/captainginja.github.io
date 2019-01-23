function createNode(name, attributes) {
  return $(document.createElementNS("http://www.w3.org/2000/svg", name)).attr(attributes);
}

function drawFretboard(fbContainer) {
  var id = fbContainer.attr('id');
  var fbcWidth = parseInt(fbContainer.attr('width'), 10);
  var fbcHeight = parseInt(fbContainer.attr('height'), 10);
  var startFret = parseInt(fbContainer.attr('start-fret'), 10);
  var numFrets = parseInt(fbContainer.attr('num-frets'), 10);

  var notes = fbContainer.attr('notes');
  if (notes == 'all') {
    notes = '';
    for (var i = 0; i < 6; ++i) {
      for (var j = 0; j < 23; ++j) {
        if (notes != '') notes += ' ';
        notes += (i + ',' + j);
      }
    }
  }

  var highlightNotes = fbContainer.attr('highlightNotes');
  
  var svg = createNode('svg', { x: 0, y: 0, width: fbcWidth, height: fbcHeight });
  fbContainer.append(svg);

  var fbHeight = fbcHeight;
  var edgeSpace = fbHeight / 15;
  var noteR = edgeSpace * 0.8;
  var openNoteLabelWidth = (noteR * 2) * 1.1;
  var nutX = openNoteLabelWidth;
  var nutWidth = 8;
  var fbX = (startFret == 0) ? nutWidth + openNoteLabelWidth : 0;
  var fbY = 0;
  var fbWidth = fbcWidth - fbX;
  var fretXDelta = fbWidth / numFrets;
  
  
  if (startFret == 0) {
    var nut = createNode('rect', { class: 'nut', x: nutX, y: fbY, width: nutWidth, height: fbHeight });
    svg.append(nut);
  }

  var fretboard = createNode('rect', { class: 'fretboard', x: fbX, y: fbY, width: fbWidth, height: fbHeight });
  svg.append(fretboard);

  var fretX = fbX + (fbWidth / numFrets);
  var fretY = 0;
  for (n = 0; n < numFrets; ++n) {
    var fret = createNode('line', { class: 'fret', x1: fretX, y1: fretY, x2: fretX, y2: fbcHeight });
    svg.append(fret);
    fretX += fretXDelta;
  }

  var stringY = edgeSpace;
  var stringYDelta = (fbcHeight - (2 * edgeSpace)) / 5;
  var stringStartX = (startFret == 0) ? nutX : 0;
  for (n = 0; n < 6; ++n) {
    var string = createNode('line', { class: 'string', x1: stringStartX, y1: stringY, x2: fbcWidth, y2: stringY });
    svg.append(string);
    stringY += stringYDelta;
  }

  var noteLabels = ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#'];
  var noteLabelIndexes = [0, 7, 3, 10, 5, 0];
  var noteXDelta = fbWidth / numFrets;
  var noteYDelta = stringYDelta;

  notes.split(' ').forEach(pair => {
    var bits = pair.split(',');
    var m = parseInt(bits[0], 10);
    var n = parseInt(bits[1], 10);

    var noteY = edgeSpace + (m * noteYDelta);
    var noteLabelIndex = noteLabelIndexes[m];
    var noteX;

    if (n == 0)
      noteX = noteR;
    else if (n > 0)
      noteX = fbX + (fretXDelta / 2) + ((n - 1) * noteXDelta);
  
    if(startFret > 0)
    noteX -= ((startFret - 1) * noteXDelta);
    
    var noteName = noteLabels[(noteLabelIndex + n) % 12];
    var noteClassName = noteName.replace('#', 'sharp');
    var noteGroupId = m + ',' + n;
    var noteGroupClass = 'note-group note-' + noteClassName + ' fret-' + n + ' string-' + m;

    var noteGroup = createNode('g', { class: noteGroupClass, id: noteGroupId });
    svg.append(noteGroup);
    var note = createNode('circle', { class: 'note', cx: noteX, cy: noteY, r: noteR });
    var noteLabel = createNode('text', {
      class: 'note-label', x: noteX, y: noteY, dy: '0.35em', 'text-anchor': 'middle'
    });
    noteLabel.append(noteName);
    noteGroup.append(note);
    noteGroup.append(noteLabel);
  });

  if (startFret == 0) {
    var dotR = fretXDelta * 0.1;
    var dot1X = nutX + nutWidth + (fretXDelta / 2);
    var dotY = fbY + (fbHeight / 2);
    $.each([3, 5, 7, 9, 15, 17, 19, 21], function (index, value) {
      svg.append(createNode('circle', { class: 'dot', cx: dot1X + ((value - 1) * fretXDelta), cy: dotY, r: dotR }));
    });
    dotY = fbY + edgeSpace + stringYDelta + (stringYDelta / 2);
    svg.append(createNode('circle', { class: 'dot', cx: dot1X + (11 * fretXDelta), cy: dotY, r: dotR }));
    dotY += (stringYDelta * 2);
    svg.append(createNode('circle', { class: 'dot', cx: dot1X + (11 * fretXDelta), cy: dotY, r: dotR }));
  }

  if (typeof highlightNotes != 'undefined') {
    highlightNotes.split(' ').forEach(highlightNote => {
      var [noteName, className] = highlightNote.split(',');
      fbContainer.find('.note-' + noteName).toggleClass(className);
    });
  }
}



function showHideNote(id, noteName) {
  $(id).find('.note-' + noteName).toggle();
}

function showAllNotes(id) {
  $(id).find('.note-group').show();
}

function hideAllNotes(id) {
  $(id).find('.note-group').hide();
}

function hideNotesOnFret(id, fretNumber) {
  $(id).find('.fret-' + fretNumber).hide();
}

function highlightNote(id, noteName) {
  $(id).find('.note-' + noteName).toggleClass('highlighted');
}

function main() {
  $('.fretboard-diagram').each(function () { drawFretboard($(this)); });
};
