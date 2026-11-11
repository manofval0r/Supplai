import { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { designTokens, useAppConfig } from '../lib/theme';

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

function createMapHtml(
  origin: string,
  dest: string,
  moving: boolean,
  topPad: number,
  bottomPad: number,
  isDark: boolean,
  speedMult: number,
) {
  const tileFilter = isDark
    ? 'invert(1) hue-rotate(185deg) saturate(.6) brightness(.78) contrast(1.08)'
    : 'saturate(.58) sepia(.18) contrast(.96) brightness(1.03)';
  const bg = isDark ? '#081811' : designTokens.colors.cream;
  const forest = isDark ? '#16745A' : designTokens.colors.forest;
  const yellow = isDark ? '#FFD44D' : designTokens.colors.yellow;
  const periodSec = Math.max(4, Math.round(26 / Math.max(0.5, speedMult)));

  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>
html,body,#m{margin:0;height:100%;width:100%;background:${bg};font-family:Inter,system-ui,sans-serif}
.osm{filter:${tileFilter}}
.mk{display:inline-flex;gap:6px;background:${forest};color:#fff;font:700 12px system-ui;padding:7px 13px;border:2px solid #111410;border-radius:999px;white-space:nowrap;box-shadow:2px 2px 0 #111410}
.mk.g{background:${yellow};color:#111410}
.puck{position:relative;width:44px;height:44px;display:grid;place-items:center}
.puck:before{content:"";position:absolute;inset:0;border-radius:50%;background:rgba(11,82,64,.28);animation:p 2s ease-out infinite}
@keyframes p{0%{transform:scale(.6);opacity:.9}100%{transform:scale(1.7);opacity:0}}
.puck i{position:relative;width:30px;height:30px;border-radius:50%;background:${forest};border:3px solid ${yellow};box-shadow:0 3px 0 #111410}
.leaflet-div-icon{background:transparent!important;border:0!important}
</style></head><body><div id="m"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var route=${JSON.stringify(ROUTE)};
var m=L.map('m',{zoomControl:false,attributionControl:false,dragging:false,scrollWheelZoom:false,doubleClickZoom:false,touchZoom:false});
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,className:'osm'}).addTo(m);
L.polyline(route,{color:'${bg}',weight:11,opacity:.98,lineCap:'round',lineJoin:'round'}).addTo(m);
L.polyline(route,{color:'${forest}',weight:6,lineCap:'round',lineJoin:'round'}).addTo(m);
function lab(t,c,a){return L.divIcon({className:'',html:'<div class="mk '+c+'">'+t+'</div>',iconSize:null,iconAnchor:a})}
L.marker(route[0],{icon:lab(${JSON.stringify(origin)},'g',[44,40])}).addTo(m);
L.marker(route[route.length-1],{icon:lab(${JSON.stringify(dest)},'',[64,40])}).addTo(m);
var puck=L.marker(route[3],{icon:L.divIcon({className:'',html:'<div class="puck"><i></i></div>',iconSize:[44,44],iconAnchor:[22,22]})}).addTo(m);
m.fitBounds(L.latLngBounds(route),{paddingTopLeft:[60,${topPad}],paddingBottomRight:[60,${bottomPad}]});
var seg=[],tot=0;for(var i=1;i<route.length;i++){var d=Math.hypot(route[i][0]-route[i-1][0],route[i][1]-route[i-1][1]);seg.push(d);tot+=d}
function at(u){var d=u*tot;for(var i=0;i<seg.length;i++){if(d<=seg[i]){var f=d/seg[i];return[route[i][0]+(route[i+1][0]-route[i][0])*f,route[i][1]+(route[i+1][1]-route[i][1])*f]}d-=seg[i]}return route[route.length-1]}
var t0=Date.now();
function loop(){requestAnimationFrame(loop);var u=${moving ? `.18+(((Date.now()-t0)/1000)%${periodSec})/${periodSec}*.72` : '.12'};puck.setLatLng(at(u));if(Date.now()-lastPost>500){lastPost=Date.now();window.parent.postMessage({type:'supplai-map-progress',progress:u},'*')}}
var lastPost=0;
loop();
</script></body></html>`;
}

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
  onProgress?: (progress: number) => void;
}) {
  const { isDark, courierSpeed } = useAppConfig();
  const frame = useRef<HTMLIFrameElement>(null);
  const source = useMemo(
    () =>
      createMapHtml(
        origin,
        dest,
        moving,
        topPad,
        bottomPad,
        isDark,
        courierSpeed,
      ),
    [origin, dest, moving, topPad, bottomPad, isDark, courierSpeed],
  );

  useEffect(() => {
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (event.source !== frame.current?.contentWindow) return;
      if (
        typeof event.data === 'object' &&
        event.data !== null &&
        'type' in event.data &&
        event.data.type === 'supplai-map-progress' &&
        'progress' in event.data &&
        typeof event.data.progress === 'number'
      ) {
        onProgress?.(event.data.progress);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onProgress]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? '#081811' : designTokens.colors.cream,
      }}
    >
      <iframe
        ref={frame}
        title={`Courier route from ${origin} to ${dest}`}
        srcDoc={source}
        sandbox="allow-scripts"
        style={{ width: '100%', height: '100%', border: 0 }}
      />
    </View>
  );
}
