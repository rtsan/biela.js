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
