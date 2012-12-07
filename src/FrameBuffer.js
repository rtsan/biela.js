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
