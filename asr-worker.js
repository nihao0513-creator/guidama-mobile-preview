// 무료 다국어 Whisper Tiny. 첫 준비 때 모델과 실행 파일을 내려받고 브라우저 캐시에 보관합니다.
// 음성 샘플은 이 Worker 안에서만 분석하며 외부 API로 전송하지 않습니다.
let transcriber=null,loading=null;
async function prepare(){
  if(transcriber)return;
  if(loading)return loading;
  loading=(async()=>{
    const {pipeline,env}=await import('./vendor/transformers.js');
    env.useBrowserCache=true;
    env.backends.onnx.wasm.numThreads=1;
    env.backends.onnx.wasm.wasmPaths=new URL('./vendor/',self.location.href).href;
    transcriber=await pipeline('automatic-speech-recognition','onnx-community/whisper-tiny',{
      device:'wasm',dtype:'q8',progress_callback:p=>{
        if(p.status==='progress')self.postMessage({type:'progress',file:p.file,percent:Math.round(p.progress||0)});
      }
    });
    self.postMessage({type:'ready'});
  })();
  try{await loading}catch(e){loading=null;throw e}
}
self.onmessage=async e=>{
  const {type,id,samples}=e.data||{};
  try{
    if(type==='prepare')return await prepare();
    if(type==='transcribe'){
      await prepare();
      const result=await transcriber(new Float32Array(samples),{language:'korean',task:'transcribe',max_new_tokens:160});
      self.postMessage({type:'result',id,text:String(result.text||'').trim()});
    }
  }catch(err){self.postMessage({type:'error',id,message:String(err?.message||err)})}
};
