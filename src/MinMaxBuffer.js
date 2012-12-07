var MinMaxBuffer = function(width, height) {
    this.buf = [];
    this.width = width;
    this.height = height;
    var min = Number.MIN_VALUE;
    var max = Number.MAX_VALUE;
    this.start = max;
    this.end = min;
    for (var i = 0; i < height; i++) {
        this.buf[i] = {};
    }
    this.init();
};
MinMaxBuffer.prototype.init = function() {
    var min = Number.MIN_VALUE;
    var max = Number.MAX_VALUE;
    var o;
    for (var i = 0, l = this.height; i < l; i++) {
        o = this.buf[i];
        o.min = max;
        o.max = min;
        o.taint = false;
    }
    this.start = max;
    this.end = min;
};
MinMaxBuffer.prototype.feed = function(x, y) {
    var o = this.buf[y];
    if (y < 0 || this.height <= y) {
        return;
    }
    if (x < o.min) {
        o.min = Math.max(x, 0);
    }
    if (o.max < x) {
        o.max = Math.min(x, this.width);
    }
    if (y < this.start) {
        this.start = y;
    }
    if (this.end < y) {
        this.end = y;
    }
    o.taint = true;
};
