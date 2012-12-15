/*
 * biela.js v0.1.0
 * https://github.com/rtsan/biela.js
 *
 * Copyright (c) 2012 rtsan
 * Licensed under the MIT license.
*/

(function(global) {

var Biela = function(arg) {
    var canvasFactory = CanvasFactory.instance;
    if (arguments.length === 1) {
        if (arguments[0].nodeName === 'CANVAS') {
            this.canvas = arguments[0];
            this.width = this.canvas.width;
            this.height = this.canvas.height;
        } else if (typeof arguments[0] === 'string') {
            this.canvas = document.getElementById('canvas');
            if (!this.canvas) {
                throw new Error('#' + arguments[0] + ' is not found');
            }
            this.width = this.canvas.width;
            this.height = this.canvas.height;
        }
    } else {
        var width = this.width = arguments[0];
        var height = this.height = arguments[1];

        this.canvas = canvasFactory.createCanvas(width, height);
    }
    this.viewportLeft = this.viewportTop = 0;
    this.viewportWidth = this.width;
    this.viewportHeight = this.height;
    this.context = this.canvas.getContext('2d');
    this.currentProgram = null;
    this.defaultFrameBuffer = new FrameBuffer(this.width, this.height);
    this.currentFrameBuffer = this.defaultFrameBuffer;
};

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

var ColorBuffer = function(width, height) {
    RenderBuffer.call(this, width, height);
};
ColorBuffer.prototype = Object.create(RenderBuffer.prototype);

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

var VertexShader = function(prog) {
    this.uniforms = {};
    this.attributes = {};
    this.attrNums = {};
    this.varyings = {};
    this.dest = {};
    this.prog = prog || function() {};
};
VertexShader.prototype.exec = function(n, index) {
    var position;
    var attributes = this.pickAttributes(index);
    var varyings = {};
    this.prog(this.uniforms, attributes, varyings, this.dest);
    this.setVaryings(n, varyings);
    position = this.dest.position;
    this.dividePosition();
    return position;
};
VertexShader.prototype.setVaryings = function(n, varyings) {
    var selfVaryings = this.varyings;
    var varying;
    for (var prop in varyings) {
        varying = varyings[prop];
        selfVaryings[prop][n] = varying;
    }
};
VertexShader.prototype.pickAttributes = function(index) {
    var attributes = this.attributes;
    var attrNums = this.attrNums;
    var attr = {};
    var attribute, num, vec, offset;
    for (var prop in attributes) {
        attribute = attributes[prop];
        num = attrNums[prop];
        vec = [];
        offset = index * num;
        for (var i = 0; i < num; i++) {
            vec[i] = attribute[offset + i];
        }
        attr[prop] = vec;
    }
    return attr;
};
VertexShader.prototype.dividePosition = function() {
    var position = this.dest.position;
    var w = position[3];
    position[0] /= w;
    position[1] /= w;
    position[2] /= w;
};
VertexShader.prototype.interpoleVaryings = function(a1, a2, a3) {
    var varyings = this.varyings;
    var ret = {};
    var varying, vary0, vary1, vary2, intp;
    for (var prop in varyings) {
        varying = varyings[prop];
        vary0 = varying[0];
        vary1 = varying[1];
        vary2 = varying[2];
        intp = [];
        for (var i = 0, l = vary0.length; i < l; i++) {
            intp[i] = vary0[i] * a1 + vary1[i] * a2 + vary2[i] * a3;
        }
        ret[prop] = intp;
    }
    return ret;
};

var FragmentShader = function(prog) {
    this.uniforms = {};
    this.varyings = {};
    this.dest = {};
    this.prog = prog || function() {};
};
FragmentShader.prototype.exec = function(varyings) {
    this.prog(this.uniforms, varyings, this.dest);
    var fragColor = this.dest.fragColor;
    fragColor[0] *= 255;
    fragColor[1] *= 255;
    fragColor[2] *= 255;
    fragColor[3] *= 255;
    return fragColor;
};
FragmentShader.discard = function() {
    throw FragmentShader.DISCARD_THROWABLE;
};
FragmentShader.DISCARD_THROWABLE = new Error('discard');

var Program = function(vertProg, fragProg) {
    this.vertexShader = new VertexShader(vertProg);
    this.fragmentShader = new FragmentShader(fragProg);
    this.uniforms = {};
    this.attributes = {};
    this.attrNums = {};
    this.varyings = {};
};
Program.prototype.setUniform = function(name, value) {
    this.uniforms[name] = value;
    this.vertexShader.uniforms[name] = value;
    this.fragmentShader.uniforms[name] = value;
};
Program.prototype.setAttribute = function(name, value, num) {
    this.attributes[name] = value;
    this.attrNums[name] = num;
    this.vertexShader.attributes[name] = value;
    this.vertexShader.attrNums[name] = num;
};
Program.prototype.setUniforms = function(obj) {
    for (var prop in obj) {
        this.setUniform(prop, obj[prop]);
    }
};
Program.prototype.setAttributes = function(obj) {
    var attr;
    for (var prop in obj) {
        attr = obj[prop];
        this.setAttribute(prop, attr.value, attr.num);
    }
};
Program.prototype.enableVarying = function(name) {
    this.varyings[name] = [];
    this.vertexShader.varyings[name] = [];
    this.fragmentShader.varyings[name] = [];
};
Program.prototype.enableVaryings = function(names) {
    for (var i = 0, l = names.length; i < l; i++) {
        this.enableVarying(names[i]);
    }
};

var Renderer = {};

Renderer.flush = function() {
    var colorBuffer = this.currentFrameBuffer.colorBuffer;
    this.context.putImageData(colorBuffer.imageData, 0, 0);
};

Renderer.renderTriangles = function(count, offset, indices) {
    var idx1, idx2, idx3;
    for (var i = offset, l = count * 3; i < l; i += 3) {
        idx1 = indices[i];
        idx2 = indices[i + 1];
        idx3 = indices[i + 2];
        this.renderTriangle(idx1, idx2, idx3);
    }
};

var CLOCKWISE = 1;
var COUNTERCLOCKWISE = -1;

Renderer.cullCheck = function(cw, pos1, pos2, pos3) {
    var v1 = [];
    var v2 = [];
    vec3.subtract(pos2, pos1, v1);
    vec3.subtract(pos3, pos1, v2);
    vec3.cross(v1, v2);
    return v1[2] * cw > 0;
};

Renderer.renderTriangle = function(idx1, idx2, idx3) {
    var program = this.currentProgram;
    var pos1 = program.vertexShader.exec(0, idx1);
    var pos2 = program.vertexShader.exec(1, idx2);
    var pos3 = program.vertexShader.exec(2, idx3);
    var solveMat;
    if (this.cullCheck(CLOCKWISE, pos1, pos2, pos3)) {
        solveMat = this.getBoundPixels(pos1, pos2, pos3);
        this.rasterize(pos1, pos2, pos3, solveMat);
    }
};


Renderer.getBoundPixels = function(pos1, pos2, pos3) {
    var minmaxbuf = this.currentFrameBuffer._minmaxBuffer;
    var hw = minmaxbuf.width / 2;
    var hh = minmaxbuf.height / 2;
    minmaxbuf.init();
    var x1 = Math.round(pos1[0] * hw) + hw;
    var y1 = -Math.round(pos1[1] * hh) + hh;
    var x2 = Math.round(pos2[0] * hw) + hw;
    var y2 = -Math.round(pos2[1] * hh) + hh;
    var x3 = Math.round(pos3[0] * hw) + hw;
    var y3 = -Math.round(pos3[1] * hh) + hh;

    this.boundLine(x1, y1, x2, y2, minmaxbuf);
    this.boundLine(x2, y2, x3, y3, minmaxbuf);
    this.boundLine(x3, y3, x1, y1, minmaxbuf);
    return mat3.inverse([
        x1, y1, 1,
        x2, y2, 1,
        x3, y3, 1
    ]);
};

Renderer.boundLine = function(sx, sy, ex, ey, minmaxbuf) {
    var ssx = ex < sx ? ex : sx;
    var ssy = ex < sx ? ey : sy;
    var eex = ex < sx ? sx : ex;
    var eey = ex < sx ? sy : ey;

    var width = eex - ssx;
    var height =  Math.abs(eey - ssy);
    var sloping = eey > ssy ? 1 : -1;
    var ret = [];
    if (width == height && width == 0) {
        minmaxbuf.feed(sx, sy);
    } else if (width > height) {
        var y = ssy;
        var sum = width;
        for (var x = ssx; x <= eex; x++) {
            if (sum >= width * 2) {
                y += sloping;
                sum -= width * 2;
            }
            sum += height * 2;
            minmaxbuf.feed(x, y);
        }
    } else {
        var sssy = ssy < eey ? ssy : eey;
        var eeey = ssy > eey ? ssy : eey;
        var x = ssy < eey ? ssx : eex;
        var sum = height;
        for (var y = sssy; y <= eeey; y++) {
            if (sum >= height * 2) {
                x += sloping;
                sum -= height * 2;
            }
            sum += width * 2;
            minmaxbuf.feed(x, y);
        }
    }
};

Renderer.rasterize = function(pos1, pos2, pos3, solveMat) {
    var colorBuffer = this.currentFrameBuffer.colorBuffer;
    var depthBuffer = this.currentFrameBuffer.depthBuffer;
    var minmaxbuf = this.currentFrameBuffer._minmaxBuffer;
    var vertexShader = this.currentProgram.vertexShader;
    var fragmentShader = this.currentProgram.fragmentShader;

    var vW = this.viewportWidth;
    var weightSolver = [];

    var w1 = pos1[3];
    var w2 = pos2[3];
    var w3 = pos3[3];
    var z1 = pos1[2];
    var z2 = pos2[2];
    var z3 = pos3[2];

    var weights = [];
    var scan, line, i, a1, a2, a3, d, idx, color, varying;
    for (var y = minmaxbuf.start, l = minmaxbuf.end; y < l; y++) {
        scan = minmaxbuf.buf[y];
        line = y * vW;
        for (var x = scan.min, ll = scan.max; x < ll; x++) {
            idx = (line + x) * 4;
            weights[0] = x;
            weights[1] = y;
            weights[2] = 1;
            mat3.multiplyVec3(solveMat, weights);
            a1 = weights[0];
            a2 = weights[1];
            a3 = weights[2];
            d = z1 * a1 + z2 * a2 + z3 * a3;
            if (depthBuffer.test(idx, d) && 0 < d && d <= 1) {
                idx = (line + x) * 4;
                try {
                    varying = vertexShader.interpoleVaryings(a1, a2, a3);
                    color = fragmentShader.exec(varying);
                    colorBuffer.write(idx, color);
                } catch(e) {
                    if (e.message === 'discard') {
                        continue;
                    } else {
                        throw e;
                    }
                }
                depthBuffer.write(idx, d);
            }
        }
    }
};

Biela.prototype = Renderer;

var Texture = function(image) {
    var canvasFactory = CanvasFactory.instance;
    var width = this.width = image.width;
    var height = this.height = image.height;
    this.canvas = canvasFactory.createCanvas(width, height);
    var ctx = this.canvas.getContext('2d');
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
        data[i] / 255,
        data[i + 1] / 255,
        data[i + 2] / 255,
        data[i + 3] / 255
    ];
};
Texture.prototype.tex2d = function(uv) {
    return this.getColorFromUV(uv[0], uv[1]);
};

var Classes = {
    FrameBuffer: FrameBuffer,
    RenderBuffer: RenderBuffer,
    ColorBuffer: ColorBuffer,
    DepthBuffer: DepthBuffer,
    MinMaxBuffer: MinMaxBuffer,
    Program: Program,
    VertexShader: VertexShader,
    FragmentShader: FragmentShader,
    Texture: Texture
};

Biela.export = function(target) {
    target = target || global;
    var Class;
    for (var prop in Classes) {
        target[prop] = Classes[prop];
    }
};

global.Biela = Biela;

}(this));
