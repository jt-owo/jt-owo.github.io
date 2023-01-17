// List of all window instances.
const _WINDOW_LIST: DragWindow[] = [];
const DRAG_WINDOW_ENABLE_LOG = false;

interface IWindowOptions {
    title: string;
    width: number;
    height: number;
    child: HTMLElement | null;
    icon: string;
    x: number;
    y: number;
    fitSizeToContent: boolean;
}

class DragWindow {
    private id: string;
    private title: string;
    private width: number;
    private height: number;
    private child: HTMLElement | null;
    private icon: string;

    private isDragging: boolean;
    private isHidden: boolean;
    private xDiff: number;
    private yDiff: number;
    private x: number;
    private y: number;

    private element: HTMLDivElement;
    private titlebar: HTMLDivElement;
    private titlebar_text: HTMLDivElement;
    private titlebar_controls: HTMLDivElement;
    private titlebar_controls_minimize: HTMLDivElement;
    private titlebar_controls_maximize: HTMLDivElement;
    private titlebar_controls_close: HTMLDivElement;
    private content: HTMLDivElement;
    private content_container: HTMLDivElement;

    public get ID() {
        return this.id;
    }

    public get Icon() {
        return this.icon;
    }

    public get Element() {
        return this.element;
    }

    /**
     * Creates a new instance of DragWindow.
     * @param {string} title Title of the window.
     * @param {number} width Width of the window.
     * @param {number} height Height of the window.
     * @param {*} child Children of the window.
     */
    constructor(title: string, width: number, height: number, posX: number, posY: number, child: HTMLElement | null = null, icon: string) {
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
        
        const desktop = document.querySelector("#desktop");
        if (desktop) {
            desktop.appendChild(this.element);
        } else {
            console.error("Desktop Component not found.");
        }

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

        this.element.addEventListener('touchstart', () => {
            this.focus();
        })

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
        const toRemoveIndex = _WINDOW_LIST.indexOf(this);
        if (toRemoveIndex > -1) {
            _WINDOW_LIST.splice(toRemoveIndex, 1);
        }
        DragWindow.log(`Window[${this.id}] closed`);

        // Interop Taskbar.js
        const taskbarItem = document.querySelector(`#taskbar_${this.id}`);
        if (taskbarItem) {
            taskbarItem.remove();
        }
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
     * @param {MouseEvent} e Event
     */
    onMouseDown(e: MouseEvent) {
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
    onTouchStart(e: TouchEvent) {
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
    onMouseMove(e: MouseEvent) {
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
    onTouchMove(e: TouchEvent) {
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
    focus(fromTaskbar: boolean = false) {
        this.isHidden = false;
        
        _WINDOW_LIST.forEach(item => { item.element.style.zIndex = "0"; });
        this.element.style.zIndex = "1";

        // Taskbar interop to focus the taskbar element when the window was clicked.
        if (!fromTaskbar) {
            const taskbarItem = document.querySelector(`#taskbar_${this.id}`) as HTMLDivElement;
            Taskbar.onItemSelect(taskbarItem);
        }

        this.updateUI();
    }

    /**
     * Log wrapper function
     * @param {*} message Log message.
     */
    static log(message: any) {
        if (!DRAG_WINDOW_ENABLE_LOG) return;
        console.log(message);
    }

    /**
     * Opens a new window.
     * @param {IWindowOptions} options Window options.
     */
    static show(options: IWindowOptions) {
        let clonedChild: HTMLElement | null = null;
        if (options.child !== null) {
            clonedChild = options.child.cloneNode(true) as HTMLElement;
        }
        
        let width, height;
        if (options.fitSizeToContent && clonedChild !== null) {
            width = parseInt(clonedChild.style.width);
            height = parseInt(clonedChild.style.height);
        }

        if (!width) {
            width = options.width;
        }

        if (!height) {
            height = options.height;
        }

        const newWin: DragWindow = new DragWindow(options.title, width, height, options.x, options.y, clonedChild, options.icon);
        _WINDOW_LIST.push(newWin);
        DragWindow.log(`Window[${newWin.id}] created`);
        Taskbar.addItem(newWin);
    }
}