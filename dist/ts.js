"use strict";
class Platform {
    static get isMobile() {
        return (/Mobi|Android/i.test(navigator.userAgent));
    }
}
function newGuid() {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
class Taskbar {
    static init() {
        const startButton = document.getElementById("start-button");
        if (startButton) {
            startButton.addEventListener('click', () => {
                Taskbar.toggleStartMenu();
            });
        }
        Taskbar.updateClock();
        setInterval(() => {
            Taskbar.updateClock();
        }, 1000);
    }
    static addItem(win, autoSelect = true) {
        const div = document.createElement("div");
        div.classList.add("taskbar-item");
        div.id = "taskbar_" + win.ID;
        const i = document.createElement("i");
        i.classList.add("icon");
        i.classList.add(win.Icon);
        div.appendChild(i);
        div.addEventListener('click', (e) => {
            Taskbar.onTaskbarItemClick(e);
        });
        const taskbarItemsHost = document.getElementById("taskbar-items");
        if (taskbarItemsHost) {
            taskbarItemsHost.appendChild(div);
        }
        if (autoSelect)
            Taskbar.onItemSelect(div);
    }
    static toggleStartMenu(forceClose = false) {
        const startMenu = document.getElementById("menu");
        const startButton = document.getElementById("start-button");
        if (!startMenu || !startButton)
            return;
        if (forceClose || startButton.classList.contains("active")) {
            startButton.classList.remove("active");
            startMenu.classList.remove("open");
        }
        else {
            startButton.classList.add("active");
            startMenu.classList.add("open");
        }
    }
    static removeCurrentFocus() {
        const activeItem = document.querySelector(".focused");
        if (activeItem) {
            activeItem.classList.remove("focused");
        }
    }
    static onTaskbarItemClick(e) {
        Taskbar.removeCurrentFocus();
        Taskbar.toggleStartMenu(true);
        let target = e.target;
        if ((target === null || target === void 0 ? void 0 : target.tagName) === "I") {
            target = target.parentElement;
        }
        if (target === null || target === void 0 ? void 0 : target.classList.contains("focused")) {
            Taskbar.onItemDeselect(target);
        }
        else {
            Taskbar.onItemSelect(target);
        }
    }
    static onItemSelect(item) {
        Taskbar.removeCurrentFocus();
        item.classList.add("focused");
        if (_WINDOW_LIST && Object.keys(_WINDOW_LIST).length > 0) {
            const win = _WINDOW_LIST.find(x => x.ID === item.id.substring("taskbar_".length));
            if (win)
                win.focus(true);
        }
    }
    static onItemDeselect(item) {
        item.classList.remove("focused");
    }
    static updateClock() {
        const timeText = document.getElementById("taskbar-time");
        if (!timeText)
            return;
        timeText.innerHTML = `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
}
const _WINDOW_LIST = [];
const DRAG_WINDOW_ENABLE_LOG = false;
class DragWindow {
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
        const desktop = document.querySelector("#desktop");
        if (desktop) {
            desktop.appendChild(this.element);
        }
        else {
            console.error("Desktop Component not found.");
        }
        this.updateUI();
    }
    get ID() {
        return this.id;
    }
    get Icon() {
        return this.icon;
    }
    get Element() {
        return this.element;
    }
    createDOM() {
        this.element = document.createElement("div");
        this.element.id = this.id;
        this.element.classList.add('win');
        this.element.style.minWidth = this.width + 10 + 'px';
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
        this.titlebar_controls.appendChild(this.titlebar_controls_minimize);
        this.titlebar_controls.appendChild(this.titlebar_controls_close);
        this.titlebar.appendChild(this.titlebar_text);
        this.titlebar.appendChild(this.titlebar_controls);
        this.element.appendChild(this.titlebar);
        this.content = document.createElement("div");
        this.content.classList.add('win-content');
        this.content_container = document.createElement("div");
        this.content_container.classList.add('container');
        this.content_container.style.minHeight = this.height + 'px';
        if (this.child) {
            this.content_container.appendChild(this.child);
        }
        this.content.appendChild(this.content_container);
        this.element.appendChild(this.content);
    }
    addEventListeners() {
        this.element.addEventListener('mousedown', () => {
            this.focus();
        });
        this.element.addEventListener('touchstart', () => {
            this.focus();
        });
        this.titlebar_controls_minimize.addEventListener('click', (e) => {
            this.minimize();
        });
        this.titlebar_controls_minimize.addEventListener('touchend', () => {
            this.minimize();
        });
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
        document.addEventListener('mousemove', (e) => {
            this.onMouseMove(e);
        });
        document.addEventListener('touchmove', (e) => {
            this.onTouchMove(e);
        });
        document.addEventListener('mouseup', () => {
            this.onMouseUp();
        });
        document.addEventListener('touchend', () => {
            this.onMouseUp();
        });
    }
    updateUI() {
        if (this.isHidden) {
            this.element.style.display = 'none';
        }
        else {
            this.element.style.display = '';
        }
        this.element.style.top = this.y + 'px';
        this.element.style.left = this.x + 'px';
    }
    minimize() {
        this.isHidden = true;
        this.updateUI();
        Taskbar.removeCurrentFocus();
        DragWindow.log(`Window[${this.id}] minimized`);
    }
    close() {
        this.element.remove();
        const toRemoveIndex = _WINDOW_LIST.indexOf(this);
        if (toRemoveIndex > -1) {
            _WINDOW_LIST.splice(toRemoveIndex, 1);
        }
        DragWindow.log(`Window[${this.id}] closed`);
        const taskbarItem = document.querySelector(`#taskbar_${this.id}`);
        if (taskbarItem) {
            taskbarItem.remove();
        }
    }
    onMouseUp() {
        if (this.isDragging) {
            this.isDragging = false;
            DragWindow.log(`Window[${this.id}] drag end`);
        }
    }
    onMouseDown(e) {
        const isTitlebar = e.target === this.titlebar;
        const isText = e.target === this.titlebar_text;
        if (!isTitlebar && !isText)
            return;
        this.isDragging = true;
        this.xDiff = e.pageX - this.x;
        this.yDiff = e.pageY - this.y;
        DragWindow.log(`Window[${this.id}] drag start`);
    }
    onTouchStart(e) {
        e.preventDefault();
        const lastTouch = e.changedTouches[0];
        const isTitlebar = lastTouch.target === this.titlebar;
        const isText = lastTouch.target === this.titlebar_text;
        if (!isTitlebar && !isText)
            return;
        this.isDragging = true;
        this.xDiff = lastTouch.pageX - this.x;
        this.yDiff = lastTouch.pageY - this.y;
        DragWindow.log(`Window[${this.id}] touch start`);
    }
    onMouseMove(e) {
        if (!this.isDragging)
            return;
        const clientWidth = this.element.clientWidth;
        const clientHeight = this.element.clientHeight;
        const x = Math.min(Math.max(0, e.pageX - this.xDiff), window.innerWidth - clientWidth);
        const y = Math.min(Math.max(0, e.pageY - this.yDiff), window.innerHeight - clientHeight);
        this.x = x;
        this.y = y;
        this.updateUI();
    }
    onTouchMove(e) {
        if (!this.isDragging)
            return;
        const clientWidth = this.element.clientWidth;
        const clientHeight = this.element.clientHeight;
        const lastTouch = e.changedTouches[0];
        const x = Math.min(Math.max(0, lastTouch.pageX - this.xDiff), window.innerWidth - clientWidth);
        const y = Math.min(Math.max(0, lastTouch.pageY - this.yDiff), window.innerHeight - clientHeight);
        this.x = x;
        this.y = y;
        this.updateUI();
    }
    focus(fromTaskbar = false) {
        this.isHidden = false;
        _WINDOW_LIST.forEach(item => { item.element.style.zIndex = "0"; });
        this.element.style.zIndex = "1";
        if (!fromTaskbar) {
            const taskbarItem = document.querySelector(`#taskbar_${this.id}`);
            Taskbar.onItemSelect(taskbarItem);
        }
        this.updateUI();
    }
    static log(message) {
        if (!DRAG_WINDOW_ENABLE_LOG)
            return;
        console.log(message);
    }
    static show(options) {
        let clonedChild = null;
        if (options.child !== null) {
            clonedChild = options.child.cloneNode(true);
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
        const newWin = new DragWindow(options.title, width, height, options.x, options.y, clonedChild, options.icon);
        _WINDOW_LIST.push(newWin);
        DragWindow.log(`Window[${newWin.id}] created`);
        Taskbar.addItem(newWin);
    }
}
//# sourceMappingURL=ts.js.map