class Taskbar {
    /**
     * Initializes the Taskbar. (Menu Button + Clock)
     */
    static init() {
        const startButton = document.getElementById("start-button");
        if (startButton) {
            startButton.addEventListener('click', () => {
                Taskbar.toggleStartMenu();
            });
        }

        Taskbar.clock();
        setInterval(() => {
            Taskbar.clock();
        }, 1000);
    }

    /**
     * Adds a new element to the taskbar.
     * @param {DragWindow} win 
     */
    static add(win, autoSelect = true) {
        const div = document.createElement("div");
        div.classList.add("taskbar-item");
        div.id = "taskbar_" + win.id;

        const i = document.createElement("i");
        i.classList.add("icon");
        i.classList.add(win.icon);

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
    static toggleStartMenu(forceClose = false) {
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
    static removeCurrentFocus() {
        const activeItem = document.querySelector(".focused");
        if (activeItem) {
            activeItem.classList.remove("focused");
        }
    }

    /**
     * Selects/Deselects an item depending on the focused state.
     * @param {Event} e  Click event.
     */
    static onTaskbarItemClick(e) {
        Taskbar.removeCurrentFocus();
        Taskbar.toggleStartMenu(true);

        // If icon is clicked pick the parent element as target.
        let target = e.target;
        if (target.tagName === "I") {
            target = target.parentElement;
        }

        if (target.classList.contains("focused")) {
            Taskbar.onItemDeselect(target);
        } else {
            Taskbar.onItemSelect(target);
        }
    }

    /**
     * Selects a taskbar item and set active focus.
     * @param {HTMLDivElement} item Item to select.
     */
    static onItemSelect(item) {
        Taskbar.removeCurrentFocus();
        item.classList.add("focused");

        // Interop with Window.js
        if (_WINDOW_LIST && Object.keys(_WINDOW_LIST).length > 0) {
            const win = _WINDOW_LIST[item.id.substring("taskbar_".length)];
            if (win) win.focus(true);
        }
    }

    /**
     * Deselects a taskbar item
     * @param {HTMLDivElement} item 
     */
    static onItemDeselect(item) {
        item.classList.remove("focused");
    }

    /**
     * Update time string in taskbar.
     */
    static clock() {
        const timeText = document.getElementById("taskbar-time");
        if (!timeText) return
        timeText.innerHTML = `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
}