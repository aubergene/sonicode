// I used 101 bits to represent the barcode everywhere
// ideally it would be just 95 bits without any padding 
// but it makes the calculations to keep the sounds and visuals in sync much more complex

inlets = 3
setinletassist(0, "The barcode as 99 bits")
setinletassist(1, "The UPC as a list of 13 digits")
setinletassist(2, "Progress float")

outlets = 2
setoutletassist(0, "The barcode as 99 bits")
setoutletassist(1, "The UPC as a list of 13 digits")

autowatch = 1
mgraphics.init()
mgraphics.relative_coords = 1
mgraphics.autofill = 0
mgraphics.autosketch = 0

var barcodeBits = 101 // Length of the barcode in bits (including padding)
var bars = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var hasBars // don't do anything when we have no barcode
var ratio // ratio of width to height, we draw everything relative
var marker = 0 // position of scan line marker as a float
var upc = [] // We get the UPC code as an array of digits so we can display it
var margin = { top: 0.1, bottom: 0.4 }

// "Real" position of control bits with padding added in map (zero based)
var controlBits = [0, 2, 46, 48, 92, 94].map(function (d) { return d + 3 })
var controlHeight = 0.15

function paint() {
  var width = this.box.rect[2] - this.box.rect[0]
  var height = this.box.rect[3] - this.box.rect[1]
  var ratio = width / height

  var w = (ratio * 2) / barcodeBits
  var l

  with (mgraphics) {
    if (!hasBars) return

    set_source_rgb(0, 0, 0)

    for (var i = 0; i < barcodeBits; i++) {
      if (bars[i]) {
        x = i * w - ratio
        l = controlBits.indexOf(i) > -1 ? controlHeight : 0

        rectangle(x, 1 - margin.top, w, 2 - margin.top - margin.bottom + l)
      }
    }
    fill()

    move_to(-ratio, -0.8)
    select_font_face("Courier New")
    set_font_size(width / 24)

    // "Dumb but works" way to format the UPC code spacing
    var text = [
      upc.slice(0, 1) + "  ",
      upc.slice(1, 7).join("  "),
      "  ",
      upc.slice(7, 13).join("  "),
      "  >"
    ].join('')

    text_path(text)
    stroke()
    fill()

    set_source_rgb(0.9, 0, 0)
    x = marker * (ratio * 2 + w) - ratio
    rectangle(x - w, 1, w / 4, 2)
    fill()
  }
}

function bang() {
  // post("bang")
  // post()
  mgraphics.redraw()
}

function list() {
  // post("inlet", inlet)
  // post()

  // We pass the bars and UPC code to the outlets as it made drawing the patch much neater
  if (inlet === 0) {
    // barcode as bits
    bars = arrayfromargs(messagename, arguments);
    barcodeBits = bars.length
    hasBars = !!bars.filter(function (d) { return d }).length
    // post("bars", barcodeBits, hasBars)
    // post()
    mgraphics.redraw()
    outlet(0, bars)
  } else if (inlet === 1) {
    upc = arrayfromargs(messagename, arguments);
    outlet(1, upc)
    // post("upc", upc)
    // post()
  }
}

function msg_float(f) {
  if (0 <= f && f <= 1) {
    marker = f
    mgraphics.redraw();
  }
}

function msg_int(_upc) {
  upc = _upc
}