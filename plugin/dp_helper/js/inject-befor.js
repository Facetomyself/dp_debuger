


(function () {
    let consoleCache = console.log;
    console.log = function (msg) {
        // consoleCache("Hook console.log =>", msg);

        consoleCache(msg);
    };
})();

console.log("hook  console.log");
