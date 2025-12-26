const BOT_TOKEN = "8345542386:AAFY681n4I4_Yvm-KN5z7GgK8h2NPFiLnEQ";
const CHAT_ID   = "1349713396";

let messages = [];
let lastUpdateId = 0;

const chat = document.getElementById("chat");
const input = document.getElementById("text");
const emojiPanel = document.getElementById("emojiPanel");
const typing = document.getElementById("typing");

/* EMOJI LIST (DIRECT UNICODE) */
const EMOJIS = [
  "😀","😁","😂","🤣","😊","😍","😘","😎","🤩",
  "😢","😭","😡","👍","👏","🙏","🔥","❤️","💯","🎉","📷","🎥"
];

EMOJIS.forEach(e=>{
  const s=document.createElement("span");
  s.textContent=e;
  s.onclick=()=>{ input.value += e; };
  emojiPanel.appendChild(s);
});

function toggleEmoji(){
  emojiPanel.classList.toggle("hidden");
}

/* RENDER */
function render(){
  chat.innerHTML="";
  messages.forEach(m=>{
    const d=document.createElement("div");
    d.className="msg "+(m.me?"me":"other");
    d.innerHTML = `
      ${m.text}
      <div class="time">${m.time}</div>
    `;
    chat.appendChild(d);
  });
  chat.scrollTop = chat.scrollHeight;
}

/* SEND */
function send(){
  const t = input.value.trim();
  if(!t) return;

  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({
      chat_id: CHAT_ID,
      text: t
    })
  });

  messages.push({
    me:true,
    text:t,
    time: timeNow()
  });

  input.value="";
  typing.classList.add("hidden");
  render();
}

/* RECEIVE */
function receive(){
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId+1}`)
    .then(r=>r.json())
    .then(d=>{
      d.result.forEach(u=>{
        lastUpdateId=u.update_id;
        if(u.message && u.message.text){
          messages.push({
            me:false,
            text:u.message.text,
            time: timeNow()
          });
        }
      });
      render();
    });
}
setInterval(receive,3000);

/* TYPING */
let typingTimer;
input.addEventListener("input",()=>{
  typing.classList.remove("hidden");
  clearTimeout(typingTimer);
  typingTimer=setTimeout(()=>{
    typing.classList.add("hidden");
  },1000);
});

/* CLEAR */
function clearAll(){
  if(confirm("Clear all chat?")){
    messages=[];
    render();
  }
}

/* TIME */
function timeNow(){
  return new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}
