function initTaskbar() {
    const taskbarItems = document.getElementsByClassName("taskbar-item");
    if (taskbarItems) {
        for (const item of taskbarItems) {
            item.addEventListener('click', onTaskbarItemClick);
        }
    }

    const startButton = document.getElementById("start-button");

    if (startButton) {
        startButton.addEventListener('click', toggleStartMenu)
    }

    clock();
    setInterval(() => {
        clock();
    }, 1000);
}

function toggleStartMenu() {
    const startButton = document.getElementById("start-button");
    const menu = document.getElementById("menu");
    if (!startButton || !menu) return;

    removeCurrentFocus();

    if (startButton.classList.contains("active")) {
        startButton.classList.remove("active");
        menu.classList.remove("open");
    } else {
        startButton.classList.add("active");
        menu.classList.add("open");
    }
}

function closeStartMenu() {
    const startButton = document.getElementById("start-button");
    const menu = document.getElementById("menu");
    if (!startButton || !menu) return;

    startButton.classList.remove("active");
    menu.classList.remove("open");
}

function onTaskbarItemClick() {
    removeCurrentFocus();
    closeStartMenu();

    if (this.classList.contains("focused")) {
        this.classList.remove("focused");
    } else {
        this.classList.add("focused");
    }
}

function removeCurrentFocus() {
    const activeItem = document.querySelector(".focused");
    if (activeItem) {
        activeItem.classList.remove("focused");
    }
}

function clock() {
    const time = document.getElementById("taskbar-time");
    if (time) {
        time.innerHTML = `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
}