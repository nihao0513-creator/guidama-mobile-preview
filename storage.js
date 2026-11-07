const DB_NAME='guidama-mobile-v1';
let openPromise;
function db(){if(!openPromise)openPromise=new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>{const d=req.result;d.createObjectStore('meetings',{keyPath:'id'});const chunks=d.createObjectStore('chunks',{keyPath:['meetingId','segment','part']});chunks.createIndex('meetingId','meetingId')};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});return openPromise}
function transaction(store,mode,fn){return db().then(d=>new Promise((resolve,reject)=>{const t=d.transaction(store,mode);let result;t.oncomplete=()=>resolve(result);t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error||new Error('저장 실패'));const request=fn(t.objectStore(store));if(request){request.onsuccess=()=>result=request.result;request.onerror=()=>reject(request.error)}}))}
export const listMeetings=async()=>(await transaction('meetings','readonly',s=>s.getAll())).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
export const getMeeting=id=>transaction('meetings','readonly',s=>s.get(id));
export const putMeeting=meeting=>transaction('meetings','readwrite',s=>s.put(meeting));
export const putChunk=chunk=>transaction('chunks','readwrite',s=>s.put(chunk));
export const getChunks=id=>db().then(d=>new Promise((resolve,reject)=>{const t=d.transaction('chunks','readonly');const r=t.objectStore('chunks').index('meetingId').getAll(IDBKeyRange.only(id));r.onsuccess=()=>resolve(r.result.sort((a,b)=>a.segment-b.segment||a.part-b.part));r.onerror=()=>reject(r.error)}));
export async function removeMeeting(id){const d=await db();const chunks=await getChunks(id);return new Promise((resolve,reject)=>{const t=d.transaction(['meetings','chunks'],'readwrite');t.objectStore('meetings').delete(id);const s=t.objectStore('chunks');for(const c of chunks)s.delete([c.meetingId,c.segment,c.part]);t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error)})}
