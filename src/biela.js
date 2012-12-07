var Biela = function(arg) {
    var canvasFactory = CanvasFactory.instance;
    if (arguments.length === 1) {
        if (arguments[0].nodeName === 'CANVAS') {
            this.canvas = arguments[0];
            this.width = this.canvas.width;
            this.height = this.canvas.height;
        } else if (typeof arguments[0] === 'string') {
            this.canvas = document.getElementById('canvas');
            if (!this.canvas) {
                throw new Error('#' + arguments[0] + ' is not found');
            }
            this.width = this.canvas.width;
            this.height = this.canvas.height;
        }
    } else {
        var width = this.width = arguments[0];
        var height = this.height = arguments[1];

        this.canvas = canvasFactory.createCanvas(width, height);
    }
    this.viewportLeft = this.viewportTop = 0;
    this.viewportWidth = this.width;
    this.viewportHeight = this.height;
    this.context = this.canvas.getContext('2d');
    this.currentProgram = null;
    this.defaultFrameBuffer = new FrameBuffer(this.width, this.height);
    this.currentFrameBuffer = this.defaultFrameBuffer;
};
