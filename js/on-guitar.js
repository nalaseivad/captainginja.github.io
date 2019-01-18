function createNode(name, attributes) {
  return $(document.createElementNS("http://www.w3.org/2000/svg", name)).attr(attributes);
}

function drawFretboard(fbContainer) {
  var fbcWidth = fbContainer.attr('width');
  var fbcHeight = fbContainer.attr('height');

  var svg = createNode('svg', { x: 0, y: 0, width: fbcWidth, height: fbcHeight });
  fbContainer.append(svg);

  var dotSpace = 0;
  var openNoteLabelWidth = fbcWidth * 0.03;
  var nutX = openNoteLabelWidth;
  var nutWidth = fbcWidth * 0.015;
  var fbX = nutWidth + openNoteLabelWidth;
  var fbY = dotSpace;
  var fbWidth = fbcWidth - fbX;
  var fbHeight = fbcHeight - dotSpace;
  
  var nut = createNode('rect', { class: 'nut', x: nutX, y: fbY, width: nutWidth, height: fbHeight });
  svg.append(nut);

  var fretboard = createNode('rect', { class: 'fretboard', x: fbX, y: fbY, width: fbWidth, height: fbHeight });
  svg.append(fretboard);

  var fretX = fbX + (fbWidth / 22);
  var fretY = dotSpace;
  var fretXDelta = fbWidth / 22;
  for (n = 0; n < 21; ++n) {
    var fret = createNode('line', { class: 'fret', x1: fretX, y1: fretY, x2: fretX, y2: fbcHeight });
    svg.append(fret);
    fretX += fretXDelta;
  }

  var edgeSpace = fbHeight / 15;
  var stringY = edgeSpace + dotSpace;
  var stringYDelta = (fbcHeight - (2 * edgeSpace) - dotSpace) / 5;
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
  var noteY = edgeSpace + dotSpace;
  for (m = 0; m < 6; ++m) {
    var noteLabelIndex = noteLabelIndexes[m];
    var noteX = noteR;
    for (n = 0; n < 23; ++n) {
      var noteName = noteLabels[(noteLabelIndex + n) % 12];
      var noteClassName = noteName.replace('#', 'sharp');
      var noteId = m + ',' + n;
      var className = 'note note-' + noteClassName;
      var note = createNode('circle', { class: className, id: noteId, cx: noteX, cy: noteY, r: noteR });
      className = 'note-label note-label-' + noteClassName;
      var noteLabel = createNode('text', {
        class: className, id: noteId, x: noteX, y: noteY, dy: '0.35em', 'text-anchor': 'middle'
      });
      noteLabel.append(noteName);
      svg.append(note);
      svg.append(noteLabel);
      if (n == 0)
        noteX = fbX + (fretXDelta / 2);
      else
        noteX += noteXDelta;
    }
    noteY += noteYDelta;
  }

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

function main() {
  $('.fretboard-container').each(function () { drawFretboard($(this)); });
};
