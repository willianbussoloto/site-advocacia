// Google Analytics 4 (G-1LMCHXW24P). Quem recusou no aviso de cookies não carrega o Analytics.
// Arquivo externo (e não script inline) para não precisar de novo hash na CSP do _headers.
(function () {
  var ID = "G-1LMCHXW24P";
  try { if (localStorage.getItem("wb-cookies") === "recusado") return; } catch (e) {}
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  window.gtag("js", new Date());
  window.gtag("config", ID);
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + ID;
  document.head.appendChild(s);
})();
