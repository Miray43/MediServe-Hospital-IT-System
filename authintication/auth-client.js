// Include this script (before the page's own JS) on every page that calls the API:
//   <script src="/authintication/auth-client.js"></script>
// It adds "Authorization: Bearer <token>" to requests sent to the MediServe API and
// sends the user back to the login page when the token is missing or rejected.
(function () {
  // Any host on port 5050 (localhost or a LAN address) is treated as the MediServe API.
  var API_RE = /^https?:\/\/[^\/]+:5050\//;
  var LOGIN = "/authintication/AuthPage/Login.html";
  var nativeFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var url = typeof input === "string" ? input : input.url;
    if (!API_RE.test(url)) return nativeFetch(input, init);
    var token = sessionStorage.getItem("mediserve_token");
    if (!token) { window.location.href = LOGIN; return Promise.reject(new Error("Not logged in")); }
    init = Object.assign({}, init);
    init.headers = Object.assign({}, init.headers, { Authorization: "Bearer " + token });
    return nativeFetch(input, init).then(function (res) {
      if (res.status === 401) { sessionStorage.clear(); window.location.href = LOGIN; }
      return res;
    });
  };
})();
