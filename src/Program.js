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
