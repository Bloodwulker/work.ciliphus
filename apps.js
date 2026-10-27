/* builds the badge grid from a list. swap the placeholder entries for real ones later. */
const APPS = [
  { name: "ConnectWise Manage", face: "cw.png", href: "https://sso-8ad12aac.sso.duosecurity.com/saml2/sp/DI0ECL30JK35H6X6GSKV/sso" },
  { name: "Automate - CHS", face: "auto-chs.png", href: "https://lt.canteytechnology.com/automate/" },
  { name: "Automate - FL", face: "auto-fl.png", href: "https://monitor.pciicp.com/automate" },
  { name: "Automate - VA", face: "auto-va.png", href: "https://lt.ncg-net.com/automate/login" },
  { name: "ITGlue", face: "itglue.png", href: "https://sso-8ad12aac.sso.duosecurity.com/saml2/sp/DIUXAZJSYT1PAVZIDAK0/sso" },
  { name: "Strety", face: "strety.png", href: "https://2.strety.com/" },
  { name: "Token Generator", face: "token.png", href: "https://sso-8ad12aac.sso.duosecurity.com/saml2/sp/DI47L3HZ1VJ5A0USOW3I/sso" },
  { name: "1Stream Phone", face: "1stream.png", href: "https://canteytech-portal.bvoip.net/sso/webclient" },
  { name: "1Stream App", face: "1stream.png", href: "https://canteytech-portal.bvoip.net/sso/1stream" },
  { name: "ExtensisHR", face: "extensis.png", href: "https://exg.prismhr.com/exg/auth/#/login?lang=en&clientId=207713" },
  { name: "ActivTrak", face: "activtrak.png", href: "https://sso-8ad12aac.sso.duosecurity.com/saml2/sp/DISPE68NCK37YCJ3AHAB/sso" },
  { name: "Addigy", face: "addigy.png", href: "https://launcher.myapps.microsoft.com/api/signin/e7368010-4b7f-4381-810d-f864730accf1?tenantId=955e181c-1bf1-4ca5-b6e5-717b2cb71269" },
  { name: "AWS MSP", face: "aws.png", href: "https://sso-8ad12aac.sso.duosecurity.com/saml2/sp/DIFPU6R22EUZN3B0X3CY/sso" },
  { name: "Arctic Wolf", face: "arcticwolf.png", href: "https://portal.arcticwolf.com/" },
  { name: "AutoElevate", face: "autoelevate.png", href: "https://msp.autoelevate.com/" },
  { name: "Auvik", face: "auvik.png", href: "https://sso-8ad12aac.sso.duosecurity.com/saml2/sp/DIIMT115RK1SRQBC83HA/sso" },
  { name: "Axcient", face: "axcient.png", href: "https://partner.axcient.com/" },
  { name: "BrightGauge", face: "brightgauge.png", href: "https://canteytech.brightgauge.co/accounts/login/" },
  { name: "Cantey Asset", face: "asset.png", href: "https://sso-8ad12aac.sso.duosecurity.com/saml2/sp/DI3AJMG8U0CSLDGXCPXV/sso" },
  { name: "Cisco Umbrella", face: "umbrella.png", href: "https://sso-8ad12aac.sso.duosecurity.com/saml2/sp/DIN9UEDMZTDRETTKZOJE/sso" },
  { name: "CloudRadial", face: "cloudradial.png", href: "https://portal.canteytech.com/login" },
  { name: "ConnectWise Home", face: "cw-home.png", href: "https://home.connectwise.com/" },
  { name: "Cradlepoint", face: "cradlepoint.png", href: "https://sso-8ad12aac.sso.duosecurity.com/saml2/sp/DIZMT1XB8785GSO01YQ3/sso" },
  { name: "Customer Portal", face: "portal.png", href: "https://sso-8ad12aac.sso.duosecurity.com/saml2/sp/DIY1I2Q1NO45XPFIK15A/sso" },
  { name: "Datto", face: "datto.png", href: "https://auth.datto.com/oidc-login/51d0a7fb-5e58-11eb-bf32-fa163e83ce9d" },
  { name: "Duo MSP", face: "duo.png", href: "https://sso-8ad12aac.sso.duosecurity.com/saml2/sp/DI3YUIS7EFEGJS424PO5/sso" },
  { name: "Egnyte", face: "egnyte.png", href: "https://sso-8ad12aac.sso.duosecurity.com/saml2/sp/DIL216VL3VOV3R3C40ZY/sso" },
  { name: "Egnyte Partner", face: "egnyte.png", href: "https://launcher.myapps.microsoft.com/api/signin/3d30a2fb-fce5-4fbb-8a6f-08225fe0520a?tenantId=955e181c-1bf1-4ca5-b6e5-717b2cb71269" },
  { name: "Huntress", face: "huntress.png", href: "https://sso-8ad12aac.sso.duosecurity.com/saml2/sp/DIMBCLQQ6XFE28FTDPAJ/sso" },
  { name: "Intermedia", face: "intermedia.png", href: "https://canteytech.itglue.com/1203892/passwords/34605054" },
  { name: "Lands End", face: "landsend.png", href: "https://business.landsend.com/store/canteytech" },
  { name: "Lifecycle Insights", face: "lci.png", href: "https://master.lifecycleinsights.io/signIn" },
  { name: "Lifecycle Manager", face: "lcm.png", href: "https://app.scalepad.com/account/home" },
  { name: "LucidChart Edit", face: "lucid.png", href: "https://sso-8ad12aac.sso.duosecurity.com/saml2/sp/DI62Z7LG0SM9SEJYT1GJ/sso" },
  { name: "LucidChart View", face: "lucid.png", href: "https://sso-8ad12aac.sso.duosecurity.com/saml2/sp/DIAY2M5ZVMCY36DTR9H9/sso" },
  { name: "Meraki", face: "meraki.png", href: "https://sso-8ad12aac.sso.duosecurity.com/saml2/sp/DIJR5EYAHGRVFTDMI35O/sso" },
  { name: "Mimecast", face: "mimecast.png", href: "https://sso-8ad12aac.sso.duosecurity.com/saml2/sp/DIWB6I2RR7K9R8MTGWSH/sso" },
  { name: "MySonicWall", face: "sonicwall.png", href: "https://launcher.myapps.microsoft.com/api/signin/a85a1557-3aa2-4e14-80a4-6e58d7381a20?tenantId=955e181c-1bf1-4ca5-b6e5-717b2cb71269" },
  { name: "N2WS", face: "n2ws.png", href: "https://sso-8ad12aac.sso.duosecurity.com/saml2/sp/DI1EWV3XKE9HP04MV4HT/sso" },
  { name: "Nerdio AVD", face: "nerdio.png", href: "https://avd.canteycloud.com/" },
  { name: "Office 365", face: "o365.png", href: "https://portal.office.com/" },
  { name: "PrinterLogic", face: "printerlogic.png", href: "https://www.printercloudmsp.com/login" },
  { name: "Proofpoint", face: "proofpoint.png", href: "https://us1.proofpointessentials.com/" },
  { name: "ScreenConnect CHS", face: "sc.png", href: "https://sso-8ad12aac.sso.duosecurity.com/saml2/sp/DIO4F28KBWWTNBXBAJP5/sso" },
  { name: "ScreenConnect Intl", face: "sc.png", href: "https://sso-8ad12aac.sso.duosecurity.com/saml2/sp/DIDLKNZCRMZVSTDRESFM/sso" },
  { name: "SIPPIO", face: "sippio.png", href: "https://partner.sippio.io/home" },
  { name: "Sophos", face: "sophos.png", href: "https://id.sophos.com/" },
  { name: "Staff Portal", face: "staff.png", href: "https://sso-8ad12aac.sso.duosecurity.com/saml2/sp/DI63HHK28ZE2WXABF6Z2/sso" },
  { name: "Symbol Security", face: "symbol.png", href: "https://cas.symbolsecurity.com/auth/saml/1214c478-10fd-4c61-904e-12b7fbed6139" },
  { name: "TriNet", face: "trinet.png", href: "https://sso.trinet.com/" },
  { name: "UniFi", face: "unifi.png", href: "https://account.ui.com/" },
  { name: "WatchGuard Cloud", face: "wg.png", href: "https://sso-8ad12aac.sso.duosecurity.com/saml2/sp/DINNK2VJOKQT6WF6ZDCH/sso" },
  { name: "WatchGuard Partner", face: "wg.png", href: "https://wgidb2cexternalsamladapter.watchguard.com/api/v0/app/launch/supportcenter?sso_domain_hint=canteytech" }
];
const grid = document.getElementById("apps");
APPS.forEach(a => {
  const el = document.createElement("a");
  el.className = "badge";
  el.href = a.href;
  el.target = "_blank";
  el.rel = "noopener";
  el.title = a.name;
  el.style.setProperty("--face", `url('${BLOB}${a.face}')`);
  grid.appendChild(el);
});

/* fan open/close. a badge with data-fan="x" opens the div#x. one at a time, 5s auto-close. */
let fanTimer;
function closeFans() {
  document.querySelectorAll(".fan.open").forEach(f => f.classList.remove("open"));
  document.querySelectorAll(".badge.lit").forEach(b => b.classList.remove("lit"));
}
document.querySelectorAll(".badge[data-fan]").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const fan = document.getElementById(btn.dataset.fan);
    if (!fan) return;
    const wasOpen = fan.classList.contains("open");
    closeFans();
    clearTimeout(fanTimer);
    if (!wasOpen) {
      const r = btn.getBoundingClientRect();
      fan.style.left = (r.left + r.width / 2) + "px";
      fan.style.top = (r.top + r.height / 2) + "px";
      fan.classList.add("open");
      btn.classList.add("lit");
      fanTimer = setTimeout(closeFans, 5000);
    }
  });
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".badge") && !e.target.closest(".fan")) closeFans();
});
