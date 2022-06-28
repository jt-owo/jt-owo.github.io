// List of all window instances.
const _WINDOW_LIST = [];
const DRAG_WINDOW_ENABLE_LOG = false;

//https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
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
    constructor(title, width, height, posX, posY, child = null, icon) {
        this.id = "win_" + newGuid();
        this.title = title;
        this.width = width;
        this.height = height;
        this.child = child;
        this.icon = icon;

        this.isDragging = false;
        this.isHidden = false;
        this.xDiff = 0;
        this.yDiff = 0;
        this.x = posX;
        this.y = posY;

        this.createDOM();
        this.addEventListeners();
        document.querySelector("#desktop").appendChild(this.element);

        this.updateUI();
    }

    /**
     * Creates the DOM elements required for the window.
     */
    createDOM() {
        this.element = document.createElement("div");
        this.element.id = this.id;
        this.element.classList.add('win');
        this.element.style.minWidth = this.width + 10 + 'px';

        // Create titlebar
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

        // Append titlebar
        this.titlebar_controls.appendChild(this.titlebar_controls_minimize);
        //this.titlebar_controls.appendChild(this.titlebar_controls_maximize);
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

        // Append window content
        if (this.child) {
            this.content_container.appendChild(this.child);
        }

        this.content.appendChild(this.content_container);
        this.element.appendChild(this.content);
    }

    /**
     * Adds the event listeners required for the window.
     */
    addEventListeners() {
        // Window
        this.element.addEventListener('mousedown', () => {
            this.focus();
        });

        // Title bar
        this.titlebar_controls_minimize.addEventListener('click', (e) => {
            this.minimize();
        });

        this.titlebar_controls_minimize.addEventListener('touchend', () => {
            this.minimize();
        })

        this.titlebar_controls_close.addEventListener('click', () => {
            this.close();
        });

        this.titlebar_controls_close.addEventListener('touchend', () => {
            this.close();
        });

        this.titlebar.addEventListener('mousedown', (e) => {
            this.onMouseDown(e);
        });

        this.titlebar.addEventListener('touchstart', (e) => {
            this.onTouchStart(e);
        });

        // Document
        document.addEventListener('mousemove', (e) => {
            this.onMouseMove(e);
        });

        document.addEventListener('touchmove', (e) => {
            this.onTouchMove(e);
        });

        document.addEventListener('mouseup', () => {
            this.onMouseUp()
        });

        document.addEventListener('touchend', () => {
            this.onMouseUp()
        });
    }

    /**
     * Updates window state and position.
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

    /**
     * Minimizes the window to taskbar.
     */
    minimize() {
        this.isHidden = true;
        this.updateUI();

        Taskbar.removeCurrentFocus();

        DragWindow.log(`Window[${this.id}] minimized`);
    }

    /**
     * Closes the window.
     */
    close() {
        this.element.remove();
        _WINDOW_LIST.splice(this.id, 1);
        DragWindow.log(`Window[${this.id}] closed`);

        // Interop Taskbar.js
        const taskbarItem = document.querySelector(`#taskbar_${this.id}`);
        taskbarItem.remove();
    }

    /**
     * Handles the drop.
     */
    onMouseUp() {
        if (this.isDragging) {
            this.isDragging = false;
            DragWindow.log(`Window[${this.id}] drag end`);
        }
    }

    /**
     * Handles the drag start.
     * @param {Event} e Event
     */
    onMouseDown(e) {
        const isTitlebar = e.target === this.titlebar;
        const isText = e.target === this.titlebar_text;
        if (!isTitlebar && !isText) return;

        this.isDragging = true;
        this.xDiff = e.pageX - this.x;
        this.yDiff = e.pageY - this.y;

        DragWindow.log(`Window[${this.id}] drag start`);
    }

    /**
     * Handles the drag start
     * @param {TouchEvent} e Event
     */
    onTouchStart(e) {
        e.preventDefault();

        const lastTouch = e.changedTouches[0];

        const isTitlebar = lastTouch.target === this.titlebar;
        const isText = lastTouch.target === this.titlebar_text;
        if (!isTitlebar && !isText) return;

        this.isDragging = true;
        this.xDiff = lastTouch.pageX - this.x;
        this.yDiff = lastTouch.pageY - this.y;

        DragWindow.log(`Window[${this.id}] touch start`);
    }

    /**
     * Handles the drag.
     * @param {MouseEvent} e Event
     */
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

    /**
     * Handles the drag
     * @param {TouchEvent} e Event
     */
    onTouchMove(e) {
        if (!this.isDragging) return;

        const clientWidth = this.element.clientWidth;
        const clientHeight = this.element.clientHeight;

        const lastTouch = e.changedTouches[0];

        const x = Math.min(
            Math.max(0, lastTouch.pageX - this.xDiff),
            window.innerWidth - clientWidth
        );

        const y = Math.min(
            Math.max(0, lastTouch.pageY - this.yDiff),
            window.innerHeight - clientHeight
        );

        this.x = x;
        this.y = y;

        this.updateUI();
    }

    /**
     * Sets the focus to this window.
     * @param {boolean} fromTaskbar If the focus method was called from the taskbar.
     */
    focus(fromTaskbar = false) {
        this.isHidden = false;

        Object.values(_WINDOW_LIST).forEach((item, index) => {
            item.element.style.zIndex = 0
        });
        this.element.style.zIndex = 1;

        // Taskbar interop to focus the taskbar element when the window was clicked.
        if (!fromTaskbar) {
            const taskbarItem = document.querySelector(`#taskbar_${this.id}`);
            Taskbar.onItemSelect(taskbarItem);
        }

        this.updateUI();
    }

    /**
     * Log wrapper function
     * @param {*} message Log message.
     */
    static log(message) {
        if (!DRAG_WINDOW_ENABLE_LOG) return;
        console.log(message);
    }

    /**
     * Opens a new window.
     * @param {string} title Title of the window.
     * @param {HTMLElement} child Main content of the window.
     * @param {number} _width Width of the window.
     * @param {number} _height Height of the window.
     * @param {boolean} fitToContentSize Should window dimensions fit to contentsize.
     */
    static show(title, child = null, icon, posX = 0, posY = 0, _width = 200, _height = 200, fitToContentSize = true) {
        const clonedChild = child !== null ? child.cloneNode(true) : null;

        let width, height;
        if (fitToContentSize && child !== null) {
            width = parseInt(clonedChild.style.width);
            height = parseInt(clonedChild.style.height);
        }

        if (!width) {
            width = _width;
        }

        if (!height) {
            height = _height;
        }

        // FIXME: Add padding remove +20
        const newWin = new DragWindow(title, width + 20, height, posX, posY, clonedChild, icon);
        _WINDOW_LIST[newWin.id] = newWin;
        DragWindow.log(`Window[${newWin.id}] created`);
        Taskbar.add(newWin);
    }
}