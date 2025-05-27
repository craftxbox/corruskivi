export function clone(obj: any): any {
    let copy: any = {};
    if (null == obj || "object" != typeof obj) return obj;
    for (let key of Object.keys(obj)) {
        let value = obj[key];
        if (obj.hasOwnProperty(key)) {
            if (Array.isArray(value)) {
                let subcopy = [];
                for (let i = 0; i < value.length; i++) {
                    subcopy[i] = clone(value[i]);
                }
                copy[key] = subcopy;
            } else if (typeof value === "object") {
                copy[key] = clone(value);
            } else if (typeof value === "function") {
                copy[key] = value.bind(obj);
            } else {
                copy[key] = value;
            }
        }
    }

    return copy;
}