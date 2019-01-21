function createNode(name, attributes) {
  return $(document.createElementNS("http://www.w3.org/2000/svg", name)).attr(attributes);
}

function drawFretboard(fbContainer) {
  var fbcWidth = fbContainer.attr('width');
  var fbcHeight = fbContainer.attr('height');
  var notes = fbContainer.attr('notes');
  if(notes == 'all') {
    notes = '';
    for(var i = 0; i < 6; ++i) {
      for(var j = 0; j < 23; ++j) {
        if(notes != '') notes += ' ';
        notes += (i + ',' + j);
      }
    }
  }

  var highlightNotes = fbContainer.attr('highlightNotes');
  
  var svg = createNode('svg', { x: 0, y: 0, width: fbcWidth, height: fbcHeight });
  fbContainer.append(svg);

  var openNoteLabelWidth = fbcWidth * 0.03;
  var nutX = openNoteLabelWidth;
  var nutWidth = fbcWidth * 0.015;
  var fbX = nutWidth + openNoteLabelWidth;
  var fbY = 0;
  var fbWidth = fbcWidth - fbX;
  var fbHeight = fbcHeight;
  
  var nut = createNode('rect', { class: 'nut', x: nutX, y: fbY, width: nutWidth, height: fbHeight });
  svg.append(nut);

  var fretboard = createNode('rect', { class: 'fretboard', x: fbX, y: fbY, width: fbWidth, height: fbHeight });
  svg.append(fretboard);

  var fretX = fbX + (fbWidth / 22);
  var fretY = 0;
  var fretXDelta = fbWidth / 22;
  for (n = 0; n < 21; ++n) {
    var fret = createNode('line', { class: 'fret', x1: fretX, y1: fretY, x2: fretX, y2: fbcHeight });
    svg.append(fret);
    fretX += fretXDelta;
  }

  var edgeSpace = fbHeight / 15;
  var stringY = edgeSpace;
  var stringYDelta = (fbcHeight - (2 * edgeSpace)) / 5;
  for (n = 0; n < 6; ++n) {
    var string = createNode('line', { class: 'string', x1: nutX, y1: stringY, x2: fbcWidth, y2: stringY });
    svg.append(string);
    stringY += stringYDelta;
  }

  var noteLabels = ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#'];
  var noteLabelIndexes = [0, 7, 3, 10, 5, 0];
  var noteR = fretXDelta * 0.3;
  var noteXDelta = fbWidth / 22;
  var noteYDelta = stringYDelta;

  notes.split(' ').forEach(pair => {
    var bits = pair.split(',');
    var m = parseInt(bits[0], 10);
    var n = parseInt(bits[1], 10);

    var noteY = edgeSpace + (m * noteYDelta);
    var noteLabelIndex = noteLabelIndexes[m];
    var noteX;

    if(n == 0)
      noteX = noteR;
    else if(n == 1)
      noteX = fbX + (fretXDelta / 2)
    else if(n > 1)
      noteX = fbX + (fretXDelta / 2) + ((n - 1) * noteXDelta);
  
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

  if(typeof highlightNotes != 'undefined') {
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
  $('.fretboard-container').each(function () { drawFretboard($(this)); });
};
