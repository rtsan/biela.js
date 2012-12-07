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
