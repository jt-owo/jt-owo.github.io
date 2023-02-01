const _ = (selector: string) => {
    if (!selector) {
        console.error("Invalid selector");
    }

    let query: Element | NodeList | null = document.querySelectorAll(selector);

    if (!query) return undefined;

    if (query.length && query.length == 1) {
        query = document.querySelector(selector);
    }

    return query;
}

type ProgramIcon = 'computer' | 'dir-closed' | 'recycleBin' | 'github';

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