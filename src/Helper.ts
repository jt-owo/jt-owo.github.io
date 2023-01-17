class Platform {
    /**
     * Determines if the website is running on mobile or not.
     */
    public static get isMobile() {
        return (/Mobi|Android/i.test(navigator.userAgent))
    }
}

//https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
/**
 * Generates a new guid.
 * @returns Guid.
 */
function newGuid() {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}