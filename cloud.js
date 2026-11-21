import {firebaseConfig} from './firebase-config.js';
const status=document.getElementById('cloudStatus');
const configured=Object.values(firebaseConfig).every(x=>x&&!String(x).includes('REPLACE_ME'));
let auth,db,user=null,docRef=null,dbApi=null,authApi=null,saveTimer=null,loading=false,ready=false;
function message(s){status.textContent=s}
window.manamonCloud={isConnected:()=>!!user,queueSave:()=>{if(!ready||loading)return;clearTimeout(saveTimer);saveTimer=setTimeout(()=>push().catch(e=>message('同期失敗：'+e.message)),900)},pull:async()=>{if(!docRef)throw Error('先にログインしてください');const snap=await dbApi.getDoc(docRef);if(snap.exists()){loading=true;try{applyCloudPayload(snap.data())}finally{loading=false}}else await push()},login:async(email,password,signup)=>{if(!configured){message('firebase-config.js にFirebase設定を入力してください');return}try{message('接続中…');if(signup)await authApi.createUserWithEmailAndPassword(auth,email,password);else await authApi.signInWithEmailAndPassword(auth,email,password)}catch(e){message('ログインできません：'+e.message)}},logout:async()=>{if(auth){await authApi.signOut(auth);message('ログアウトしました。端末内の記録は残ります')}}};
async function push(){if(!docRef||!ready)return;await dbApi.setDoc(docRef,cloudPayload());message('☁️ クラウドに保存しました')}
if(!configured){message('未設定：firebase-config.js を編集してからGitHubへアップロードしてください')}else{
try{
const [appMod,authMod,fireMod]=await Promise.all([
 import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
 import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js'),
 import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js')]);
authApi=authMod;dbApi=fireMod;
const app=appMod.initializeApp(firebaseConfig);auth=authMod.getAuth(app);db=fireMod.getFirestore(app);
authMod.onAuthStateChanged(auth,async current=>{user=current;ready=false;docRef=null;if(!current){message('ログインするとクラウド同期できます');return}docRef=fireMod.doc(db,'profiles',current.uid);try{const snap=await fireMod.getDoc(docRef);if(snap.exists()){loading=true;try{applyCloudPayload(snap.data())}finally{loading=false}}ready=true;if(!snap.exists())await push();message('☁️ 接続中：学習終了時・問題登録時に自動保存します')}catch(e){message('同期できません：'+e.message)}})
}catch(e){message('Firebaseを読み込めません：'+e.message)}
}
