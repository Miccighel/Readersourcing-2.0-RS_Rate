(() => {
    const script = document.currentScript;
    const controller = script.dataset.controller;
    const root = document.documentElement;
    const initialUrl = location.href;

    root.classList.add("view-initializing");
    if (controller === "rating_web" &&
        globalThis.chrome?.runtime?.getManifest?.().browser_specific_settings?.gecko &&
        new URL(initialUrl).searchParams.get("pdfUpload")) {
        root.classList.add("pdf-upload-view");
    }

    document.addEventListener("DOMContentLoaded", async () => {
        try {
            if (controller === "home") await import("./home.js");
            else if (controller === "rating_web") await import("./rating_web.js");
            else throw new TypeError("Unknown extension view.");
            if (location.href === initialUrl) root.classList.remove("view-initializing");
        } catch (error) {
            const message = document.createElement("p");
            message.className = "alert alert-danger m-3";
            message.setAttribute("role", "alert");
            message.textContent = "This view could not be opened. Close it and try again.";
            document.body.prepend(message);
            root.classList.remove("view-initializing");
            console.error("RS_Rate view initialization failed.", error);
        }
    }, {once: true});
})();
