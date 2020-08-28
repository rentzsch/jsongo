"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDBProxy = void 0;
function createDBProxy(realDB) {
    return new Proxy(realDB, {
        get: function (target, prop) {
            if (prop === "then") {
                // Promise detection.
                return target;
            }
            if (prop in target) {
                // Direct property found in target, pass it through.
                return target[prop];
            }
            else {
                // Property NOT found directly in target, treat it as a collection lookup/lazy-creation request.
                return target.collectionWithName(prop);
            }
        },
    });
}
exports.createDBProxy = createDBProxy;
