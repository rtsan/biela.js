var FrameBuffer = function(width, height) {
    this.colorBuffer = new ColorBuffer(width, height);
    this.depthBuffer = new DepthBuffer(width, height);
    this._minmaxBuffer = new MinMaxBuffer(width, height);
};
FrameBuffer.prototype.clear = function(filter) {
    var type;
    if (filter) {
        for (var i = 0, l = filter.length; i < l; i++) {
            type = filter[i];
            this[type + 'Buffer'].clear();
        }
    } else {
        this.colorBuffer.clear();
        this.depthBuffer.clear();
    }
};

// TODO
var context = document.createElement('canvas').getContext('2d');

var RenderBuffer = function(width, height) {
    this.imageData = context.createImageData(width, height);
    this.clearValue = [ 0, 0, 0, 0 ];
};

var ColorBuffer = function(width, height) {
    RenderBuffer.call(this, width, height);
};
ColorBuffer.prototype.clear = function() {
    var data = this.imageData.data;
    var color = this.clearValue;
    for (var i = 0, l = data.length; i < l; i += 4) {
        data[i] = color[0];
        data[i + 1] = color[1];
        data[i + 2] = color[2];
        data[i + 3] = color[3];
    }
};
ColorBuffer.prototype.write = function(i, color) {
    var data = this.imageData.data;
    data[i] = color[0];
    data[i + 1] = color[1];
    data[i + 2] = color[2];
    data[i + 3] = color[3];
};

var DepthBuffer = function(width, height) {
    RenderBuffer.call(this, width, height);
    this.clearValue = [ 255, 255 ];
};
DepthBuffer.prototype.clear = function() {
    var data = this.imageData.data;
    var d = this.clearValue;
    for (var i = 0, l = data.length; i < l; i += 4) {
        data[i] = d[0];
        data[i + 1] = d[1];
    }
};
DepthBuffer.prototype.test = function(i, depth) {
    var written = this.read(i);
    return depth < written;
};
DepthBuffer.prototype.write = function(i, depth) {
    var up = (depth * 256) | 0;
    var md = ((depth - up / 256) * 65536) | 0;
    var data = this.imageData.data;
    data[i] = up;
    data[i + 1] = md;

};
DepthBuffer.prototype.read = function(i) {
    var data = this.imageData.data;
    return data[i] / 256 + data[i + 1] / 65536;
};
