var CanvasFactory = function() {
    var canvas = this.createCanvas(1, 1);
    this.context = canvas.getContext('2d');
};
CanvasFactory.prototype.createCanvas = function(width, height) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
};
CanvasFactory.prototype.createImageData = function(width, height) {
    return this.context.createImageData(width, height);
};
CanvasFactory.instance = new CanvasFactory();
