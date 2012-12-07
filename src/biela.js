var Biela = function(arg) {
    if (arguments.length === 1) {
        if (arguments[0].nodeName === 'CANVAS') {
            this.canvas = arguments[0];
        } else if (typeof arguments[0] === 'string') {
            this.canvas = document.getElementById('canvas');
            if (!this.canvas) {
                throw new Error('#' + arguments[0] + ' is not found');
            }
        } else if (typeof arguments[0] === 'number') {
            this.width = this.height = arguments[0];
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.canvas.height = this.width;
        }
    } else {
        this.width = arguments[0];
        this.height = arguments[1];

        this.viewportLeft = this.viewportTop = 0;
        this.viewportWidth = this.width;
        this.viewportHeight = this.height;

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }
    this.context = this.canvas.getContext('2d');
    this.currentProgram = null;
    this.defaultFrameBuffer = new FrameBuffer(this.width, this.height);
    this.currentFrameBuffer = this.defaultFrameBuffer;
};
