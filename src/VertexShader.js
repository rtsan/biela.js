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
    this.divideVaryings(n, position[3]);
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
VertexShader.prototype.divideVaryings = function(n, w) {
    var varyings = this.varyings;
    var vec;
    for (var prop in varyings) {
        vec = varyings[prop][n];
        for(var i = 0, l = vec.length; i < l; i++) {
            //vec[i] /= w;
        }
    }
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
