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
