class Taskbar {
    /**
     * Initializes the taskbar.
     */
    public static init() {
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

    /**
     * Adds a new element to the taskbar.
     * @param {DragWindow} win 
     */
    public static addItem(win: DragWindow, autoSelect = true) {
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

    /**
     * Toggles the visiblity of the menu.
     * @param {boolean} forceClose - True if the menu should be closed no matter what the current state is.
     */
    public static toggleStartMenu(forceClose: boolean = false) {
        const startMenu = document.getElementById("menu");
        const startButton = document.getElementById("start-button");
        if (!startMenu || !startButton) return;

        if (forceClose || startButton.classList.contains("active")) {
            startButton.classList.remove("active");
            startMenu.classList.remove("open");
        } else {
            startButton.classList.add("active");
            startMenu.classList.add("open");
        }
    }

    /**
     * Removes the focus of the current focused taskbar item.
     */
    public static removeCurrentFocus() {
        const activeItem = document.querySelector(".focused");
        if (activeItem) {
            activeItem.classList.remove("focused");
        }
    }

    /**
     * Selects/Deselects an item depending on the focused state.
     * @param {MouseEvent} e  Event.
     */
    public static onTaskbarItemClick(e: MouseEvent) {
        Taskbar.removeCurrentFocus();
        Taskbar.toggleStartMenu(true);

        // If icon is clicked pick the parent element as target.
        let target: HTMLElement | null = e.target as HTMLElement;

        // User can click on the icon inside of the button, check for that.
        if (target?.tagName === "I") {
            target = target.parentElement;
        }

        if (target?.classList.contains("focused")) {
            Taskbar.onItemDeselect(target as HTMLDivElement);
        } else {
            Taskbar.onItemSelect(target as HTMLDivElement);
        }
    }

    /**
     * Selects a taskbar item and set active focus.
     * @param {HTMLDivElement} item Item to select.
     */
    public static onItemSelect(item: HTMLDivElement) {
        Taskbar.removeCurrentFocus();
        item.classList.add("focused");

        // Interop with Window.js
        if (_WINDOW_LIST && Object.keys(_WINDOW_LIST).length > 0) {
            const win = _WINDOW_LIST.find(x => x.ID === item.id.substring("taskbar_".length));
            if (win) win.focus(true);
        }
    }

    /**
     * Deselects a taskbar item.
     * @param {HTMLDivElement} item Item to deselect.
     */
    public static onItemDeselect(item: HTMLDivElement) {
        item.classList.remove("focused");
    }

    /**
     * Updates time string in taskbar.
     */
    public static updateClock() {
        const timeText = document.getElementById("taskbar-time");
        if(!timeText) return;
        timeText.innerHTML = `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
}