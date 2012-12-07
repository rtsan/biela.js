var ColorBuffer = function(width, height) {
    RenderBuffer.call(this, width, height);
};
ColorBuffer.prototype = Object.create(RenderBuffer.prototype);
