interface IDesktopItem {
    text: string;
    icon: string;
    onClick: () => void;
}

class Desktop {
    /**
     * Initializes the desktop.
     */
    public static init() {
        const desktop = document.querySelector('#desktop');
        if (desktop) {
            desktop.addEventListener('click', () => {
                Taskbar.toggleStartMenu(true);
            });
        } else {
            console.error("Desktop element was not found");
        }
    }

    /**
     * Adds a new item to the desktop DOM.
     * @param _item Item.
     */
    public static addItem(_item: IDesktopItem) {
        const desktop = document.querySelector('#desktop');
        const item = Desktop.createItem(_item.text, _item.icon, _item.onClick);

        desktop?.appendChild(item);
    }

    /**
     * Creates a new desktop item.
     * @param _text Text.
     * @param _icon Icon type.
     * @param onClick Click function.
     * @returns 
     */
    public static createItem(_text: string, _icon: string, onClick: () => void) {
        const item = document.createElement('div');
        item.classList.add('desktop-item');

        const iconContainer = document.createElement('div');
        iconContainer.classList.add('icon-container');

        const icon = document.createElement('i');
        icon.classList.add('icon');
        icon.classList.add(_icon);

        const text = document.createElement('span');
        text.innerHTML = _text;

        iconContainer.appendChild(icon);
        iconContainer.appendChild(text);

        item.appendChild(iconContainer);

        item.addEventListener('click', onClick);

        return item;
    }

    public static shutdown() {
        const shutdownScreen = document.querySelector('#shutdownScreen');
        if (!shutdownScreen) return;

        shutdownScreen.classList.add('show');
        setTimeout(() => {
            window.close();
        }, 3e3)
    }
}