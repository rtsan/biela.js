module.exports = function(grunt) {
    grunt.initConfig({
        meta: {
            name: 'biela.js',
            version: 'v0.1.0',
            author: 'rtsan',
            banner: '/**\n\
 * <%= meta.name %> <%= meta.version %>\n\
 *\n\
 * Copyright (c) <%= grunt.template.today("yyyy") %> <%= meta.author %>\n\
 *\n\
 * Permission is hereby granted, free of charge, to any person obtaining\n\
 * a copy of this software and associated documentation files\n\
 * (the "Software"), to deal in the Software without restriction,\n\
 * including without limitation the rights to use, copy, modify, merge,\n\
 * publish, distribute, sublicense, and/or sell copies of the Software,\n\
 * and to permit persons to whom the Software is furnished to do so,\n\
 * subject to the following conditions:\n\
 *\n\
 * The above copyright notice and this permission notice shall be\n\
 * included in all copies or substantial portions of the Software.\n\
 *\n\
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,\n\
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF\n\
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.\n\
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY\n\
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,\n\
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH\n\
 * THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n\
 */',
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
