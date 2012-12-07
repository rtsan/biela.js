window.onload = function() {
    Biela.export();
    var biela = new Biela(320, 320);
    biela.currentFrameBuffer.colorBuffer.clearValue = [ 0, 0, 0, 255 ];
    document.body.appendChild(biela.canvas);

    var vertices = [
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,

        1.0, 1.0, -1.0,
        -1.0, 1.0, -1.0,
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,

        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,

        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,

        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,

        -1.0, 1.0, 1.0,
        -1.0, -1.0, 1.0,
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0
    ];
    var indices = [
        0, 1, 2,
        2, 3, 0,
        6, 5, 4,
        4, 7, 6,
        10, 9, 8,
        8, 11, 10,
        12, 13, 14,
        14, 15, 12,
        16, 17, 18,
        18, 19, 16,
        22, 21, 20,
        20, 23, 22
    ];
    vertices = vertices.map(function(n) {
        return n * 0.5;
    });
    var texCoords = [
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,

        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,

        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,

        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,

        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,

        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0
    ];

    var vert = function(uniforms, attributes, varyings, dest) {
        var uWorld = uniforms.uWorld;
        var uProj = uniforms.uProj;

        var aVertex = attributes.aVertex;
        var aTexCoord = attributes.aTexCoord;

        // main
        (function() {
            var position = aVertex;
            position[3] = 1;
            mat4.multiplyVec4(uWorld, aVertex, position);
            mat4.multiplyVec4(uProj, position, position);

            dest.position = position;
            varyings.vTexCoord = aTexCoord;
        }());
    };

    var frag = function(uniforms, varyings, dest) {
        var uSampler = uniforms.uSampler;

        var vTexCoord = varyings.vTexCoord;

        // main
        (function() {
            var color = uSampler.tex2d(vTexCoord);
            dest.fragColor = color;
        }());
    };

    var shader = window.shaderr = new Program(vert, frag);
    shader.enableVarying('vTexCoord');
    biela.currentProgram = shader;
    shader.setAttributes({
        aVertex: {
            value: vertices,
            num: 3
        },
        aTexCoord: {
            value: texCoords,
            num: 2
        }
    });
    var w = mat4.identity();
    var v = mat4.lookAt([0, 0, 10], [0, 0, 0], [0, 1, 0]);
    var p = mat4.perspective(20, 320 / 320, 1.0, 100.0);
    shader.setUniform('uProj', p);
    var wv = mat4.create();
    var tex, img1;
    img1 = new Image();
    img1.onload = function() {
        tex = new Texture(img1);
        shader.setUniform('uSampler', tex);
        setInterval(render, 1000 / 60);
    };
    img1.src = 'icon.png';
    var fps = document.createElement('div');
    document.body.appendChild(fps);
    var frame = 0;
    var now;
    var time = Date.now();
    var elapsed = 0;
    var render = function() {
        biela.currentFrameBuffer.clear();
        mat4.rotate(w, 1 * Math.PI / 180, [ 1, 0, 0 ]);
        mat4.rotate(w, 1 * Math.PI / 180, [ 0, 1, 0 ]);
        mat4.multiply(v, w, wv);
        shader.setUniform('uWorld', wv);
        biela.renderTriangles(indices.length / 3, 0, indices);
        biela.flush();
        frame++;
        now = Date.now();
        elapsed += now - time;
        time = now;
        if (elapsed > 1000) {
            fps.innerText = frame;
            elapsed -= 1000;
            frame = 0;
        }
    };
};
