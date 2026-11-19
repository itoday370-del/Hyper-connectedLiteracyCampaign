// 공유하기 전에 3초 — 캠페인 페이지
const FIREBASE_VERSION = "10.12.2";
const LABELS = { share: "공유한다", comment: "댓글만 단다", pass: "그냥 넘긴다", check: "사실을 더 확인한다" };
const ORDER = ["share", "comment", "pass", "check"];
const SPREAD = { group: "단톡방", story: "인스타 스토리", community: "커뮤니티", blog: "블로그", dm: "친구 1:1" };
const SPREAD_KEYS = ["group", "story", "community", "blog", "dm", "none"];

/* ---------- 작은 도구 ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const local = {
  get(k, d) { try { const v = localStorage.getItem("c3_" + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem("c3_" + k, JSON.stringify(v)); } catch { /* 저장 불가 환경 */ } },
};
function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) n.setAttribute(k, v);
  }
  for (const c of kids) if (c != null) n.append(c);
  return n;
}
function timeAgo(ms) {
  const s = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return "방금";
  if (s < 3600) return Math.floor(s / 60) + "분 전";
  if (s < 86400) return Math.floor(s / 3600) + "시간 전";
  return Math.floor(s / 86400) + "일 전";
}

/* ---------- 글 거르기 ---------- */
const BAD_WORDS = ["시발", "씨발", "씨빨", "씨바", "시바", "ㅅㅂ", "ㅆㅂ", "병신", "ㅂㅅ", "븅신", "빙신", "개새", "개색", "새끼", "좆", "존나", "ㅈㄴ", "지랄", "ㅈㄹ", "미친놈", "미친년", "엠창", "니애미", "느금", "닥쳐", "꺼져"];
function checkText(text) {
  const t = text.trim();
  if (!t) return "내용을 써 주세요.";
  const squashed = t.replace(/[^\p{L}]/gu, "");
  if (BAD_WORDS.some(w => squashed.includes(w))) return "욕설이 들어간 글은 올릴 수 없어요.";
  if (/01[016789][\s.-]?\d{3,4}[\s.-]?\d{4}/.test(t)) return "전화번호 같은 개인정보는 쓸 수 없어요.";
  return null;
}

/* ---------- 저장소: 시험 모드(이 기기에만 저장) ---------- */
class LocalStore {
  constructor() { this.mode = "local"; this.subs = { comments: [], checks: [], responses: [], settings: [] }; }
  async init() {
    this.uid = local.get("uid", null) || ("local-" + Math.random().toString(36).slice(2, 10));
    local.set("uid", this.uid);
    this.isAdmin = true;
  }
  _read(k) { return local.get("db_" + k, k === "responses" ? {} : (k === "settings" ? { open: true } : [])); }
  _write(k, v) { local.set("db_" + k, v); this.subs[k].forEach(cb => cb(this._shape(k))); }
  _shape(k) {
    const v = this._read(k);
    if (k === "responses") return Object.values(v);
    return v;
  }
  _sub(k, cb) { this.subs[k].push(cb); cb(this._shape(k)); }
  onComments(cb) { this._sub("comments", cb); }
  onChecks(cb) { this._sub("checks", cb); }
  onResponses(cb) { this._sub("responses", cb); }
  onSettings(cb) { this._sub("settings", cb); }
  async addComment(c) {
    const list = this._read("comments");
    list.push({ ...c, id: Math.random().toString(36).slice(2), likes: 0, dislikes: 0, createdAt: Date.now(), uid: this.uid });
    this._write("comments", list);
  }
  async vote(id, dLikes, dDislikes) {
    const list = this._read("comments");
    const c = list.find(x => x.id === id);
    if (c) { c.likes += dLikes; c.dislikes += dDislikes; this._write("comments", list); }
  }
  async deleteComment(id) { this._write("comments", this._read("comments").filter(x => x.id !== id)); }
  async addCheck(c) {
    const list = this._read("checks");
    list.push({ ...c, id: Math.random().toString(36).slice(2), createdAt: Date.now(), uid: this.uid });
    this._write("checks", list);
  }
  async deleteCheck(id) { this._write("checks", this._read("checks").filter(x => x.id !== id)); }
  async saveResponse(field, value) {
    const all = this._read("responses");
    all[this.uid] = { ...(all[this.uid] || {}), [field]: value };
    this._write("responses", all);
  }
  async setOpen(open) { this._write("settings", { ...this._read("settings"), open }); }
  async resetAll() {
    this._write("comments", []); this._write("checks", []); this._write("responses", {});
    this._write("settings", { ...this._read("settings"), round: Date.now() });
  }
}

/* ---------- 저장소: Firebase(모두가 함께 보는 저장) ---------- */
class FirebaseStore {
  constructor(config) { this.config = config; this.mode = "firebase"; }
  async init() {
    const base = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;
    const [appMod, authMod, fs] = await Promise.all([
      import(`${base}/firebase-app.js`),
      import(`${base}/firebase-auth.js`),
      import(`${base}/firebase-firestore.js`),
    ]);
    this.fs = fs;
    const app = appMod.initializeApp(this.config);
    const auth = authMod.getAuth(app);
    this.db = fs.getFirestore(app);
    const cred = await authMod.signInAnonymously(auth);
    this.uid = cred.user.uid;
    try {
      const adminDoc = await fs.getDoc(fs.doc(this.db, "admins", this.uid));
      this.isAdmin = adminDoc.exists();
    } catch { this.isAdmin = false; }
  }
  _ms(ts) { return ts && ts.toMillis ? ts.toMillis() : Date.now(); }
  onComments(cb) {
    const { collection, query, orderBy, onSnapshot } = this.fs;
    onSnapshot(query(collection(this.db, "comments"), orderBy("createdAt", "asc")), snap => {
      cb(snap.docs.map(d => ({ id: d.id, ...d.data({ serverTimestamps: "estimate" }), createdAt: this._ms(d.data({ serverTimestamps: "estimate" }).createdAt) })));
    }, err => showError(err));
  }
  onChecks(cb) {
    const { collection, query, orderBy, onSnapshot } = this.fs;
    onSnapshot(query(collection(this.db, "checks"), orderBy("createdAt", "asc")), snap => {
      cb(snap.docs.map(d => ({ id: d.id, ...d.data({ serverTimestamps: "estimate" }), createdAt: this._ms(d.data({ serverTimestamps: "estimate" }).createdAt) })));
    }, err => showError(err));
  }
  onResponses(cb) {
    const { collection, onSnapshot } = this.fs;
    onSnapshot(collection(this.db, "responses"), snap => cb(snap.docs.map(d => d.data())), err => showError(err));
  }
  onSettings(cb) {
    const { doc, onSnapshot } = this.fs;
    onSnapshot(doc(this.db, "settings", "main"), snap => cb(snap.exists() ? snap.data() : { open: true }), () => cb({ open: true }));
  }
  async addComment(c) {
    const { collection, addDoc, serverTimestamp } = this.fs;
    await addDoc(collection(this.db, "comments"), {
      text: c.text, nick: c.nick, phase: c.phase, parentId: c.parentId || null,
      likes: 0, dislikes: 0, hidden: false, uid: this.uid, createdAt: serverTimestamp(),
    });
  }
  async vote(id, dLikes, dDislikes) {
    const { doc, updateDoc, increment } = this.fs;
    const patch = {};
    if (dLikes) patch.likes = increment(dLikes);
    if (dDislikes) patch.dislikes = increment(dDislikes);
    await updateDoc(doc(this.db, "comments", id), patch);
  }
  async deleteComment(id) { const { doc, deleteDoc } = this.fs; await deleteDoc(doc(this.db, "comments", id)); }
  async addCheck(c) {
    const { collection, addDoc, serverTimestamp } = this.fs;
    await addDoc(collection(this.db, "checks"), { text: c.text, nick: c.nick, uid: this.uid, createdAt: serverTimestamp() });
  }
  async deleteCheck(id) { const { doc, deleteDoc } = this.fs; await deleteDoc(doc(this.db, "checks", id)); }
  async saveResponse(field, value) {
    const { doc, setDoc, serverTimestamp } = this.fs;
    await setDoc(doc(this.db, "responses", this.uid), { [field]: value, updatedAt: serverTimestamp() }, { merge: true });
  }
  async setOpen(open) { const { doc, setDoc } = this.fs; await setDoc(doc(this.db, "settings", "main"), { open }, { merge: true }); }
  async resetAll(onProgress) {
    const { collection, getDocs, writeBatch, doc, setDoc } = this.fs;
    let done = 0;
    for (const name of ["comments", "checks", "responses"]) {
      const snap = await getDocs(collection(this.db, name));
      const docs = snap.docs;
      for (let i = 0; i < docs.length; i += 400) {
        const batch = writeBatch(this.db);
        docs.slice(i, i + 400).forEach(d => batch.delete(d.ref));
        await batch.commit();
        done += Math.min(400, docs.length - i);
        if (onProgress) onProgress(done);
      }
    }
    await setDoc(doc(this.db, "settings", "main"), { round: Date.now() }, { merge: true });
    return done;
  }
}

/* ---------- 상태 ---------- */
const state = {
  step: 1,
  first: local.get("first", null),
  second: local.get("second", null),
  firstComment: local.get("firstComment", null),
  revealed: local.get("revealed", false),
  myVotes: local.get("votes", {}),
  spread: local.get("spread", null),
  spreadPick: new Set(),
  sort: "best",
  comments: [],
  open: true,
  lastPost: 0,
};
let store;

function myNick() {
  let n = local.get("nick", null);
  if (!n) { n = "익명" + String(Math.floor(1000 + Math.random() * 9000)); local.set("nick", n); }
  return n;
}

function showError(err) {
  console.error(err);
  const b = $("#demo-banner");
  b.textContent = "저장 연결에 문제가 생겼어요. 잠시 후 새로고침해 주세요.";
  b.hidden = false;
}

/* ---------- 단계 이동 ---------- */
function go(step) {
  state.step = step;
  for (let i = 1; i <= 4; i++) $("#step" + i).hidden = i !== step;
  $$(".steps li").forEach(li => {
    const n = Number(li.dataset.step);
    li.classList.toggle("on", n === step);
    li.classList.toggle("done", n < step);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- 선택 버튼 ---------- */
function bindChoices(boxSel, key) {
  const box = $(boxSel);
  const paint = () => {
    $$("button", box).forEach(b => b.classList.toggle("on", b.dataset.v === state[key]));
    box.classList.toggle("locked", !!state[key]);
  };
  box.addEventListener("click", async e => {
    const b = e.target.closest("button");
    if (!b) return;
    state[key] = b.dataset.v;
    local.set(key, state[key]);
    paint();
    updateGates();
    try { await store.saveResponse(key === "first" ? "before" : "after", state[key]); } catch (err) { showError(err); }
  });
  paint();
}

function updateGates() {
  const ready = !!state.first && !!state.spread;
  $("#go-context").disabled = !ready;
  $("#go-hint").hidden = ready;
  $("#go-result").disabled = !state.second;
  $("#result-hint").hidden = !!state.second;
}

/* ---------- 댓글 ---------- */
async function submitComment(text, parentId, msgEl) {
  if (!state.open) { msgEl.textContent = "지금은 댓글을 쓸 수 없어요."; return false; }
  const problem = checkText(text);
  if (problem) { msgEl.textContent = problem; return false; }
  if (Date.now() - state.lastPost < 5000) { msgEl.textContent = "조금 뒤에 다시 써 주세요."; return false; }
  const phase = state.revealed ? "after" : "before";
  try {
    await store.addComment({ text: text.trim(), nick: myNick(), phase, parentId });
    state.lastPost = Date.now();
    if (!parentId && !state.revealed && !state.firstComment) {
      state.firstComment = text.trim();
      local.set("firstComment", state.firstComment);
    }
    msgEl.textContent = "";
    return true;
  } catch (err) {
    msgEl.textContent = "등록하지 못했어요. 잠시 후 다시 시도해 주세요.";
    console.error(err);
    return false;
  }
}

async function doVote(c, dir) {
  if (!state.open) return;
  const prev = state.myVotes[c.id] || 0;
  const next = prev === dir ? 0 : dir;
  const dLikes = (next === 1 ? 1 : 0) - (prev === 1 ? 1 : 0);
  const dDislikes = (next === -1 ? 1 : 0) - (prev === -1 ? 1 : 0);
  state.myVotes[c.id] = next;
  local.set("votes", state.myVotes);
  try { await store.vote(c.id, dLikes, dDislikes); }
  catch (err) { state.myVotes[c.id] = prev; local.set("votes", state.myVotes); console.error(err); }
  renderComments();
}

function commentNode(c, { best = false, isReply = false } = {}) {
  const mine = state.myVotes[c.id] || 0;
  const li = el("li", { class: "comment" });
  li.append(el("div", { class: "c-head" },
    best ? el("span", { class: "c-best", text: "BEST" }) : null,
    el("span", { class: "c-nick", text: c.nick || "익명" }),
    el("span", { class: "c-phase " + (c.phase === "after" ? "after" : ""), text: c.phase === "after" ? "맥락 본 후" : "맥락 보기 전" }),
    el("span", { text: timeAgo(c.createdAt) }),
  ));
  li.append(el("p", { class: "c-text", text: c.text }));
  const actions = el("div", { class: "c-actions" },
    el("button", { type: "button", class: mine === 1 ? "on-up" : "", text: `추천 ${c.likes || 0}`, onclick: () => doVote(c, 1) }),
    el("button", { type: "button", class: mine === -1 ? "on-down" : "", text: `비추천 ${c.dislikes || 0}`, onclick: () => doVote(c, -1) }),
  );
  if (!isReply) actions.append(el("button", { type: "button", text: "답글", onclick: () => toggleReply(li, c) }));
  if (canManage()) {
    actions.append(deleteButton(() => store.deleteComment(c.id)));
  }
  li.append(actions);
  return li;
}

function deleteButton(fn) {
  // 브라우저 확인창 대신 두 번 눌러서 삭제
  const b = el("button", { type: "button", class: "del", text: "삭제" });
  let armed = false, timer;
  b.addEventListener("click", async () => {
    if (!armed) {
      armed = true; b.textContent = "한 번 더 누르면 삭제";
      timer = setTimeout(() => { armed = false; b.textContent = "삭제"; }, 2500);
      return;
    }
    clearTimeout(timer);
    try { await fn(); } catch (err) { console.error(err); }
  });
  return b;
}

function toggleReply(li, c) {
  const existing = $(".reply-form", li);
  if (existing) { existing.remove(); return; }
  const ta = el("textarea", { maxlength: "300", rows: "2", placeholder: "답글을 남겨 주세요" });
  const msg = el("p", { class: "form-msg" });
  const form = el("form", { class: "comment-form reply-form", autocomplete: "off" },
    ta, el("div", { class: "form-row" }, el("span", { class: "nick-label", text: "닉네임 " + myNick() }), el("button", { type: "submit", class: "btn", text: "등록" })), msg);
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (await submitComment(ta.value, c.id, msg)) form.remove();
  });
  const actions = $(".c-actions", li);
  actions.after(form);
  ta.focus();
}

function renderComments() {
  const list = $("#comment-list");
  const all = state.comments.filter(c => !c.hidden);
  const ids = new Set(all.map(c => c.id));
  const tops = all.filter(c => !c.parentId);
  const replies = all.filter(c => c.parentId && ids.has(c.parentId));
  $("#comment-count").textContent = tops.length + replies.length;

  const score = c => (c.likes || 0) - (c.dislikes || 0);
  const sorted = [...tops].sort(state.sort === "best"
    ? (a, b) => score(b) - score(a) || b.createdAt - a.createdAt
    : (a, b) => b.createdAt - a.createdAt);
  const bestIds = state.sort === "best"
    ? new Set(sorted.filter(c => (c.likes || 0) >= 1).slice(0, 3).map(c => c.id))
    : new Set();

  // 열려 있는 답글 입력창은 유지
  const openReply = $(".reply-form", list)?.closest(".comment")?.dataset.id;
  const openText = openReply ? $(".reply-form textarea", list).value : "";

  list.replaceChildren();
  if (!sorted.length) { list.append(el("li", { class: "empty", text: "아직 댓글이 없어요. 첫 댓글을 남겨 보세요." })); return; }
  for (const c of sorted) {
    const node = commentNode(c, { best: bestIds.has(c.id) });
    node.dataset.id = c.id;
    const rs = replies.filter(r => r.parentId === c.id).sort((a, b) => a.createdAt - b.createdAt);
    if (rs.length) {
      const ul = el("ul", { class: "replies" });
      rs.forEach(r => ul.append(commentNode(r, { isReply: true })));
      node.append(ul);
    }
    list.append(node);
    if (c.id === openReply) { toggleReply(node, c); $(".reply-form textarea", node).value = openText; }
  }
}

/* ---------- 확인 메모 ---------- */
function renderChecks(items) {
  const list = $("#check-list");
  list.replaceChildren();
  const shown = [...items].sort((a, b) => b.createdAt - a.createdAt).slice(0, 60);
  for (const c of shown) {
    const li = el("li", { text: c.text });
    if (canManage()) {
      li.append(deleteButton(() => store.deleteCheck(c.id)));
    }
    list.append(li);
  }
}

/* ---------- 확산 지도 ---------- */
function bindSpread() {
  const box = $("#spread-choices"), save = $("#spread-save");
  const paint = () => {
    const picked = state.spread ? new Set(state.spread) : state.spreadPick;
    $$("button", box).forEach(b => b.classList.toggle("on", picked.has(b.dataset.v)));
    box.classList.toggle("saved", !!state.spread);
    save.disabled = !!state.spread || state.spreadPick.size === 0;
    save.textContent = state.spread ? "이었어요" : "지도에 잇기";
    $("#spread-wrap").hidden = !state.spread;
  };
  box.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b || state.spread) return;
    const v = b.dataset.v;
    if (v === "none") { state.spreadPick = state.spreadPick.has("none") ? new Set() : new Set(["none"]); }
    else {
      state.spreadPick.delete("none");
      state.spreadPick.has(v) ? state.spreadPick.delete(v) : state.spreadPick.add(v);
    }
    paint();
  });
  save.addEventListener("click", async () => {
    if (!state.open) { $("#spread-msg").textContent = "지금은 참여할 수 없어요."; return; }
    const list = SPREAD_KEYS.filter(k => state.spreadPick.has(k));
    if (!list.length) return;
    try {
      await store.saveResponse("spread", list);
      state.spread = list; local.set("spread", list);
      $("#spread-msg").textContent = "";
    } catch (err) { $("#spread-msg").textContent = "잇지 못했어요. 다시 눌러 주세요."; console.error(err); }
    paint(); updateGates();
  });
  paint();
}

function spreadSvg(counts, people, mine) {
  const W = 340, H = 250, cx = 170, cy = 125;
  const keys = Object.keys(SPREAD);
  const max = Math.max(1, ...keys.map(k => counts[k] || 0));
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "확산 지도: " + keys.map(k => `${SPREAD[k]} ${counts[k] || 0}명`).join(", "));
  const mk = (tag, attrs, text) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (text != null) n.textContent = text;
    svg.append(n); return n;
  };
  const style = getComputedStyle(document.documentElement);
  const red = style.getPropertyValue("--accent").trim() || "#d6342c";
  const line = style.getPropertyValue("--line").trim() || "#ddd";
  const text = style.getPropertyValue("--text").trim() || "#222";
  const muted = style.getPropertyValue("--muted").trim() || "#777";
  const surface = style.getPropertyValue("--surface").trim() || "#fff";
  const pos = keys.map((k, i) => {
    const a = -Math.PI / 2 + i * (2 * Math.PI / keys.length);
    return { k, x: cx + Math.cos(a) * 125, y: cy + Math.sin(a) * 92 };
  });
  for (const p of pos) {
    const c = counts[p.k] || 0;
    mk("line", { x1: cx, y1: cy, x2: p.x, y2: p.y, stroke: c ? red : line, "stroke-width": c ? 2 + 12 * c / max : 1.5, "stroke-linecap": "round", opacity: c ? 0.85 : 1 });
  }
  mk("circle", { cx, cy, r: 30, fill: red });
  mk("text", { x: cx, y: cy + 5, "text-anchor": "middle", "font-size": 13, "font-weight": 700, fill: "#fff" }, "글 하나");
  for (const p of pos) {
    const c = counts[p.k] || 0;
    const isMine = mine && mine.includes(p.k);
    mk("rect", { x: p.x - 38, y: p.y - 17, width: 76, height: 34, rx: 9, fill: surface, stroke: isMine ? red : line, "stroke-width": isMine ? 2.5 : 1 });
    mk("text", { x: p.x, y: p.y - 2, "text-anchor": "middle", "font-size": 11.5, "font-weight": 700, fill: text }, SPREAD[p.k]);
    mk("text", { x: p.x, y: p.y + 12, "text-anchor": "middle", "font-size": 11, fill: muted }, c + "명");
  }
  return svg;
}

function renderSpread(responses) {
  const withSpread = responses.filter(r => Array.isArray(r.spread));
  const counts = {};
  let links = 0, none = 0;
  for (const r of withSpread) for (const k of r.spread) {
    if (k === "none") { none++; continue; }
    if (SPREAD[k]) { counts[k] = (counts[k] || 0) + 1; links++; }
  }
  const msg = withSpread.length
    ? `지금까지 ${withSpread.length}명이 이 글을 ${links}곳으로 보냈어요.` + (none ? ` 안 보낸다는 ${none}명이에요.` : "")
    : "아직 아무도 잇지 않았어요.";
  for (const [mapId, totalId] of [["#spread-map", "#spread-total"], ["#result-map", "#result-spread-total"]]) {
    $(mapId).replaceChildren(spreadSvg(counts, withSpread.length, state.spread));
    $(totalId).textContent = msg;
  }
}

/* ---------- 결과 ---------- */
function renderResults(responses) {
  const before = responses.filter(r => r.before);
  const after = responses.filter(r => r.after);
  const total = Math.max(before.length, after.length);
  $("#result-total").textContent = total ? `지금까지 ${total}명이 참여했어요.` : "아직 참여한 사람이 없어요.";
  const box = $("#result-bars");
  box.replaceChildren();
  for (const k of ORDER) {
    const b = before.filter(r => r.before === k).length;
    const a = after.filter(r => r.after === k).length;
    const pb = before.length ? Math.round(b / before.length * 100) : 0;
    const pa = after.length ? Math.round(a / after.length * 100) : 0;
    box.append(el("div", {},
      el("div", { class: "bar-label", text: LABELS[k] }),
      barRow("before", pb, `${b}명, ${pb}%`),
      barRow("after", pa, `${a}명, ${pa}%`),
    ));
  }
}
function barRow(kind, pct, title) {
  const fill = el("div", { class: "bar-fill " + kind });
  fill.style.width = pct + "%";
  return el("div", { class: "bar-row", title }, el("div", { class: "bar-track" }, fill), el("span", { class: "bar-num", text: pct + "%" }));
}
function renderCommentStats() {
  const visible = state.comments.filter(c => !c.hidden);
  $("#stat-before").textContent = visible.filter(c => c.phase !== "after").length;
  $("#stat-after").textContent = visible.filter(c => c.phase === "after").length;
}

/* ---------- 관리 ---------- */
function isAdminView() { return new URLSearchParams(location.search).has("admin"); }
function canManage() { return isAdminView() && (store.mode === "local" || store.isAdmin); }
function setupAdmin() {
  if (!isAdminView()) return;
  $("#admin").hidden = false;
  $("#my-uid").textContent = store.uid;
  const admin = store.isAdmin;
  $("#admin-state").textContent = store.mode === "local"
    ? "시험 모드에서는 이 기기에서 바로 관리할 수 있어요."
    : (admin ? "관리자 권한이 있어요." : "관리자 권한이 없어요. 위 ID를 Firebase의 admins 컬렉션에 문서 ID로 추가하세요.");
  const reset = $("#reset-all"), resetMsg = $("#reset-msg");
  reset.hidden = !admin;
  let armed = false, timer;
  reset.addEventListener("click", async () => {
    if (!armed) {
      armed = true; reset.textContent = "한 번 더 누르면 모두 지워져요";
      timer = setTimeout(() => { armed = false; reset.textContent = "전체 초기화"; }, 3000);
      return;
    }
    clearTimeout(timer); armed = false;
    reset.disabled = true; reset.textContent = "지우는 중...";
    try {
      const n = await store.resetAll(done => { resetMsg.textContent = `${done}개 지웠어요...`; });
      resetMsg.textContent = `모두 지웠어요. (${n}개)`;
    } catch (err) {
      console.error(err);
      resetMsg.textContent = "지우지 못했어요. 관리자 권한과 Firebase 규칙을 확인해 주세요.";
    }
    reset.disabled = false; reset.textContent = "전체 초기화";
  });
  const btn = $("#toggle-open");
  btn.hidden = !admin;
  btn.addEventListener("click", async () => {
    try { await store.setOpen(!state.open); } catch (err) { console.error(err); }
  });
}

const PROGRESS_KEYS = ["first", "second", "firstComment", "revealed", "votes", "spread", "introSeen"];
function applySettings(s) {
  const round = s.round || 0;
  const mine = local.get("round", null);
  if (mine === null) local.set("round", round);
  else if (mine !== round) {
    // 관리자가 전체 초기화를 하면 이 기기의 진행 기록도 처음으로 돌림
    PROGRESS_KEYS.forEach(k => { try { localStorage.removeItem("c3_" + k); } catch { /* 무시 */ } });
    local.set("round", round);
    location.reload();
    return;
  }
  state.open = s.open !== false;
  $("#closed-banner").hidden = state.open;
  $$("#comment-form textarea, #comment-form button, #check-form textarea, #check-form button")
    .forEach(n => { n.disabled = !state.open; });
  const btn = $("#toggle-open");
  if (btn) btn.textContent = state.open ? "댓글 막기" : "댓글 다시 열기";
}

/* ---------- 시작 ---------- */
async function start() {
  const cfg = (window.CAMPAIGN_CONFIG || {}).firebase || {};
  if (cfg.apiKey) {
    store = new FirebaseStore(cfg);
    try { await store.init(); }
    catch (err) {
      console.error(err);
      store = new LocalStore(); await store.init();
      $("#demo-banner").textContent = "저장 연결에 실패해서 시험 모드로 열렸어요. 댓글이 이 기기에만 저장돼요.";
      $("#demo-banner").hidden = false;
    }
  } else {
    store = new LocalStore(); await store.init();
    $("#demo-banner").hidden = false;
  }

  $$(".my-nick").forEach(n => { n.textContent = myNick(); });
  bindChoices("#first-choices", "first");
  bindChoices("#second-choices", "second");
  bindSpread();
  updateGates();

  store.onSettings(applySettings);
  store.onComments(list => { state.comments = list; renderComments(); renderCommentStats(); });
  store.onChecks(renderChecks);
  store.onResponses(list => { renderResults(list); renderSpread(list); });
  setupAdmin();

  $("#comment-form").addEventListener("submit", async e => {
    e.preventDefault();
    const ta = $("#comment-text");
    if (await submitComment(ta.value, null, $("#comment-msg"))) ta.value = "";
  });
  $("#check-form").addEventListener("submit", async e => {
    e.preventDefault();
    const ta = $("#check-text"), msg = $("#check-msg");
    if (!state.open) { msg.textContent = "지금은 쓸 수 없어요."; return; }
    const problem = checkText(ta.value);
    if (problem) { msg.textContent = problem; return; }
    try { await store.addCheck({ text: ta.value.trim(), nick: myNick() }); ta.value = ""; msg.textContent = ""; }
    catch (err) { msg.textContent = "붙이지 못했어요. 잠시 후 다시 시도해 주세요."; console.error(err); }
  });
  $$(".tab").forEach(t => t.addEventListener("click", () => {
    state.sort = t.dataset.sort;
    $$(".tab").forEach(x => x.classList.toggle("on", x === t));
    renderComments();
  }));

  $("#go-context").addEventListener("click", () => {
    state.revealed = true; local.set("revealed", true);
    go(2);
  });
  $("#go-again").addEventListener("click", () => {
    $("#mine-choice").textContent = state.first ? LABELS[state.first] : "-";
    $("#mine-comment").textContent = state.firstComment || "댓글을 쓰지 않았어요";
    go(3);
  });
  $("#go-result").addEventListener("click", () => go(4));
  $("#go-back-post").addEventListener("click", () => go(1));
}

start();
