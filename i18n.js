// 공유하기 전에 3초 — 언어 바꾸기(한국어, English, 中文, 日本語)와 댓글 번역
(function () {
  var LANGS = ["ko", "en", "zh", "ja"];
  // 화면 문구. 한국어 원문은 index.html에 그대로 있고, 아래 ko 값은 app.js가 쓰는 문구예요.
  var D = {
    title: { en: "3 Seconds Before You Share", zh: "分享之前，先想3秒", ja: "シェアする前に3秒" },
    intro_tap: {
      en: '<span class="intro-play">▶</span><b>Tap to start</b><small>Sound on (the video is in Korean)</small>',
      zh: '<span class="intro-play">▶</span><b>点击屏幕开始</b><small>会有声音（视频为韩语）</small>',
      ja: '<span class="intro-play">▶</span><b>画面をタップして開始</b><small>音が出ます（動画は韓国語です）</small>'
    },
    intro_sound_on: { ko: "🔇 소리 켜기", en: "🔇 Sound on", zh: "🔇 打开声音", ja: "🔇 音を出す" },
    intro_mute: { ko: "🔊 음소거", en: "🔊 Mute", zh: "🔊 静音", ja: "🔊 ミュート" },
    intro_skip: { en: "Skip ›", zh: "跳过 ›", ja: "スキップ ›" },
    demo_banner: { en: "Test mode. Comments are saved only on this device.", zh: "测试模式：评论只保存在这台设备上。", ja: "テストモードです。コメントはこの端末にだけ保存されます。" },
    closed_banner: { en: "The campaign has ended, so comments are closed.", zh: "活动已结束，现在无法发表评论。", ja: "キャンペーンが終了したため、今はコメントできません。" },
    eyebrow: { en: "Hyper-connected Society Campaign · “Statement of Sponsorship”", zh: "超连接社会宣传活动 · 《资助明细》", ja: "超連結社会キャンペーン · 『後援明細書』" },
    h1: { en: "3 Seconds Before You Share", zh: "分享之前，先想3秒", ja: "シェアする前に3秒" },
    lead: { en: "Read a post, react to it, and then check the whole story.", zh: "先读一篇帖子并做出反应，然后再了解完整的故事。", ja: "ひとつの投稿を読んで反応し、そのあとで全体の話を確かめてみましょう。" },
    intro_replay: { en: "▶ Watch the intro video again", zh: "▶ 再看一遍介绍视频", ja: "▶ 紹介動画をもう一度見る" },
    booth_start: {
      en: 'Before you start, please put a <b class="red">red sticker</b> on the sticker board (5-point scale) at the booth.',
      zh: '开始之前，请先在展位的贴纸板（5分量表）上贴一张<b class="red">红色贴纸</b>。',
      ja: 'はじめる前に、ブースのシールボード（5段階）に<b class="red">赤いシール</b>を貼ってください。'
    },
    step1: { en: "<span>1</span>Read", zh: "<span>1</span>阅读", ja: "<span>1</span>読む" },
    step2: { en: "<span>2</span>Context", zh: "<span>2</span>看背景", ja: "<span>2</span>背景" },
    step3: { en: "<span>3</span>Look back", zh: "<span>3</span>回顾", ja: "<span>3</span>振り返り" },
    step4: { en: "<span>4</span>Results", zh: "<span>4</span>结果", ja: "<span>4</span>結果" },
    note_source: {
      en: "This post is rewritten from a post in the short story “Statement of Sponsorship” by Oh Sun-young.",
      zh: "这篇帖子是根据吴善英小说《资助明细》里的帖子内容改写的。",
      ja: "オ・ソニョンの小説『後援明細書』に出てくる投稿をもとに書き直した文章です。"
    },
    post_board: {
      en: 'Community &gt; Daily Life <span class="badge">#1 Most Viewed</span>',
      zh: '社区 &gt; 生活杂谈 <span class="badge">浏览量第一</span>',
      ja: 'コミュニティ &gt; 日常の話 <span class="badge">閲覧数1位</span>'
    },
    post_title: { en: "I sponsored a child for 5 years and got treated like an ATM", zh: "被我资助了5年的孩子当成了俗物", ja: "5年間支援してきた子どもに俗物扱いされました" },
    post_meta: {
      en: "<span>Anonymous</span><span>Views 148,203</span><span>Likes 3,917</span>",
      zh: "<span>匿名</span><span>浏览 148,203</span><span>推荐 3,917</span>",
      ja: "<span>匿名</span><span>閲覧 148,203</span><span>おすすめ 3,917</span>"
    },
    post_p1: {
      en: "I'm an ordinary office worker in my mid-30s. I've been sponsoring a child for five years. It started at 30,000 won a month, and this year I raised it to 50,000 won.",
      zh: "我是一个三十多岁的普通上班族，资助一个孩子已经5年了。一开始每月3万韩元，今年起涨到了5万韩元。",
      ja: "30代半ばの平凡な会社員です。5年間、ある子どもを支援しています。最初は月3万ウォンで、今年からは5万ウォンに増やしました。"
    },
    post_p2: {
      en: "I wanted to help quietly, like Daddy-Long-Legs, so I never contacted the child directly.",
      zh: "我想像“长腿叔叔”那样默默帮助，所以从没单独联系过孩子。",
      ja: "あしながおじさんのように静かに助けたくて、子どもには直接連絡もしませんでした。"
    },
    post_p3: {
      en: "Ahead of Children's Day this year, I wanted to give a present for the first time, so I asked what the child wanted. The answer: limited-edition red World Cup Nike sneakers. Shoes that cost over 300,000 won.",
      zh: "今年儿童节前，我第一次想送礼物，就问孩子想要什么。得到的回答是世界杯限量版红色耐克运动鞋，一双超过30万韩元的鞋。",
      ja: "今年のこどもの日を前に、初めてプレゼントをしたくて欲しいものを聞きました。返ってきた答えはワールドカップ限定版の赤いナイキのスニーカー。30万ウォンを超える靴でした。"
    },
    post_p4: {
      en: "I was shocked that a child on basic welfare even knew the name of shoes like that, so I checked again with the caseworker. The caseworker said that's really what the child wants, and that I don't have to give a present.",
      zh: "我很惊讶，一个领取最低生活保障的孩子怎么会知道这种鞋的名字，就又向负责人确认了一遍。负责人说那确实是孩子想要的，还说不送礼物也可以。",
      ja: "生活保護を受けている子がどうしてこんな靴の名前を知っているのか驚いて、担当者にもう一度確認しました。担当者は、子どもが欲しがっているのは確かにそれだと言い、プレゼントはしなくても大丈夫だと言いました。"
    },
    post_p5: {
      en: "Is this how you treat someone who faithfully sponsored you for five years, like an ATM?",
      zh: "对一个5年来按时资助的人，就这样当成俗物吗？",
      ja: "5年間欠かさず支援してきた人を、こんなふうに俗物扱いするんですか？"
    },
    q_now: { en: "Having read this post, what would you do?", zh: "看完这篇帖子，换作是你会怎么做？", ja: "この投稿を読んだ今、あなたならどうする？" },
    ch_share: { ko: "공유한다", en: "Share it", zh: "分享", ja: "シェアする" },
    ch_comment: { ko: "댓글만 단다", en: "Just comment", zh: "只评论", ja: "コメントだけする" },
    ch_pass: { ko: "그냥 넘긴다", en: "Scroll past", zh: "直接划过", ja: "そのまま流す" },
    ch_check: { ko: "사실을 더 확인한다", en: "Check the facts first", zh: "先核实事实", ja: "事実をもっと確かめる" },
    q_where: { en: "Where would you have sent this post?", zh: "换作是你，会把这篇帖子转发到哪里？", ja: "あなたならこの投稿をどこに送った？" },
    where_sub: {
      en: "You can pick more than one. Pick, then tap 'Add to map' to see a spread map built from everyone's choices.",
      zh: "可以多选。选好后点“连到地图上”，就会出现汇集所有人选择的传播地图。",
      ja: "いくつ選んでもOKです。選んで「マップにつなぐ」を押すと、みんなの選択が集まった拡散マップが出てきます。"
    },
    sp_group: { en: "Group chat", zh: "群聊", ja: "グループチャット" },
    sp_story: { en: "Instagram Story", zh: "Instagram快拍", ja: "インスタのストーリー" },
    sp_community: { en: "Community board", zh: "社区论坛", ja: "コミュニティ掲示板" },
    sp_blog: { en: "Blog", zh: "博客", ja: "ブログ" },
    sp_dm: { en: "1:1 to a friend", zh: "私信给朋友", ja: "友だちに1対1で" },
    sp_none: { en: "Not sending it", zh: "不转发", ja: "送らない" },
    sps_group: { ko: "단톡방", en: "Group chat", zh: "群聊", ja: "グループ" },
    sps_story: { ko: "인스타 스토리", en: "IG Story", zh: "快拍", ja: "ストーリー" },
    sps_community: { ko: "커뮤니티", en: "Community", zh: "社区", ja: "掲示板" },
    sps_blog: { ko: "블로그", en: "Blog", zh: "博客", ja: "ブログ" },
    sps_dm: { ko: "친구 1:1", en: "1:1 DM", zh: "私信", ja: "個別" },
    spread_save: { ko: "지도에 잇기", en: "Add to map", zh: "连到地图上", ja: "マップにつなぐ" },
    spread_saved: { ko: "이었어요", en: "Added", zh: "已连接", ja: "つなぎました" },
    comments: { en: "Comments", zh: "评论", ja: "コメント" },
    comment_ph: { en: "Leave a line about what this post made you think", zh: "留下一句你看完这篇帖子后的想法", ja: "この投稿を読んで思ったことをひとこと残してください" },
    nick: { en: "Nickname", zh: "昵称", ja: "ニックネーム" },
    submit: { ko: "등록", en: "Post", zh: "发布", ja: "投稿" },
    tab_best: { en: "Best", zh: "热门", ja: "ベスト" },
    tab_new: { en: "Latest", zh: "最新", ja: "新着" },
    go_context: { en: "See the full context", zh: "查看完整背景", ja: "全体の背景を見る" },
    go_hint: { en: "Pick 'What would you do?' and add your choice to the spread map", zh: "请先选择“换作是你”，再连到传播地图上", ja: "「あなたなら？」を選んで、拡散マップにつないでください" },
    step2_title: { en: "The story the post left out", zh: "帖子里没有的故事", ja: "投稿に書かれていなかった話" },
    step2_sub: { en: "These are scenes from the story “Statement of Sponsorship” that were outside the post.", zh: "这些是小说《资助明细》中帖子之外的场景。", ja: "小説『後援明細書』で、投稿の外にあった場面です。" },
    rv1_tag: { en: "Who brought up the present first", zh: "是谁先提起礼物的", ja: "プレゼントの話を先に出したのは誰か" },
    rv1_p: { en: "It was the sponsor who asked the child to name a present. Later the child says:", zh: "让孩子说出想要什么礼物的是资助人。孩子后来这样说：", ja: "欲しいプレゼントを言ってみてと言ったのは支援者でした。子どもはあとでこう言います。" },
    rv1_q: { en: "“They told me to say what I really needed, so I did.”", zh: "“是让我说真正需要的东西，我才说的。”", ja: "「本当に必要なものを言ってって言われたから言ったのに。」" },
    rv2_tag: { en: "What the sponsor had been demanding", zh: "资助人之前提过的要求", ja: "支援者がこれまで求めてきたこと" },
    rv2_p: {
      en: "According to the caseworker, this sponsor had long been demanding that the child be sent to a charity party, that the child's underwear size be shared, and that a spending statement be faxed over.",
      zh: "据负责人说，这位资助人之前就一直要求让孩子去参加慈善派对、告诉他孩子内衣的尺码、把支出明细用传真发给他。",
      ja: "担当者によると、この支援者は以前から、子どもをチャリティーパーティーに参加させてほしい、子どもの下着のサイズを教えてほしい、支出明細書をファックスで送ってほしいと求めてきました。"
    },
    rv3_tag: { en: "The caseworker", zh: "负责人", ja: "担当者" },
    rv3_p: { en: "The caseworker, six months into the job, simply passed on what the child wanted.", zh: "入职6个月的负责人只是把孩子想要的东西如实转达而已。", ja: "入社6か月目の担当者は、子どもが欲しいものをそのまま伝えただけでした。" },
    rv3_q: { en: "“I wanted to give the kid something they'd like.”", zh: "“我只是想送孩子喜欢的东西。”", ja: "「子どもが好きなものをあげたかったんです。」" },
    rv4_tag: { en: "After the post spread", zh: "帖子传开之后", ja: "投稿が広まったあと" },
    rv4_p: {
      en: "The post hit #1 in views and spread to online cafés, blogs, and social media. The foundation's website crashed under the traffic, and comments split between attacking the child and blaming the caseworker. The sponsor later deleted the original post.",
      zh: "帖子登上浏览量第一，并传到网络社群、博客和社交媒体。基金会官网因访问量过大而瘫痪，评论分成了骂孩子和怪负责人的两派。资助人后来删掉了原帖。",
      ja: "投稿は閲覧数1位になり、ネットのコミュニティ、ブログ、SNSへと広まります。財団のホームページはアクセスが集中して麻痺し、コメントは子どもを責める側と担当者を責める側に分かれます。支援者はのちに元の投稿を消しました。"
    },
    rv5_tag: { en: "The child", zh: "那个孩子", ja: "その子は" },
    rv5_p: {
      en: "The child already knew about the post and every comment. In the end, the child took the part-time wages they had been saving to fix grandma's wheelchair, worked even more shifts, and bought those sneakers with their own money.",
      zh: "孩子早就知道了那篇帖子和所有评论。最后，孩子在为修奶奶轮椅而攒的打工钱之外又多打了一份工，用自己的钱买下了那双运动鞋。",
      ja: "子どもは投稿もコメントもすでに全部知っていました。結局、おばあさんの車椅子の修理代のために貯めていたアルバイト代に、さらにアルバイトを増やして、そのスニーカーを自分のお金で買いました。"
    },
    real_label: { en: "It doesn't only happen in fiction", zh: "这不只是小说里的事", ja: "小説の中だけの話ではありません" },
    real_h3: { en: "The 2017 post about “a sponsored child who demanded a 200,000-won jacket”", zh: "2017年“要求20万韩元外套的受资助儿童”一文", ja: "2017年「20万ウォンのジャンパーを求めた支援児童」の投稿" },
    real_p: {
      en: "In December 2017, a sponsor posted on an online board that “a sponsored child demanded a 200,000-won jacket.” The sponsor deleted it about a day later, but it had already spread to other online communities. Here is what the foundation said in its official statement.",
      zh: "2017年12月，一位资助人在网络论坛上发帖说“受资助儿童要求一件20万韩元的外套”。资助人大约一天后删除了帖子，但帖子早已传到其他社群和论坛。基金会在声明中说明了以下内容。",
      ja: "2017年12月、ある支援者が「支援児童が20万ウォンのジャンパーを求めてきた」という投稿をネット掲示板に載せました。支援者は1日ほどで投稿を消しましたが、すでに別のコミュニティへ広まったあとでした。財団が声明で明らかにした内容は次のとおりです。"
    },
    real_li1: {
      en: "The sponsor's letter said, “If there's nothing special you want, I'm thinking of sending one of those long padded jackets that are popular these days. Is that okay?” It was the sponsor who first brought up the long padded jacket.",
      zh: "资助人寄来的信里写着：“如果没有特别想要的，我打算送你一件最近流行的长款羽绒服，可以吗？”最先提起长款羽绒服的是资助人。",
      ja: "支援者からの手紙には「特に欲しいものがなければ、最近流行りのロングダウンを送ろうと思うけど、いいかな？」と書かれていました。ロングダウンの話を先に出したのは支援者でした。"
    },
    real_li2: { en: "The child asked friends which brands were popular and picked a product without knowing there was a price limit.", zh: "孩子向朋友打听了最近流行的品牌，在不知道有金额限制的情况下选了商品。", ja: "子どもは友だちに今流行っているブランドを聞き、金額の上限を知らないまま商品を選びました。" },
    real_li3: { en: "The foundation said passing on the brand name without filtering it was a work mistake.", zh: "基金会表示，没有过滤品牌名称就直接转达是工作上的失误。", ja: "財団は、ブランド名を確認せずにそのまま伝えたのは業務上のミスだったと明らかにしました。" },
    real_li4: { en: "The original post showed the child's real name, raising concerns about exposure of the child's personal information and a violation of the child's rights.", zh: "最初的帖子里直接露出了孩子的真实姓名，令人担心孩子的个人信息外泄和人权受到侵害。", ja: "最初の投稿には子どもの実名がそのまま見えていて、子どもの個人情報の流出と人権侵害が心配される状況でした。" },
    source: {
      en: "Source: ChildFund Korea (초록우산어린이재단), statement “20만원짜리 점퍼를 요구한 후원아동 - 해당 글 관련한 본 단체의 입장문입니다”, Dec. 11, 2017.",
      zh: "出处：绿伞儿童财团（초록우산어린이재단）声明《20만원짜리 점퍼를 요구한 후원아동 - 해당 글 관련한 본 단체의 입장문입니다》，2017.12.11。",
      ja: "出典：緑の傘子ども財団（초록우산어린이재단）の声明「20만원짜리 점퍼를 요구한 후원아동 - 해당 글 관련한 본 단체의 입장문입니다」、2017.12.11。"
    },
    go_again: { en: "Look back at my first reaction", zh: "回看我最初的反应", ja: "最初の自分の反応をもう一度見る" },
    step3_title: { en: "Looking back at my first self", zh: "回看最初的自己", ja: "最初の自分を振り返る" },
    mine_choice_label: { en: "My first reaction", zh: "最初选择的反应", ja: "最初に選んだ反応" },
    mine_comment_label: { en: "My first comment", zh: "最初写的评论", ja: "最初に書いたコメント" },
    mine_none: { ko: "댓글을 쓰지 않았어요", en: "You didn't write a comment", zh: "没有写评论", ja: "コメントは書きませんでした" },
    after_h3: { en: "Now that you know the whole story, what would you comment?", zh: "了解完整故事后，如果重新写评论呢？", ja: "全体の話を知った今、もう一度コメントするなら？" },
    after_sub: { en: "Comments from people who have seen the context are collected in the list below, separate from the comments in step 1.", zh: "看过背景的人写的评论会和第1步的帖子评论分开，集中在下面的列表里。", ja: "背景を見た人のコメントは、ステップ1の投稿コメントとは別に、下のリストに集まります。" },
    after_list_h: { en: "Comments after context", zh: "看过背景后的评论", ja: "背景を見たあとのコメント" },
    no_after_comments: { ko: "아직 맥락 본 후 댓글이 없어요. 첫 댓글을 남겨 보세요.", en: "No after-context comments yet. Be the first.", zh: "还没有看过背景后的评论，来写第一条吧。", ja: "背景を見たあとのコメントはまだありません。最初のコメントを残してみましょう。" },
    after_ph: { en: "If your thoughts changed since your first comment, share what you think now", zh: "如果想法和最初的评论不同了，请留下你现在的想法", ja: "最初のコメントと考えが変わったなら、今の考えを残してください" },
    after_mine_label: { en: "My comment after the context", zh: "看过背景后写的评论", ja: "背景を見たあとに書いたコメント" },
    q_again: { en: "Now that you know the whole story, what would you choose?", zh: "了解完整故事后，再选一次会怎样？", ja: "全体の話を知った今、もう一度選ぶなら？" },
    check_h3: { en: "One thing to check before sharing", zh: "分享之前要确认的一件事", ja: "シェアする前に確かめること、ひとつ" },
    check_sub: { en: "A note you leave for others.", zh: "这是留给其他人的便签。", ja: "ほかの人に残すメモです。" },
    check_ph: { en: "e.g., Is there another side to the story besides the writer's?", zh: "例：除了发帖人，另一方有没有别的说法", ja: "例：書いた人以外の、もう一方の話もあるか" },
    attach: { en: "Post it", zh: "贴上", ja: "貼る" },
    go_result: { en: "See results", zh: "查看结果", ja: "結果を見る" },
    result_hint: { en: "Please pick 'What would you choose?'", zh: "请先选择“再选一次”", ja: "「もう一度選ぶなら？」を選んでください" },
    step4_title: { en: "Here's how our reactions changed", zh: "我们的反应是这样变化的", ja: "わたしたちの反応はこう変わりました" },
    lg_before: { en: "Before context", zh: "看背景前", ja: "背景を見る前" },
    lg_after: { en: "After context", zh: "看过背景后", ja: "背景を見たあと" },
    map_h3: { en: "The spread map we all made", zh: "大家一起画出的传播地图", ja: "みんなで作った拡散マップ" },
    change_h3: { en: "Change seen in comments", zh: "从评论看到的变化", ja: "コメントで見る変化" },
    stat_before: { en: "Comments before context", zh: "看背景前的评论", ja: "背景を見る前のコメント" },
    stat_after: { en: "Comments after context", zh: "看过背景后的评论", ja: "背景を見たあとのコメント" },
    booth_h3: { en: "Last step, at the booth", zh: "最后，在展位上", ja: "最後に、ブースで" },
    booth_p1: {
      en: '1. Put a <b class="blue">blue sticker</b> on the same sticker board this time.',
      zh: '1. 这次请在同一块贴纸板上贴一张<b class="blue">蓝色贴纸</b>。',
      ja: '1. 同じシールボードに、今度は<b class="blue">青いシール</b>を貼ってください。'
    },
    booth_p2: { en: "2. Show this results screen to get a snack.", zh: "2. 出示这个结果页面就能领取零食。", ja: "2. この結果画面を見せるとお菓子がもらえます。" },
    closing_p1: {
      en: "In a hyper-connected society, a single post can reach countless people in a day. Even if the writer deletes it, the shared post and comments remain, and the child whose name was exposed is the first to bear the weight.",
      zh: "在超连接社会里，一篇帖子一天之内就能传到无数人面前。即使发帖人删了帖，已经传开的帖子和评论依然存在，而最先承受这份重量的，是名字被曝光的孩子。",
      ja: "超連結社会では、ひとつの投稿が1日で数えきれない人に届きます。書いた人が投稿を消しても、すでに広まった投稿とコメントは残り、その重さを真っ先に受けるのは名前が出てしまった子どもです。"
    },
    closing_p2: {
      en: "<b>3 seconds before you share.</b> Take a moment to think: is anything missing from this post, and who will it reach?",
      zh: "<b>分享之前，先想3秒。</b>请想一想：这篇帖子是否漏掉了什么，它又会传到谁那里。",
      ja: "<b>シェアする前に3秒。</b>この投稿に抜けている話はないか、この投稿が誰に届くのか、一度だけ考えてみてください。"
    },
    go_back_post: { en: "See the post and comments again", zh: "再看一遍帖子和评论", ja: "投稿とコメントをもう一度見る" },
    foot_source: { en: "Oh Sun-young, “Statement of Sponsorship” · ChildFund Korea statement (Dec. 11, 2017)", zh: "吴善英《资助明细》 · 绿伞儿童财团声明（2017.12.11）", ja: "オ・ソニョン『後援明細書』 · 緑の傘子ども財団の声明（2017.12.11）" },
    foot_privacy: { en: "Please don't write personal information (name, school, contact).", zh: "请不要填写个人信息（姓名、学校、联系方式）。", ja: "個人情報（名前、学校、連絡先）は書かないでください。" },

    // app.js가 쓰는 문구
    just_now: { ko: "방금", en: "just now", zh: "刚刚", ja: "たった今" },
    min_ago: { ko: "{n}분 전", en: "{n}m ago", zh: "{n}分钟前", ja: "{n}分前" },
    hr_ago: { ko: "{n}시간 전", en: "{n}h ago", zh: "{n}小时前", ja: "{n}時間前" },
    day_ago: { ko: "{n}일 전", en: "{n}d ago", zh: "{n}天前", ja: "{n}日前" },
    err_empty: { ko: "내용을 써 주세요.", en: "Please write something.", zh: "请填写内容。", ja: "内容を書いてください。" },
    err_bad: { ko: "욕설이 들어간 글은 올릴 수 없어요.", en: "Posts with profanity can't be uploaded.", zh: "含有脏话的内容无法发布。", ja: "悪口が入った文章は投稿できません。" },
    err_phone: { ko: "전화번호 같은 개인정보는 쓸 수 없어요.", en: "You can't write personal info like phone numbers.", zh: "不能填写电话号码等个人信息。", ja: "電話番号などの個人情報は書けません。" },
    err_conn: { ko: "저장 연결에 문제가 생겼어요. 잠시 후 새로고침해 주세요.", en: "There's a connection problem. Please refresh in a moment.", zh: "连接出现问题，请稍后刷新。", ja: "接続に問題が起きました。しばらくしてから再読み込みしてください。" },
    err_closed: { ko: "지금은 댓글을 쓸 수 없어요.", en: "Comments are closed right now.", zh: "现在无法发表评论。", ja: "今はコメントできません。" },
    err_wait: { ko: "조금 뒤에 다시 써 주세요.", en: "Please wait a moment before posting again.", zh: "请稍后再发。", ja: "少し待ってからもう一度書いてください。" },
    err_post: { ko: "등록하지 못했어요. 잠시 후 다시 시도해 주세요.", en: "Couldn't post. Please try again shortly.", zh: "发布失败，请稍后再试。", ja: "投稿できませんでした。しばらくしてからもう一度お試しください。" },
    anon: { ko: "익명", en: "Anonymous", zh: "匿名", ja: "匿名" },
    anon_nick: { ko: "익명{n}", en: "Anon{n}", zh: "匿名{n}", ja: "匿名{n}" },
    ph_before: { ko: "맥락 보기 전", en: "Before context", zh: "看背景前", ja: "背景を見る前" },
    ph_after: { ko: "맥락 본 후", en: "After context", zh: "看过背景后", ja: "背景を見たあと" },
    like: { ko: "추천 {n}", en: "Like {n}", zh: "推荐 {n}", ja: "高評価 {n}" },
    dislike: { ko: "비추천 {n}", en: "Dislike {n}", zh: "不推荐 {n}", ja: "低評価 {n}" },
    reply: { ko: "답글", en: "Reply", zh: "回复", ja: "返信" },
    reply_ph: { ko: "답글을 남겨 주세요", en: "Write a reply", zh: "写下回复", ja: "返信を書いてください" },
    nick_label: { ko: "닉네임 {n}", en: "Nickname {n}", zh: "昵称 {n}", ja: "ニックネーム {n}" },
    no_comments: { ko: "아직 댓글이 없어요. 첫 댓글을 남겨 보세요.", en: "No comments yet. Be the first to comment.", zh: "还没有评论，来写第一条吧。", ja: "まだコメントがありません。最初のコメントを残してみましょう。" },
    spread_closed: { ko: "지금은 참여할 수 없어요.", en: "You can't take part right now.", zh: "现在无法参与。", ja: "今は参加できません。" },
    spread_fail: { ko: "잇지 못했어요. 다시 눌러 주세요.", en: "Couldn't add it. Please tap again.", zh: "连接失败，请再点一次。", ja: "つなげませんでした。もう一度押してください。" },
    svg_center: { ko: "글 하나", en: "One post", zh: "一篇帖子", ja: "投稿ひとつ" },
    people_n: { ko: "{n}명", en: "{n}", zh: "{n}人", ja: "{n}人" },
    map_aria: { ko: "확산 지도", en: "Spread map", zh: "传播地图", ja: "拡散マップ" },
    spread_total: { ko: "지금까지 {p}명이 이 글을 {l}곳으로 보냈어요.", en: "So far {p} {p|person has|people have} sent this post to {l} {l|place|places}.", zh: "到目前为止，{p}人把这篇帖子转发到了{l}个地方。", ja: "これまでに{p}人がこの投稿を{l}か所に送りました。" },
    spread_none_part: { ko: " 안 보낸다는 {n}명이에요.", en: " {n} chose not to send it.", zh: " 选择不转发的有{n}人。", ja: " 送らないと答えた人は{n}人です。" },
    spread_empty: { ko: "아직 아무도 잇지 않았어요.", en: "No one has added to the map yet.", zh: "还没有人连到地图上。", ja: "まだ誰もつないでいません。" },
    result_total: { ko: "지금까지 {n}명이 참여했어요.", en: "{n} {n|person has|people have} taken part so far.", zh: "到目前为止已有{n}人参与。", ja: "これまでに{n}人が参加しました。" },
    result_empty: { ko: "아직 참여한 사람이 없어요.", en: "No one has taken part yet.", zh: "还没有人参与。", ja: "まだ参加した人はいません。" },
    bar_title: { ko: "{n}명, {p}%", en: "{n} {n|person|people}, {p}%", zh: "{n}人，{p}%", ja: "{n}人、{p}%" },
    after_ok: { ko: "등록했어요. 아래 맥락 본 후 댓글 목록에 올라갔어요.", en: "Posted! It's now in the after-context comments below.", zh: "已发布，已出现在下面的“看过背景后的评论”里。", ja: "投稿しました。下の「背景を見たあとのコメント」に載りました。" },
    check_closed: { ko: "지금은 쓸 수 없어요.", en: "You can't write right now.", zh: "现在无法填写。", ja: "今は書けません。" },
    check_fail: { ko: "붙이지 못했어요. 잠시 후 다시 시도해 주세요.", en: "Couldn't post the note. Please try again shortly.", zh: "便签贴上失败，请稍后再试。", ja: "貼れませんでした。しばらくしてからもう一度お試しください。" },
    demo_fail: { ko: "저장 연결에 실패해서 시험 모드로 열렸어요. 댓글이 이 기기에만 저장돼요.", en: "Couldn't connect to storage, so this opened in test mode. Comments are saved only on this device.", zh: "存储连接失败，已以测试模式打开。评论只保存在这台设备上。", ja: "保存先に接続できなかったため、テストモードで開きました。コメントはこの端末にだけ保存されます。" },
    translate: { ko: "번역하기", en: "Translate", zh: "翻译", ja: "翻訳する" },
    show_original: { ko: "원문 보기", en: "Show original", zh: "查看原文", ja: "原文を見る" },
    translating: { ko: "번역 중...", en: "Translating...", zh: "翻译中...", ja: "翻訳中..." },
    translate_fail: { ko: "번역하지 못했어요. 다시 눌러 주세요.", en: "Couldn't translate. Tap again.", zh: "翻译失败，请再点一次。", ja: "翻訳できませんでした。もう一度押してください。" },
    auto_translated: { ko: "자동 번역", en: "Auto-translated", zh: "自动翻译", ja: "自動翻訳" }
  };

  function initialLang() {
    try { var s = localStorage.getItem("c3_lang"); if (s) { s = JSON.parse(s); if (LANGS.indexOf(s) >= 0) return s; } } catch (e) {}
    var n = ((navigator.languages && navigator.languages[0]) || navigator.language || "ko").toLowerCase().slice(0, 2);
    return LANGS.indexOf(n) >= 0 ? n : "ko";
  }

  var I = {
    langs: LANGS,
    lang: initialLang(),
    t: function (key, vars) {
      var e = D[key], s = e ? (e[I.lang] || e.ko) : null;
      if (s == null) return key;
      if (vars) {
        // 영어 단수, 복수: {n|person|people}
        s = s.replace(/\{(\w+)\|([^|}]*)\|([^}]*)\}/g, function (m, v, one, many) { return Number(vars[v]) === 1 ? one : many; });
        for (var k in vars) s = s.split("{" + k + "}").join(vars[k]);
      }
      return s;
    },
    // data-i18n="키" 붙은 곳의 글을 바꿈. 한국어 원문은 처음 한 번 저장해 뒀다가 돌려놓음
    apply: function () {
      var nodes = document.querySelectorAll("[data-i18n]");
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i], key = n.getAttribute("data-i18n");
        if (n.__ko === undefined) n.__ko = n.innerHTML;
        var e = D[key];
        n.innerHTML = I.lang === "ko" || !e || !e[I.lang] ? n.__ko : e[I.lang];
      }
      var ph = document.querySelectorAll("[data-i18n-ph]");
      for (var j = 0; j < ph.length; j++) {
        var p = ph[j], pk = p.getAttribute("data-i18n-ph");
        if (p.__koPh === undefined) p.__koPh = p.getAttribute("placeholder") || "";
        var pe = D[pk];
        p.setAttribute("placeholder", I.lang === "ko" || !pe || !pe[I.lang] ? p.__koPh : pe[I.lang]);
      }
      if (I.__koTitle === undefined) I.__koTitle = document.title;
      document.title = I.lang === "ko" ? I.__koTitle : D.title[I.lang];
      document.documentElement.lang = I.lang === "zh" ? "zh-Hans" : I.lang;
      var bs = document.querySelectorAll(".lang button[data-lang]");
      for (var b = 0; b < bs.length; b++) {
        var on = bs[b].getAttribute("data-lang") === I.lang;
        bs[b].classList.toggle("on", on);
        bs[b].setAttribute("aria-pressed", on ? "true" : "false");
      }
    },
    set: function (lang) {
      if (LANGS.indexOf(lang) < 0 || lang === I.lang) return;
      I.lang = lang;
      try { localStorage.setItem("c3_lang", JSON.stringify(lang)); } catch (e) {}
      I.apply();
      window.dispatchEvent(new CustomEvent("langchange", { detail: lang }));
    },
    // 글의 언어 짐작(글자 종류로)
    detect: function (text) {
      var t = String(text || ""), ko = 0, kana = 0, han = 0, lat = 0;
      for (var i = 0; i < t.length; i++) {
        var c = t.charCodeAt(i);
        if ((c >= 0xAC00 && c <= 0xD7A3) || (c >= 0x3131 && c <= 0x318E)) ko++;
        else if (c >= 0x3040 && c <= 0x30FF) kana++;
        else if (c >= 0x4E00 && c <= 0x9FFF) han++;
        else if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) lat++;
      }
      if (ko && ko >= kana && ko >= han) return "ko";
      if (kana) return "ja";
      if (han) return "zh";
      if (lat >= 2) return "en";
      return null;
    },
    // 자동 번역. 구글 번역 공개 주소를 먼저 쓰고, 안 되면 MyMemory로
    _cache: {},
    translate: function (text, target, source) {
      var key = target + "|" + text;
      if (I._cache[key]) return Promise.resolve(I._cache[key]);
      var tl = target === "zh" ? "zh-CN" : target;
      var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=" + tl + "&dt=t&q=" + encodeURIComponent(text);
      return fetch(url).then(function (r) {
        if (!r.ok) throw new Error("gtx " + r.status);
        return r.json();
      }).then(function (j) {
        var out = (j && j[0] || []).map(function (x) { return x && x[0] ? x[0] : ""; }).join("");
        if (!out) throw new Error("empty");
        return out;
      }).catch(function () {
        var src = source === "zh" ? "zh-CN" : (source || "ko");
        var u2 = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(text) + "&langpair=" + src + "|" + tl;
        return fetch(u2).then(function (r) { return r.json(); }).then(function (j) {
          var out = j && j.responseData && j.responseData.translatedText;
          if (!out || j.responseStatus >= 400) throw new Error("mymemory");
          return out;
        });
      }).then(function (out) { I._cache[key] = out; return out; });
    }
  };
  window.I18N = I;
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".lang button[data-lang]");
    if (b) I.set(b.getAttribute("data-lang"));
  });
})();
