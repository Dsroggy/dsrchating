/******** KEYBOARD VIEWPORT FIX ********/
function resizeApp(){
  const vh = window.visualViewport
    ? window.visualViewport.height
    : window.innerHeight;
  document.querySelector(".app").style.height = vh + "px";
}
resizeApp();
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", resizeApp);
}
window.addEventListener("resize", resizeApp);

/******** TELEGRAM ********/
const BOT_TOKEN = "8345542386:AAFY681n4I4_Yvm-KN5z7GgK8h2NPFiLnEQ";
const CHAT_ID   = "1349713396";

let messages = [];
let lastUpdateId = 0;

const chat = document.getElementById("chat");
const input = document.getElementById("text");
const emojiPanel = document.getElementById("emojiPanel");
const typing = document.getElementById("typing");

/******** EMOJIS ********/
const EMOJIS = ["😀","😁","😂","🤣","😊","😍","😘","😎","🤩","😢","😭","😡","👍","👏","🙏","🔥","❤️","💯"];
EMOJIS.forEach(e=>{
  const s=document.createElement("span");
  s.textContent=e;
  s.onclick=()=>{ input.value+=e; };
  emojiPanel.appendChild(s);
});
function toggleEmoji(){
  emojiPanel.classList.toggle("hidden");
}

/******** WHATSAPP SCROLL RULE ********/
function userIsAtBottom(){
  return chat.scrollHeight - chat.scrollTop - chat.clientHeight < 20;
}

/******** RENDER ********/
function render(){
  const shouldScroll = userIsAtBottom();

  chat.innerHTML="";
  messages.forEach(m=>{
    const d=document.createElement("div");
    d.className="msg "+(m.me?"me":"other");
    d.innerHTML = `
      ${m.html}
      <div class="time">${m.time}</div>
    `;
    chat.appendChild(d);
  });

  if (shouldScroll) {
    chat.scrollTop = chat.scrollHeight;
  }
}

/******** SEND TEXT ********/
function send(){
  const t=input.value.trim();
  if(!t) return;

  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({ chat_id: CHAT_ID, text: t })
  });

  messages.push({
    me:true,
    html: escapeHTML(t),
    time: timeNow()
  });

  input.value="";
  typing.classList.add("hidden");

  render(); // ❗ NO FORCE SCROLL
}

/******** RECEIVE ********/
function receive(){
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId+1}`)
    .then(r=>r.json())
    .then(d=>{
      d.result.forEach(u=>{
        lastUpdateId=u.update_id;
        if(u.message && u.message.text){
          messages.push({
            me:false,
            html: escapeHTML(u.message.text),
            time: timeNow()
          });
        }
      });
      render();
    });
}
setInterval(receive,3000);

/******** PHOTO / VIDEO SEND ********/
function attachFile(e){
  const f=e.target.files[0];
  if(!f) return;

  const url = URL.createObjectURL(f);
  const html = f.type.startsWith("video")
    ? `<video src="${url}" controls style="max-width:100%;border-radius:10px"></video>`
    : `<img src="${url}" style="max-width:100%;border-radius:10px">`;

  messages.push({
    me:true,
    html,
    time: timeNow()
  });

  render(); // ❗ NO FORCE SCROLL
  e.target.value="";
}

/******** TYPING ********/
let typingTimer;
input.addEventListener("input",()=>{
  typing.classList.remove("hidden");
  clearTimeout(typingTimer);
  typingTimer=setTimeout(()=>typing.classList.add("hidden"),800);
});

/******** CLEAR ********/
function clearAll(){
  if(confirm("Clear all chat?")){
    messages=[];
    render();
  }
}

/******** HELPERS ********/
function timeNow(){
  return new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}
function escapeHTML(s){
  return s.replace(/[&<>"']/g,m=>(
    {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]
  ));
}
