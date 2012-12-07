module.exports = function(grunt) {
    grunt.initConfig({
        meta: {
            name: 'biela.js',
            version: 'v0.1.0',
            author: 'rtsan',
            repo: 'https://github.com/rtsan/biela.js',
            banner:
                '/*\n' +
                ' * <%= meta.name %> <%= meta.version %>\n' +
                ' * <%= meta.repo %>\n' +
                ' *\n' +
                ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= meta.author %>\n' +
                ' * Licensed under the MIT license.\n' +
                '*/',
            min_banner: '/* <%= meta.name %> <%= meta.version %> Licensed under the MIT license. (c) <%= meta.author %> */'
        },
        concat: {
            dist: {
                src: [
                    '<banner:meta.banner>',
                    'src/_intro.js',
                    'src/biela.js',
                    'src/CanvasFactory.js',
                    'src/RenderBuffer.js',
                    'src/ColorBuffer.js',
                    'src/DepthBuffer.js',
                    'src/FrameBuffer.js',
                    'src/MinMaxBuffer.js',
                    'src/VertexShader.js',
                    'src/FragmentShader.js',
                    'src/Program.js',
                    'src/Renderer.js',
                    'src/Texture.js',
                    'src/export.js',
                    'src/_outro.js'
                ],
                dest: 'build/biela.js'
            }
        },
        min: {
            dist: {
                src: [
                    '<banner:meta.min_banner>',
                    'build/biela.js'
                ],
                dest: 'build/biela.min.js'
            }
        }
    });
    grunt.registerTask('default', 'concat min');
};
