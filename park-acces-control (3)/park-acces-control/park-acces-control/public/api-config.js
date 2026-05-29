(function () {
    var backendUrl = "";  // vacío = usa el mismo servidor local

    var apiBase = (window.API_BASE || backendUrl || "").replace(/\/$/, "");
    var socketBase = (window.SOCKET_BASE || apiBase || "").replace(/\/$/, "");

    window.APP_CONFIG = {
        API_BASE: apiBase,
        SOCKET_BASE: socketBase
    };

    window.apiUrl = function (path) {
        if (!path) return apiBase;
        if (/^https?:\/\//i.test(path)) return path;
        var normalizedPath = path.charAt(0) === "/" ? path : "/" + path;
        return apiBase ? apiBase + normalizedPath : normalizedPath;
    };
})();