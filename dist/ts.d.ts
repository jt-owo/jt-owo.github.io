interface IDesktopItem {
    text: string;
    icon: string;
    onClick: () => void;
}
declare class Desktop {
    static init(): void;
    static addItem(_item: IDesktopItem): void;
    static createItem(_text: string, _icon: string, onClick: () => void): HTMLDivElement;
    static shutdown(): void;
}
declare const _: (selector: string) => Element | NodeList | null | undefined;
declare type ProgramIcon = 'computer' | 'dir-closed' | 'recycleBin' | 'github';
declare class Platform {
    static get isMobile(): boolean;
}
declare function newGuid(): string;
declare class Taskbar {
    static init(): void;
    static addItem(win: DragWindow, autoSelect?: boolean): void;
    static createItem(winID: string, icon: string): HTMLDivElement;
    static toggleStartMenu(forceClose?: boolean): void;
    static removeCurrentFocus(): void;
    static onTaskbarItemClick(e: MouseEvent): void;
    static setFocus(item: HTMLDivElement): void;
    static removeFocus(item: HTMLDivElement): void;
    static getFocusedItem(): Element | null;
    static getItem(id: string): HTMLDivElement;
    static updateClock(): void;
}
declare const _WINDOW_LIST: DragWindow[];
declare const DRAG_WINDOW_ENABLE_LOG = false;
interface IWindowOptions {
    title: string;
    width: number;
    height: number;
    child?: string;
    allowMaximize: boolean;
    icon: string;
    x: number;
    y: number;
    fitSizeToContent: boolean;
}
declare class DragWindow {
    private id;
    private title;
    private width;
    private height;
    private child;
    private icon;
    private isDragging;
    private isHidden;
    private xDiff;
    private yDiff;
    private x;
    private y;
    private allowMaximize;
    private element;
    private titlebar;
    private titlebar_text;
    private titlebar_controls;
    private titlebar_controls_minimize;
    private titlebar_controls_maximize;
    private titlebar_controls_close;
    private content;
    private content_container;
    get ID(): string;
    get Icon(): string;
    get Element(): HTMLDivElement;
    get IsMaximized(): boolean;
    constructor(title: string, width: number, height: number, posX: number, posY: number, child: HTMLElement | null | undefined, allowMaximize: boolean | undefined, icon: string);
    createDOM(): void;
    addEventListeners(): void;
    updateUI(): void;
    minimize(): void;
    maximize(): void;
    close(): void;
    onMouseUp(): void;
    onMouseDown(e: MouseEvent): void;
    onTouchStart(e: TouchEvent): void;
    onMouseMove(e: MouseEvent): void;
    onTouchMove(e: TouchEvent): void;
    focus(fromTaskbar?: boolean): void;
    static log(message: any): void;
    static show(options: IWindowOptions): void;
}
//# sourceMappingURL=ts.d.ts.map