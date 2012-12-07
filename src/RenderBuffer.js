var RenderBuffer = function(width, height) {
    var canvasFactory = CanvasFactory.instance;
    this.imageData = canvasFactory.createImageData(width, height);
    this.clearValue = [ 0, 0, 0, 0 ];
};
RenderBuffer.prototype.clear = function() {
    var data = this.imageData.data;
    var value = this.clearValue;
    for (var i = 0, l = data.length; i < l; i += 4) {
        data[i] = value[0];
        data[i + 1] = value[1];
        data[i + 2] = value[2];
        data[i + 3] = value[3];
    }
};
RenderBuffer.prototype.write = function(i, value) {
    var data = this.imageData.data;
    data[i] = value[0];
    data[i + 1] = value[1];
    data[i + 2] = value[2];
    data[i + 3] = value[3];
};
