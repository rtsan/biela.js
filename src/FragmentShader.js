var FragmentShader = function(prog) {
    this.uniforms = {};
    this.varyings = {};
    this.dest = {};
    this.prog = prog || function() {};
};
FragmentShader.prototype.exec = function(varyings) {
    this.prog(this.uniforms, varyings, this.dest);
    return this.dest.fragColor;
};
FragmentShader.discard = function() {
    throw FragmentShader.DISCARD_THROWABLE;
};
FragmentShader.DISCARD_THROWABLE = new Error('discard');
