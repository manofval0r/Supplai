import { useMemo } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAppConfig } from '../lib/theme';

const ROUTE: [number, number][] = [
  [7.242, 3.036],
  [7.2412, 3.0378],
  [7.2398, 3.0396],
  [7.2386, 3.042],
  [7.2368, 3.0446],
  [7.235, 3.047],
  [7.2332, 3.0498],
  [7.2318, 3.0518],
  [7.2305, 3.0535],
];

function html(
  origin: string,
  dest: string,
  moving: boolean,
  topPad: number,
  bottomPad: number,
  isDark: boolean,
) {
  const tileFilter = isDark
    ? 'invert(1) hue-rotate(185deg) saturate(.6) brightness(.78) contrast(1.08)'
    : 'saturate(.72) contrast(.97) brightness(1.03)';
  const bg = isDark ? '#0b0e15' : '#e8ecf2';

  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>
html,body,#m{margin:0;height:100%;width:100%;background:${bg};font-family:-apple-system,Inter,system-ui,sans-serif}
.osm{filter:${tileFilter}}
.mk{display:inline-flex;gap:6px;background:#030407;color:#fff;font:700 12px system-ui;padding:6px 12px;border-radius:16px;white-space:nowrap;box-shadow:0 6px 16px rgba(3,4,7,.3)}
.mk.g{background:#D4FF24;color:#030407}
.puck{position:relative;width:44px;height:44px;display:grid;place-items:center}
.puck:before{content:"";position:absolute;inset:0;border-radius:50%;background:rgba(21,88,201,.38);animation:p 2s ease-out infinite}
@keyframes p{0%{transform:scale(.6);opacity:.9}100%{transform:scale(1.7);opacity:0}}
.puck i{position:relative;width:30px;height:30px;border-radius:50%;background:#1558C9;border:3px solid #D4FF24;box-shadow:0 4px 12px rgba(21,88,201,.55)}
.leaflet-div-icon{background:transparent!important;border:0!important}
</style></head><body><div id="m"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var route=${JSON.stringify(ROUTE)};
var m=L.map('m',{zoomControl:false,attributionControl:false,dragging:false,scrollWheelZoom:false,doubleClickZoom:false,touchZoom:false});
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,className:'osm'}).addTo(m);
L.polyline(route,{color:'#fff',weight:11,opacity:.95,lineCap:'round',lineJoin:'round'}).addTo(m);
L.polyline(route,{color:'#1558C9',weight:6,lineCap:'round',lineJoin:'round'}).addTo(m);
function lab(t,c,a){return L.divIcon({className:'',html:'<div class="mk '+c+'">'+t+'</div>',iconSize:null,iconAnchor:a})}
L.marker(route[0],{icon:lab(${JSON.stringify(origin)},'g',[44,40])}).addTo(m);
L.marker(route[route.length-1],{icon:lab(${JSON.stringify(dest)},'',[64,40])}).addTo(m);
var puck=L.marker(route[3],{icon:L.divIcon({className:'',html:'<div class="puck"><i></i></div>',iconSize:[44,44],iconAnchor:[22,22]})}).addTo(m);
m.fitBounds(L.latLngBounds(route),{paddingTopLeft:[60,${topPad}],paddingBottomRight:[60,${bottomPad}]});
var seg=[],tot=0;for(var i=1;i<route.length;i++){var d=Math.hypot(route[i][0]-route[i-1][0],route[i][1]-route[i-1][1]);seg.push(d);tot+=d}
function at(u){var d=u*tot;for(var i=0;i<seg.length;i++){if(d<=seg[i]){var f=d/seg[i];return[route[i][0]+(route[i+1][0]-route[i][0])*f,route[i][1]+(route[i+1][1]-route[i][1])*f]}d-=seg[i]}return route[route.length-1]}
var t0=Date.now(),lastPost=0;
function loop(){requestAnimationFrame(loop);
 var u=${moving ? '.18+(((Date.now()-t0)/1000)%26)/26*.72' : '.12'};
 puck.setLatLng(at(u));
 if(Date.now()-lastPost>500&&window.ReactNativeWebView){lastPost=Date.now();window.ReactNativeWebView.postMessage(String(u))}}
loop();
</script></body></html>`;
}

/** OpenStreetMap (Leaflet) with an animated courier. Posts progress 0..1 to `onProgress`. */
export function OsmMap({
  origin,
  dest,
  moving = true,
  topPad = 150,
  bottomPad = 290,
  onProgress,
}: {
  origin: string;
  dest: string;
  moving?: boolean;
  topPad?: number;
  bottomPad?: number;
  onProgress?: (u: number) => void;
}) {
  const { isDark } = useAppConfig();
  const bg = isDark ? '#0b0e15' : '#e8ecf2';
  const source = useMemo(
    () => ({
      html: html(origin, dest, moving, topPad, bottomPad, isDark),
      baseUrl: 'https://supplai-1.vercel.app',
    }),
    [origin, dest, moving, topPad, bottomPad, isDark],
  );
  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <WebView
        originWhitelist={['*']}
        source={source}
        style={{ flex: 1, backgroundColor: bg }}
        scrollEnabled={false}
        onMessage={(e) => onProgress?.(Number(e.nativeEvent.data))}
        javaScriptEnabled
      />
    </View>
  );
}
