// List of all window instances.
const _WINODW_LIST = [];
const DRAG_WINDOW_ENABLE_LOG = false;

function newGuid() {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

class DragWindow {
    /**
     * Creates a new instance of DragWindow.
     * @param {string} title Title of the window.
     * @param {number} width Width of the window.
     * @param {number} height Height of the window.
     * @param {*} child Children of the window.
     */
    constructor(title, width, height, child = null) {
        this.id = "win_" + newGuid();
        this.title = title;
        this.width = width;
        this.height = height;
        this.child = child;

        this.isDragging = false;
        this.isHidden = false;
        this.xDiff = 0;
        this.yDiff = 0;
        this.x = 500;
        this.y = 325;

        this.createDOM();
        this.addEventListeners();
        //document.querySelector("#desktop")
        document.body.appendChild(this.element);
        this.updateUI();
    }

    createDOM() {
        this.element = document.createElement("div");
        this.element.id = this.id;
        this.element.classList.add('win');
        this.element.style.minWidth = this.width + 'px';

        // Create title bar
        this.titlebar = document.createElement("div");
        this.titlebar.classList.add('win-title');

        this.titlebar_text = document.createElement("div");
        this.titlebar_text.classList.add('win-title-text');
        this.titlebar_text.innerHTML = this.title;

        this.titlebar_controls = document.createElement("div");
        this.titlebar_controls.classList.add('win-title-controls');

        this.titlebar_controls_minimize = document.createElement("div");
        this.titlebar_controls_minimize.classList.add('button');
        this.titlebar_controls_minimize.classList.add('minimize');

        this.titlebar_controls_maximize = document.createElement("div");
        this.titlebar_controls_maximize.classList.add('button');
        this.titlebar_controls_maximize.classList.add('maximize');

        this.titlebar_controls_close = document.createElement("div");
        this.titlebar_controls_close.classList.add('button');
        this.titlebar_controls_close.classList.add('close');

        // Append Titlebar
        this.titlebar_controls.appendChild(this.titlebar_controls_minimize);
        this.titlebar_controls.appendChild(this.titlebar_controls_maximize);
        this.titlebar_controls.appendChild(this.titlebar_controls_close);

        this.titlebar.appendChild(this.titlebar_text);
        this.titlebar.appendChild(this.titlebar_controls);

        this.element.appendChild(this.titlebar);

        // Create window content
        this.content = document.createElement("div");
        this.content.classList.add('win-content');

        this.content_container = document.createElement("div");
        this.content_container.classList.add('container');
        this.content_container.style.minHeight = this.height + 'px';

        if (this.child) {
            this.content_container.appendChild(this.child);
        }

        this.content.appendChild(this.content_container);

        // Append content
        this.element.appendChild(this.content);
    }

    addEventListeners() {
        // Title bar
        this.titlebar_controls_minimize.addEventListener('click', () => {
            this.minimize();
        });

        this.titlebar_controls_close.addEventListener('click', () => {
            this.close();
        });

        this.titlebar.addEventListener('mousedown', (e) => {
            this.onMouseDown(e);
        })

        document.addEventListener('mousemove', (e) => {
            this.onMouseMove(e);
        });

        document.addEventListener('mouseup', () => {
            this.onMouseUp()
        });
    }

    /**
     * Update window state and position.
     */
    updateUI() {
        if (this.isHidden) {
            this.element.style.display = 'none';
        } else {
            this.element.style.display = '';
        }

        this.element.style.top = this.y + 'px';
        this.element.style.left = this.x + 'px';
    }

    minimize() {
        this.isHidden = true;
        this.updateUI();
        DragWindow.log(`Window[${this.id}}] minimized`);
    }

    close() {
        this.element.remove();
        _WINODW_LIST.splice(this.id, 1);
        DragWindow.log(`Window[${this.id}}] closed`);
    }

    onMouseUp() {
        if (this.isDragging) {
            this.isDragging = false;
            DragWindow.log(`Window[${this.id}}] drag end`);
        }
    }

    onMouseDown(e) {
        const isTitlebar = e.target === this.titlebar;
        const isText = e.target === this.titlebar_text;
        if (!isTitlebar && !isText) return;

        this.isDragging = true;
        this.xDiff = e.pageX - this.x;
        this.yDiff = e.pageY - this.y;

        DragWindow.log(`Window[${this.id}}] drag start`);
    }

    onMouseMove(e) {
        if (!this.isDragging) return;

        const clientWidth = this.element.clientWidth;
        const clientHeight = this.element.clientHeight;

        const x = Math.min(
            Math.max(0, e.pageX - this.xDiff),
            window.innerWidth - clientWidth
        );

        const y = Math.min(
            Math.max(0, e.pageY - this.yDiff),
            window.innerHeight - clientHeight
        );

        this.x = x;
        this.y = y;

        this.updateUI();
    }

    static log(message) {
        if (!DRAG_WINDOW_ENABLE_LOG) return;
        console.log(message);
    }

    /**
     * Open a new DragWindow.
     * @param {string} title Title of the window.
     * @param {HTMLElement} child Main content of the window.
     * @param {number} _width Width of the window.
     * @param {number} _height Height of the window.
     * @param {boolean} useAutoSize Should window fit to contentsize.
     */
    static show(title, child = null, _width = 200, _height = 200, useAutoSize = true) {
        const clonedChild = child.cloneNode(true);

        let width, height;
        if (useAutoSize && child !== null) {
            width = parseInt(clonedChild.style.width);
            height = parseInt(clonedChild.style.height);
        }

        if (!width) {
            width = _width;
        }

        if (!height) {
            height = _height;
        }

        const newWin = new DragWindow(title, width + 20, height, clonedChild);
        _WINODW_LIST[newWin.id] = newWin;
        DragWindow.log(`Window[${newWin.id}}] created`);
    }
}