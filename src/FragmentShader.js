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
