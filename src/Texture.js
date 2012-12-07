var Texture = function(image) {
    this.canvas = document.createElement('canvas');
    var ctx = this.context = this.canvas.getContext('2d');
    var width = this.width = image.width;
    var height = this.height = image.height;
    this.canvas.width = width;
    this.canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    this.imageData = ctx.getImageData(0, 0, width, height);
};

Texture.prototype.getColorFromUV = function(u, v) {
    v = 1 - v;
    var data = this.imageData.data;
    var width = this.width;
    var height = this.height;
    u -= u | 0;
    u = u > 0 ? u : -u;
    v -= v | 0;
    v = v > 0 ? v : -v;
    var x = (u * (width - 1) + 0.5) | 0;
    var y = (v * (height - 1) + 0.5) | 0;
    var i = (y * width + x) * 4;
    return [
        data[i],
        data[i + 1],
        data[i + 2],
        data[i + 3]
    ];
};
Texture.prototype.tex2d = function(uv) {
    return this.getColorFromUV(uv[0], uv[1]);
};
