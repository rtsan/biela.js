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
    var normals = [
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0
    ];

    var refrect3d = function(i, n) {
        var d = -2 * vec3.dot(i, n);
        return [ i[0] + d * n[0], i[1] + d * n[1], i[2] + d * n[2] ];
    };
    var sign1d = function(n) {
        return Math.floor(n / Math.abs(n)) || 0;
    };

    var vert = function(uniforms, attributes, varyings, dest) {
        var uWorld = uniforms.uWorld;
        var uProj = uniforms.uProj;
        var uNormMat = uniforms.uNormMat;

        var aVertex = attributes.aVertex;
        var aTexCoord = attributes.aTexCoord;
        var aNormal = attributes.aNormal;

        // main
        (function() {
            var position = aVertex;
            position[3] = 1;
            mat4.multiplyVec4(uWorld, aVertex, position);
            mat4.multiplyVec4(uProj, position, position);

            dest.position = position;
            varyings.vTexCoord = aTexCoord;
            varyings.vNormal = mat3.multiplyVec3(uNormMat, aNormal);
        }());
    };

    var frag = function(uniforms, varyings, dest) {
        var uSampler = uniforms.uSampler;
        var uAmbientColor = uniforms.uAmbientColor;
        var uDirectionalLightColor = uniforms.uDirectionalLightColor;
        var uLightDirection = uniforms.uLightDirection;
        var uInverseLookVec = uniforms.uInverseLookVec;
        var uAmbient = uniforms.uAmbient;
        var uDiffuse = uniforms.uDiffuse;
        var uSpecular = uniforms.uSpecular;
        var uEmission = uniforms.uEmission;
        var uShininess = uniforms.uShininess;

        var vTexCoord = varyings.vTexCoord;
        var vNormal = varyings.vNormal;

        var amb = [];
        var iLD = [];
        var dif = [];
        var specColor = [];
        var fragColor = [];

        // main
        (function() {
            var color = uSampler.tex2d(vTexCoord);
            vec4.multiply(uAmbient, uAmbientColor, amb);
            vec3.negate(uLightDirection, iLD);
            var R = refrect3d(iLD, vNormal);
            var lamber = Math.max(vec3.dot(vNormal, uLightDirection), 0);
            vec4.scale(uDiffuse, lamber, dif);
            var s = Math.max(vec3.dot(R, uInverseLookVec), 0);
            vec4.scale(uSpecular, (uShininess + 2) / (Math.PI * 2) * sign1d(lamber) * Math.pow(s, uShininess), specColor);
            vec4.add(dif, specColor, fragColor);
            vec4.multiply(color, fragColor);
            vec4.multiply(uDirectionalLightColor, fragColor);
            vec4.add(amb, fragColor);

            dest.fragColor = fragColor;
        }());
    };

    var shader = window.shaderr = new Program(vert, frag);
    shader.enableVaryings([ 'vTexCoord', 'vNormal' ]);
    biela.currentProgram = shader;
    shader.setAttributes({
        aVertex: {
            value: vertices,
            num: 3
        },
        aNormal: {
            value: normals,
            num: 3
        },
        aTexCoord: {
            value: texCoords,
            num: 2
        }
    });
    shader.setUniforms({
        uAmbientColor: [ 0.8, 0.8, 0.8, 1.0 ],
        uDirectionalLightColor: [ 0.8, 0.8, 0.8, 1.0 ],
        uLightDirection: vec3.normalize([ 0.5, 0.5, 1.0 ]),
        uInverseLookVec: [ 0, 0, 1 ],
        uAmbient: [ 0.1, 0.1, 0.1, 1.0 ],
        uDiffuse: [ 1.0, 1.0, 1.0, 1.0 ],
        uSpecular: [ 1.0, 1.0, 1.0, 1.0 ],
        uEmission: [ 0.0, 0.0, 0.0, 1.0 ],
        uShininess: 20
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
        setInterval(render, 1000 / 30);
    };
    img1.src = 'icon.png';
    var fps = document.createElement('div');
    document.body.appendChild(fps);
    var frame = 0;
    var now;
    var time = Date.now();
    var elapsed = 0;
    var normMat = [];
    var render = function() {
        biela.currentFrameBuffer.clear();
        mat4.rotate(w, 1 * Math.PI / 180, [ 1, 0, 0 ]);
        mat4.rotate(w, 1 * Math.PI / 180, [ 0, 1, 0 ]);
        mat4.multiply(v, w, wv);
        mat4.toInverseMat3(wv, normMat);
        mat3.transpose(normMat);
        shader.setUniforms({
            uWorld: wv,
            uNormMat: normMat
        });
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
