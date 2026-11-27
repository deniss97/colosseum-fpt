import{M as e}from"./render-CbQEANQ2.js";import{a as t,n,o as r,s as i}from"./math.vector.pure-l1Hp4RUF.js";import{n as a,t as o}from"./math.color.pure-DM6aV98f.js";import{a as s}from"./abstractEngine.pure-BpBEPFBr.js";import{Q as c,Z as l,l as u,ot as d,r as f,rt as p,ut as m}from"./toon-Du6eRrd-.js";import{n as h}from"./texture.pure-C6TZPhKq.js";import{t as g}from"./shapes-DRYQ0zNV.js";import{r as _}from"./models3d-CBPeCFwy.js";function v(e,t,n,r,i,a={}){let o=new u(t,{width:n,height:r},e,a.mips??!0,h.TRILINEAR_SAMPLINGMODE),s=o.getContext(),c=s.createImageData(n,r);c.data.set(i),s.putImageData(c,0,0),o.hasAlpha=a.alpha??!1,o.update(a.invertY??!0);let l=a.wrap?h.WRAP_ADDRESSMODE:h.CLAMP_ADDRESSMODE;return o.wrapU=l,o.wrapV=l,o}var y=Math.PI/180,b=`
precision highp float;
attribute vec3 position;
uniform mat4 world;
uniform mat4 worldViewProjection;
varying vec3 vWorld;
void main(void) {
  vWorld = (world * vec4(position, 1.0)).xyz;
  gl_Position = worldViewProjection * vec4(position, 1.0);
}`,x=`
precision highp float;
uniform sampler2D uWaves;
uniform sampler2D uSwell;
uniform sampler2D uFoamMask;
uniform vec4 uMA;
uniform vec4 uMB;
uniform vec4 uMS;
uniform vec4 uOffAB;
uniform vec2 uOffS;
uniform vec4 uMix;
uniform vec4 uTrough;
uniform vec4 uLit;
uniform vec4 uMisc;
uniform vec4 uFoam;
uniform vec4 uMaskRect;
uniform vec3 uDeep;
uniform vec3 uMid;
uniform vec3 uDark;
uniform vec3 uLitCol;
uniform vec3 uCrest;
uniform vec3 uFoamCol;
uniform vec3 uSky;
uniform vec3 uTint;
uniform vec3 uEye;
uniform vec3 uFogColor;
uniform vec2 uFog;
uniform vec2 uFresnel;
varying vec3 vWorld;

vec2 layerUV(vec2 g, vec4 m, vec2 off) {
  return vec2(dot(g, m.xy), dot(g, m.zw)) + off;
}

void main(void) {
  vec2 g = vWorld.xz;
  float e = uMisc.w;
  vec3 w = texture2D(uSwell, layerUV(g, uMS, uOffS)).rgb;
  vec3 a = texture2D(uWaves, layerUV(g, uMA, uOffAB.xy)).rgb;
  vec3 b = texture2D(uWaves, layerUV(g, uMB, uOffAB.zw)).rgb;
  float h = mix(b.r, a.r, uMix.x) + (w.r - 0.5) * uMix.y;
  float sl = mix(b.g - 0.5, a.g - 0.5, uMix.x) * 1.1;
  vec3 col = mix(uDeep, uMid, smoothstep(0.2, 0.8, w.g) * uMisc.y);
  float shd = 1.0 - smoothstep(uTrough.x - e, uTrough.x + e, h);
  float shd2 = 1.0 - smoothstep(uTrough.z - e, uTrough.z + e, h);
  float lit = smoothstep(uLit.x - e, uLit.x + e, sl) * smoothstep(0.46 - e, 0.46 + e, h);
  float lit2 = smoothstep(0.02 - e, 0.02 + e, sl) * smoothstep(uLit.z - e, uLit.z + e, h);
  float rim = (1.0 - smoothstep(0.004, 0.004 + e, abs(h - uTrough.x - 0.03))) * smoothstep(0.0, 0.08, sl);
  col = mix(col, uDark, shd * uTrough.y + shd2 * uTrough.w);
  col = mix(col, uLitCol, max(lit * uLit.y, rim * uMisc.x));
  col = mix(col, uCrest, lit2 * uLit.w);
  // Foam in lanes on the crests, and round the hulls (the ships' mask), ragged by the breakup noise.
  float lane = smoothstep(0.5, 0.95, w.b);
  float fn = h + (a.b - 0.5) * 0.24 + (lane - 1.0) * uFoam.y + uFoam.x;
  float core = smoothstep(0.97 - e, 0.97 + e, fn);
  float body = smoothstep(0.9 - e, 0.9 + e, fn) * smoothstep(0.52, 0.6, b.b);
  float lace = (1.0 - smoothstep(0.003, 0.003 + e, abs(fn - 0.84))) * smoothstep(0.42, 0.52, b.b);
  float foam = max(max(core, body * 0.75), lace * 0.55) * uFoam.z;
  vec2 mu = (g - uMaskRect.xy) / uMaskRect.zw;
  float inside = step(0.0, mu.x) * step(mu.x, 1.0) * step(0.0, mu.y) * step(mu.y, 1.0);
  float hull = texture2D(uFoamMask, clamp(mu, 0.0, 1.0)).r * inside;
  float ragged = smoothstep(0.35, 0.75, hull + (a.b - 0.5) * 0.7 + (h - 0.5) * 0.4);
  foam = max(foam, ragged * uFoam.w);
  col = mix(col, uFoamCol, clamp(foam, 0.0, 1.0));
  // The red sky on the water seen low, the setting's warmth, the haze.
  vec3 toEye = uEye - vWorld;
  float dist = length(toEye);
  float graze = pow(1.0 - clamp(toEye.y / max(dist, 0.0001), 0.0, 1.0), uFresnel.x) * uFresnel.y;
  col = mix(col, uSky, clamp(graze, 0.0, 1.0)) * uTint;
  float fog = clamp((uFog.y - dist) / max(0.0001, uFog.y - uFog.x), 0.0, 1.0);
  gl_FragColor = vec4(mix(uFogColor, col, fog), 1.0);
}`,S=class{material;scene;layers;flow=new t(0,0);clock=0;steps=-1;stepFlow=new t(0,0);stepClock=0;red=0;constructor(n){this.scene=n,s.ShadersStore.toonWaterVertexShader=b,s.ShadersStore.toonWaterFragmentShader=x;let r=new l(`toonWater`,n,{vertex:`toonWater`,fragment:`toonWater`},{attributes:[`position`],uniforms:[`world`,`worldViewProjection`,`uMA`,`uMB`,`uMS`,`uOffAB`,`uOffS`,`uMix`,`uTrough`,`uLit`,`uMisc`,`uFoam`,`uMaskRect`,`uDeep`,`uMid`,`uDark`,`uLitCol`,`uCrest`,`uFoamCol`,`uSky`,`uTint`,`uEye`,`uFogColor`,`uFog`,`uFresnel`],samplers:[`uWaves`,`uSwell`,`uFoamMask`]}),a=e=>{let t=new h(`/colosseum-fpt/3d/water/${e}`,n,!1,!0,h.TRILINEAR_SAMPLINGMODE);return t.wrapU=h.WRAP_ADDRESSMODE,t.wrapV=h.WRAP_ADDRESSMODE,t};r.setTexture(`uWaves`,a(`ocean_waves.png`)),r.setTexture(`uSwell`,a(`ocean_swell.png`)),r.setTexture(`uFoamMask`,v(n,`noFoam`,1,1,new Uint8ClampedArray([0,0,0,255]))),r.setVector4(`uMaskRect`,new i(-1e6,-1e6,1,1)),r.backFaceCulling=!1,this.material=r;let o=e.NAVAL.WATER;this.layers=[o.WAVES_A,o.WAVES_B,o.SWELL].map(e=>C(e.tile,e.angle,e.speed,`mirror`in e&&e.mirror===!0));let c=this.layers.reduce((e,t)=>e.add(t.run),new t(0,0)).scale(1/this.layers.length);for(let e of this.layers)e.run.subtractInPlace(c);this.look()}setFoam(e,t,n,r){e.wrapU=h.CLAMP_ADDRESSMODE,e.wrapV=h.CLAMP_ADDRESSMODE,this.material.setTexture(`uFoamMask`,e),this.material.setVector4(`uMaskRect`,new i(t,n,r,r))}setRed(e){this.red=e}update(n,r){let a=e.NAVAL.WATER;this.clock+=n,this.flow.x+=n*a.FLOW[0],this.flow.y+=n*a.FLOW[1];let s=Math.floor(this.clock*a.ANIM_FPS);s!==this.steps&&(this.steps=s,this.stepClock=this.clock,this.stepFlow=this.flow.clone());let c=e=>{let n=-this.stepFlow.x-e.run.x*this.stepClock,r=-this.stepFlow.y-e.run.y*this.stepClock;return new t(w(e.m.x*n+e.m.y*r),w(e.m.z*n+e.m.w*r))},[l,u,d]=this.layers,f=c(l),p=c(u),m=this.material;m.setVector4(`uOffAB`,new i(f.x,f.y,p.x,p.y)),m.setVector2(`uOffS`,c(d)),m.setVector3(`uEye`,r);let h=this.scene;m.setColor3(`uFogColor`,h.fogColor),m.setVector2(`uFog`,new t(h.fogStart,h.fogEnd));let g=this.red*a.RED_LIGHT;m.setColor3(`uTint`,new o(1,1-g*.5,1-g*.55)),this.look()}look(){let n=e.NAVAL.WATER,r=this.material,[a,o,s]=this.layers;r.setVector4(`uMA`,a.m),r.setVector4(`uMB`,o.m),r.setVector4(`uMS`,s.m),r.setVector4(`uMix`,new i(n.LAYER_MIX,n.SWELL_STRENGTH,0,0)),r.setVector4(`uTrough`,new i(n.TROUGH[0],n.TROUGH[1],n.DEEP[0],n.DEEP[1])),r.setVector4(`uLit`,new i(n.LIT[0],n.LIT[1],n.CREST[0],n.CREST[1])),r.setVector4(`uMisc`,new i(n.RIM,1,0,n.EDGE)),r.setVector4(`uFoam`,new i(n.FOAM.AMOUNT,n.FOAM.LANES,n.FOAM.OPACITY,n.HULL_FOAM));let c=n.COLORS;r.setColor3(`uDeep`,g(c.DEEP)),r.setColor3(`uMid`,g(c.MID)),r.setColor3(`uDark`,g(c.DARK)),r.setColor3(`uLitCol`,g(c.LIT)),r.setColor3(`uCrest`,g(c.CREST)),r.setColor3(`uFoamCol`,g(c.FOAM)),r.setColor3(`uSky`,g(n.FRESNEL.COLOR)),r.setVector2(`uFresnel`,new t(n.FRESNEL.POWER,n.FRESNEL.STRENGTH))}};function C(e,n,r,a){let o=n*y,s=Math.cos(o),c=Math.sin(o),l=1/e,u=a?-l:l;return{m:new i(s*u,c*u,-c*l,s*l),run:new t(-c*r,s*r)}}function w(e){let t=e-Math.floor(e);return Number.isFinite(t)?t:0}var T=class e{scene;shadows;templates=new Map;copies=0;constructor(e,t){this.scene=e,this.shadows=t}static async load(t,i,a,o){let s=new e(t,i);return await Promise.all([...new Set(a)].map(async e=>{try{let a=await m(`/colosseum-fpt/${e}`,t);a.addAllToScene();let c=[];for(let e of a.meshes){if(!(e instanceof p)||e.getTotalVertices()===0)continue;let t=e.computeWorldMatrix(!0).clone();e.parent=null,e.position.setAll(0),e.rotationQuaternion=n.Identity(),e.scaling.setAll(1),e.bakeTransformIntoVertices(t),e.refreshBoundingInfo(),c.push(e)}for(let e of a.meshes)c.includes(e)||e.dispose();if(c.length===0)return;_(t,c,i,0,o,!1);let l=new r(1/0,1/0,1/0),u=new r(-1/0,-1/0,-1/0);for(let e of c){let t=e.getBoundingInfo().boundingBox;l=r.Minimize(l,t.minimum),u=r.Maximize(u,t.maximum),e.isVisible=!1,e.isPickable=!1}s.templates.set(e,{meshes:c,min:l,max:u})}catch(t){console.warn(`3D: no site model ${e}`,t)}})),s}has(e){return this.templates.has(e)}tinted(e,t){let n=this.templates.get(e);if(!n||t===16777215)return n;let r=`${e}#${t}`,i=this.templates.get(r);if(i)return i;let a=new o((t>>16&255)/255,(t>>8&255)/255,(t&255)/255),s={meshes:n.meshes.map(e=>{let n=e.clone(`${e.name}_tint${t}`,null);if(e.material instanceof c){let r=e.material.clone(`${e.material.name}_${t}`);r.diffuseColor=a,n.material=r}return n.isVisible=!1,n.isPickable=!1,n}),min:n.min,max:n.max};return this.templates.set(r,s),s}place(e,t){let n=this.tinted(e,t.tint??16777215);if(!n)return null;let i=t.turn*Math.PI/180,a=Math.abs(Math.cos(i)),o=Math.abs(Math.sin(i)),s=n.max.x-n.min.x,c=n.max.z-n.min.z,l=Math.max(.01,s*a+c*o),u=Math.max(.01,s*o+c*a),f=Math.max(.01,n.max.y-n.min.y),p=t.height/f,m=t.w===void 0?p:t.w/l,h=t.d===void 0?t.w===void 0?p:Math.min(p,m):t.d/u,g=++this.copies,_=new d(`site_${g}`,this.scene);_.position=t.at.clone(),_.rotation.y=t.yaw;let v=new d(`site_${g}_f`,this.scene);v.parent=_,v.scaling=new r(m,p,h);let y=new d(`site_${g}_m`,this.scene);y.parent=v,y.rotation.y=i;let b=(n.min.x+n.max.x)/2,x=(n.min.z+n.max.z)/2,S=Math.cos(i),C=Math.sin(i);v.position=new r(0,0,0),y.position=new r(-(b*S+x*C),-n.min.y,-(-b*C+x*S));let w=[];for(let e of n.meshes){let n=e.createInstance(`${e.name}_s${g}`);n.parent=y,n.isPickable=!1,t.shadow&&this.shadows.addShadowCaster(n),w.push(n)}return{node:_,parts:w,w:l*m,d:u*h,h:t.height}}dispose(){for(let e of this.templates.values())for(let t of e.meshes)t.dispose();this.templates.clear()}},E=60,D=9,O=[3.5,6],k=[.25,.5],A=class{scene;low;puff=null;systems=[];constructor(e,t){this.scene=e,this.low=t}texture(){if(this.puff)return this.puff;let e=new u(`taleSmokePuff`,{width:64,height:64},this.scene,!1),t=e.getContext(),n=t.createRadialGradient(32,32,0,32,32,32);return n.addColorStop(0,`rgba(255,255,255,0.9)`),n.addColorStop(.5,`rgba(255,255,255,0.4)`),n.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=n,t.fillRect(0,0,64,64),e.hasAlpha=!0,e.update(),this.puff=e,e}plume(e,t){let n=new f(`taleSmoke`,Math.round(E*(this.low?.4:1)),this.scene);n.particleTexture=this.texture(),n.emitter=e.clone(),n.minEmitBox=new r(-.08,0,-.08).scale(t),n.maxEmitBox=new r(.08,.05,.08).scale(t),n.color1=new a(.32,.3,.3,.42),n.color2=new a(.2,.19,.19,.32),n.colorDead=new a(.15,.14,.14,0),n.minSize=.25*t,n.maxSize=.45*t,n.addSizeGradient(0,.3*t),n.addSizeGradient(1,1.4*t),n.minLifeTime=O[0],n.maxLifeTime=O[1],n.emitRate=D*(this.low?.5:1),n.direction1=new r(-.1,k[0],-.05),n.direction2=new r(.25,k[1],.1),n.minEmitPower=.6,n.maxEmitPower=1,n.minAngularSpeed=-.4,n.maxAngularSpeed=.4,n.blendMode=f.BLENDMODE_STANDARD,n.preWarmCycles=60,n.preWarmStepOffset=5,n.start(),this.systems.push(n)}dispose(){for(let e of this.systems)e.dispose(!1);this.systems.length=0,this.puff?.dispose()}};export{v as i,T as n,S as r,A as t};