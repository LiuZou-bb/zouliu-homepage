/* A real subdivided WebGL surface, rendered only for the 650 ms bridge. */
(function(){
 'use strict';
 var running=new Map(),snapshots=new WeakMap();
 function reduced(){return window.ExhibitMotion?ExhibitMotion.reduced():matchMedia('(prefers-reduced-motion:reduce)').matches;}
 function sourceImage(source){return source&& (source.matches('img')?source:source.querySelector('img'));}
 function rectangle(img,ready){
  var footprint=img.classList.contains('life-exhibit-photo')&&img.closest('.life-exhibit-stage');
  var r=(footprint||img).getBoundingClientRect(),fit=getComputedStyle(img).objectFit,ratio=img.naturalWidth?img.naturalWidth/img.naturalHeight:ready.naturalWidth/ready.naturalHeight;
  var out={x:r.left,y:r.top,w:r.width,h:r.height,uv:[0,0,1,1],bend:0};
  if(fit==='contain'){var w=Math.min(r.width,r.height*ratio),h=w/ratio;out.x+=(r.width-w)/2;out.y+=(r.height-h)/2;out.w=w;out.h=h;}
  else if(fit==='cover'){var display=Math.max(r.width/img.naturalWidth,r.height/img.naturalHeight),uw=r.width/(img.naturalWidth*display),uh=r.height/(img.naturalHeight*display);out.uv=[(1-uw)/2,(1-uh)/2,uw,uh];}
  return out;
 }
 function mix(a,b,p){return a+(b-a)*p;}
 function cancel(image){var state=running.get(image);if(state)state.finish(false);}
 function cancelAll(){Array.from(running.keys()).forEach(cancel);}
 function settleAll(){Array.from(running.values()).forEach(function(state){state.finish();});}
 function bridge(image,source,reverse,done){
  source=sourceImage(source);
  var prior=running.get(image),interrupted=prior&&prior.pose;
  cancel(image);
  if(reduced()||!source||!source.isConnected||!source.naturalWidth||(!image.naturalWidth&&source.src!==image.src)){if(done)done();return;}
  var small=rectangle(source),large=rectangle(image,source);
  if(!small.w&&snapshots.has(source))small=snapshots.get(source);
  var start=reverse?(interrupted||large):small,end=reverse?small:large;
  if(!small.w||!large.w||small.y+small.h<0||small.y>innerHeight){if(done)done();return;}
  var canvas=document.createElement('canvas');canvas.className='photo-mesh';canvas.setAttribute('aria-hidden','true');
  var gl;try{gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});}catch(_){}
  var duration=window.ExhibitMotion?ExhibitMotion.duration('--motion-image'):650;
  if(image.classList.contains('moment-lead')||source.closest('.moments-modal'))duration=Math.max(820,duration);
  function fallback(){
   var clone=image.cloneNode(false);clone.removeAttribute('id');clone.alt='';clone.className='image-flight';clone.setAttribute('aria-hidden','true');
   Object.assign(clone.style,{left:start.x+'px',top:start.y+'px',width:start.w+'px',height:start.h+'px',objectFit:'cover',maxWidth:'none',maxHeight:'none',margin:'0'});document.body.append(clone);
   var opacity=image.style.opacity;image.style.opacity='0';
   var animation=clone.animate([{left:start.x+'px',top:start.y+'px',width:start.w+'px',height:start.h+'px'},{left:end.x+'px',top:end.y+'px',width:end.w+'px',height:end.h+'px'}],{duration:duration,easing:'cubic-bezier(.22,.75,.2,1)'});
   var state={pose:start,finish:function(notify){running.delete(image);animation.cancel();clone.remove();image.style.opacity=opacity;if(done&&notify!==false)done();}};
   running.set(image,state);animation.onfinish=state.finish;image.dataset.transitionRenderer='continuous-fallback';
  }
  if(!gl){fallback();return;}
  var resources=[],raf=0,finished=false,program,texture,buffer,oldOpacity=image.style.opacity,oldSourceOpacity=source.style.opacity;
  function destroy(){resources.forEach(function(r){if(r.kind==='shader')gl.deleteShader(r.value);});if(texture)gl.deleteTexture(texture);if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);var lose=gl.getExtension('WEBGL_lose_context');if(lose)lose.loseContext();}
  function shader(type,code){var s=gl.createShader(type);resources.push({kind:'shader',value:s});gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('shader');return s;}
  try{
   program=gl.createProgram();
   gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 a_uv; uniform vec4 u_rect; uniform vec4 u_crop; uniform vec2 u_view; uniform float u_bend; varying vec2 v_uv; void main(){vec2 p=u_rect.xy+a_uv*u_rect.zw; float k=min(u_rect.z,u_rect.w)*u_bend; p.x+=sin(a_uv.y*3.14159265)*(a_uv.x-.5)*k; p.y+=sin(a_uv.x*3.14159265)*(a_uv.y-.5)*k; gl_Position=vec4(p.x/u_view.x*2.-1.,1.-p.y/u_view.y*2.,0.,1.); v_uv=u_crop.xy+a_uv*u_crop.zw;}'));
   gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float; uniform sampler2D u_image; varying vec2 v_uv; void main(){gl_FragColor=texture2D(u_image,v_uv);}'));
   gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('link');gl.useProgram(program);
   var vertices=[],nx=48,ny=32;
   for(var y=0;y<ny;y++)for(var x=0;x<nx;x++){var l=x/nx,r=(x+1)/nx,t=y/ny,b=(y+1)/ny;vertices.push(l,t,r,t,l,b,r,t,r,b,l,b);}
   buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
   var attribute=gl.getAttribLocation(program,'a_uv');gl.enableVertexAttribArray(attribute);gl.vertexAttribPointer(attribute,2,gl.FLOAT,false,0,0);
   texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image.naturalWidth?image:source);
   var dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);Object.assign(canvas.style,{left:'0',top:'0',width:innerWidth+'px',height:innerHeight+'px'});gl.viewport(0,0,canvas.width,canvas.height);
   var uniforms={rect:gl.getUniformLocation(program,'u_rect'),crop:gl.getUniformLocation(program,'u_crop'),view:gl.getUniformLocation(program,'u_view'),bend:gl.getUniformLocation(program,'u_bend')};gl.uniform2f(uniforms.view,innerWidth,innerHeight);
   document.body.append(canvas);image.style.opacity='0';source.style.opacity='0';image.dataset.transitionRenderer='webgl-mesh';
   var state={pose:start,finish:function(notify){if(finished)return;finished=true;running.delete(image);cancelAnimationFrame(raf);canvas.remove();image.style.opacity=oldOpacity;source.style.opacity=oldSourceOpacity;destroy();if(done&&notify!==false)done();}};
   running.set(image,state);
   canvas.addEventListener('webglcontextlost',function(e){e.preventDefault();state.finish();},{once:true});
   var begun=performance.now();
   function draw(now){
    if(finished)return;var t=Math.min(1,(now-begun)/duration),p=.5-.5*Math.cos(Math.PI*t);
    var pose={x:mix(start.x,end.x,p),y:mix(start.y,end.y,p),w:mix(start.w,end.w,p),h:mix(start.h,end.h,p),uv:start.uv.map(function(v,i){return mix(v,end.uv[i],p);}),bend:Math.min(.048,(start.bend||0)*(1-p)+Math.sin(Math.PI*t)*.048)};state.pose=pose;
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform4f(uniforms.rect,pose.x,pose.y,pose.w,pose.h);gl.uniform4fv(uniforms.crop,pose.uv);gl.uniform1f(uniforms.bend,t===1?0:pose.bend);gl.drawArrays(gl.TRIANGLES,0,vertices.length/2);
    if(t<1)raf=requestAnimationFrame(draw);else state.finish();
   }
   draw(begun);
  }catch(_){destroy();canvas.remove();image.style.opacity=oldOpacity;source.style.opacity=oldSourceOpacity;fallback();}
 }
 window.ImageTransition={capture:function(source){var img=sourceImage(source);if(img&&img.naturalWidth&&img.getBoundingClientRect().width)snapshots.set(img,rectangle(img));},open:function(image,source){bridge(image,source,false);},close:function(image,source,done){bridge(image,source,true,done);},cancel:cancel,cancelAll:cancelAll};
 document.addEventListener('visibilitychange',function(){if(document.hidden)settleAll();});window.addEventListener('resize',settleAll,{passive:true});window.addEventListener('pagehide',cancelAll);
 new MutationObserver(function(){if(reduced())Array.from(running.values()).forEach(function(s){s.finish();});}).observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});
})();
