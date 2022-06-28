class Platform {
    static get isMobile() {
        return (/Mobi|Android/i.test(navigator.userAgent))
    }
}