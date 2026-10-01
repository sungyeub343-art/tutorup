import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const siteUrl = "https://tutorup.kr";

const cities = [
  { slug: "jeju-si", name: "제주시", type: "시", summary: "제주시 전 지역", focus: "학교별 진도와 생활권을 반영한 꾸준한 내신 관리" },
  { slug: "seogwipo-si", name: "서귀포시", type: "시", summary: "서귀포시 전 지역", focus: "개념의 빈틈과 학습 습관을 함께 점검하는 밀착 수업" }
];

const regions = [
  { slug: "hallim", name: "한림읍", city: "제주시", type: "읍", nearby: "한림리·대림리·귀덕리", focus: "기초 개념과 학교 진도를 균형 있게 맞추는 학습" },
  { slug: "aewol", name: "애월읍", city: "제주시", type: "읍", nearby: "애월리·하귀리·고내리", focus: "학생의 생활 리듬에 맞춘 내신과 선행 관리" },
  { slug: "gujwa", name: "구좌읍", city: "제주시", type: "읍", nearby: "세화리·김녕리·월정리", focus: "개념 설명과 문제 적용을 차근히 연결하는 수업" },
  { slug: "jocheon", name: "조천읍", city: "제주시", type: "읍", nearby: "조천리·함덕리·신촌리", focus: "학교 시험 범위와 취약 단원을 함께 반영한 학습" },
  { slug: "hangyeong", name: "한경면", city: "제주시", type: "면", nearby: "고산리·저지리·신창리", focus: "학습 공백부터 확인하는 단계별 맞춤 수업" },
  { slug: "chuja", name: "추자면", city: "제주시", type: "면", nearby: "대서리·영흥리·묵리", focus: "온라인 수업도 고려한 안정적인 진도와 피드백" },
  { slug: "udo", name: "우도면", city: "제주시", type: "면", nearby: "연평리 일대", focus: "이동 여건과 학습 시간을 고려한 현실적인 수업 계획" },
  { slug: "ildo-1", name: "일도1동", city: "제주시", type: "동", nearby: "산지천·중앙로 인근", focus: "기본 개념과 풀이 습관을 함께 다지는 학습" },
  { slug: "ildo-2", name: "일도2동", city: "제주시", type: "동", nearby: "일도지구·신산로 인근", focus: "학교별 시험 일정에 맞춘 꼼꼼한 내신 대비" },
  { slug: "ido-1", name: "이도1동", city: "제주시", type: "동", nearby: "중앙로·광양 일대", focus: "현재 실력에서 시작하는 맞춤형 개념 수업" },
  { slug: "ido-2", name: "이도2동", city: "제주시", type: "동", nearby: "제주시청·아라초 인근", focus: "중등 내신부터 고등 선행까지 이어지는 학습 설계" },
  { slug: "samdo-1", name: "삼도1동", city: "제주시", type: "동", nearby: "서사로·오라로 인근", focus: "오답 원인을 찾고 반복 실수를 줄이는 수업" },
  { slug: "samdo-2", name: "삼도2동", city: "제주시", type: "동", nearby: "관덕정·탑동 인근", focus: "문제 해석과 풀이 과정을 연결하는 학습" },
  { slug: "yongdam-1", name: "용담1동", city: "제주시", type: "동", nearby: "용담로·서문시장 인근", focus: "취약 단원 진단부터 시작하는 개인별 수업" },
  { slug: "yongdam-2", name: "용담2동", city: "제주시", type: "동", nearby: "용두암·공항 인근", focus: "학생 일정에 맞춰 복습과 선행을 조율하는 학습" },
  { slug: "geonip", name: "건입동", city: "제주시", type: "동", nearby: "사라봉·제주항 인근", focus: "개념을 자신의 말로 설명하는 힘을 기르는 수업" },
  { slug: "hwabuk", name: "화북동", city: "제주시", type: "동", nearby: "화북주공·삼화지구 인근", focus: "학년별 필수 개념과 내신 문제를 연결하는 학습" },
  { slug: "samyang", name: "삼양동", city: "제주시", type: "동", nearby: "삼양해수욕장·삼화지구 인근", focus: "개인 진도에 맞춰 성취를 쌓는 꾸준한 관리" },
  { slug: "bonggae", name: "봉개동", city: "제주시", type: "동", nearby: "봉개초·명도암 일대", focus: "기초 연산과 문장제 이해를 함께 높이는 수업" },
  { slug: "ara", name: "아라동", city: "제주시", type: "동", nearby: "아라지구·제주대 인근", focus: "중고등 과정의 개념 연결과 자기주도 학습 관리" },
  { slug: "ora", name: "오라동", city: "제주시", type: "동", nearby: "오라초·연미마을 인근", focus: "학교 진도와 학생별 학습 속도를 맞추는 수업" },
  { slug: "yeon", name: "연동", city: "제주시", type: "동", nearby: "신제주·제원아파트 인근", focus: "시험 결과를 다음 계획으로 연결하는 내신 관리" },
  { slug: "nohyung", name: "노형동", city: "제주시", type: "동", nearby: "노형오거리·드림타워 인근", focus: "학생별 목표와 진도 차이를 반영한 맞춤 커리큘럼" },
  { slug: "oedo", name: "외도동", city: "제주시", type: "동", nearby: "외도부영·월대천 인근", focus: "기초부터 응용까지 빠짐없이 연결하는 학습" },
  { slug: "iho", name: "이호동", city: "제주시", type: "동", nearby: "이호테우해변·현사마을 인근", focus: "학습 습관과 취약 단원을 함께 관리하는 수업" },
  { slug: "dodu", name: "도두동", city: "제주시", type: "동", nearby: "도두봉·무지개해안도로 인근", focus: "학생의 일정과 목표에 맞춘 효율적인 진도 관리" },
  { slug: "daejeong", name: "대정읍", city: "서귀포시", type: "읍", nearby: "하모리·보성리·구억리", focus: "학교와 국제학교 학사 일정까지 고려한 맞춤 학습" },
  { slug: "namwon", name: "남원읍", city: "서귀포시", type: "읍", nearby: "남원리·위미리·태흥리", focus: "기초 개념부터 내신 응용까지 단계적으로 잇는 수업" },
  { slug: "seongsan", name: "성산읍", city: "서귀포시", type: "읍", nearby: "성산리·고성리·신산리", focus: "학습 공백을 줄이고 스스로 푸는 힘을 키우는 학습" },
  { slug: "andeok", name: "안덕면", city: "서귀포시", type: "면", nearby: "화순리·사계리·동광리", focus: "학교 진도와 개인별 취약점을 반영한 밀착 수업" },
  { slug: "pyoseon", name: "표선면", city: "서귀포시", type: "면", nearby: "표선리·성읍리·가시리", focus: "개념 이해와 정확한 풀이 습관을 만드는 학습" },
  { slug: "songsan", name: "송산동", city: "서귀포시", type: "동", nearby: "서귀포항·보목동 인근", focus: "현재 수준에 맞춘 복습과 선행의 균형" },
  { slug: "jeongbang", name: "정방동", city: "서귀포시", type: "동", nearby: "정방폭포·동명백화점 인근", focus: "문제의 조건을 읽고 풀이를 설명하는 훈련" },
  { slug: "jungang", name: "중앙동", city: "서귀포시", type: "동", nearby: "매일올레시장·중앙로 인근", focus: "반복 학습으로 개념과 계산력을 다지는 수업" },
  { slug: "cheonji", name: "천지동", city: "서귀포시", type: "동", nearby: "천지연폭포·서문로 인근", focus: "오답 기록을 다음 수업에 반영하는 꼼꼼한 관리" },
  { slug: "hyodon", name: "효돈동", city: "서귀포시", type: "동", nearby: "쇠소깍·신효동 인근", focus: "학생의 이해 속도에 맞춘 단계별 개념 수업" },
  { slug: "yeongcheon", name: "영천동", city: "서귀포시", type: "동", nearby: "토평동·상효동 일대", focus: "기본기를 단단히 하고 응용력을 확장하는 학습" },
  { slug: "donghong", name: "동홍동", city: "서귀포시", type: "동", nearby: "동홍주공·산지물 인근", focus: "학교 시험과 다음 학년 준비를 함께 설계하는 수업" },
  { slug: "seohong", name: "서홍동", city: "서귀포시", type: "동", nearby: "서홍로·솜반천 인근", focus: "취약 유형을 구분하고 같은 실수를 줄이는 학습" },
  { slug: "daeryun", name: "대륜동", city: "서귀포시", type: "동", nearby: "법환동·강정동 인근", focus: "중등 내신부터 고등 수능 기초까지 이어지는 관리" },
  { slug: "daecheon", name: "대천동", city: "서귀포시", type: "동", nearby: "강정지구·월평동 인근", focus: "개념과 문제 적용 사이의 간격을 줄이는 수업" },
  { slug: "jungmun", name: "중문동", city: "서귀포시", type: "동", nearby: "중문관광단지·회수동 인근", focus: "학교별 일정과 목표 성적에 맞춘 내신 학습" },
  { slug: "yerae", name: "예래동", city: "서귀포시", type: "동", nearby: "상예동·하예동·색달동", focus: "학생의 생활 패턴을 반영한 지속 가능한 학습 계획" }
];

const grades = [
  ["예비중1", "초등 수학의 연산과 문장제 빈틈을 확인하고 문자와 식, 기본 도형으로 이어지는 중학 수학의 첫 틀을 만듭니다."],
  ["예비중2", "일차방정식과 좌표, 기본 도형을 복습한 뒤 식의 계산과 연립방정식을 안정적으로 연결합니다."],
  ["예비중3", "함수·방정식·도형의 핵심을 정리하고 고등 수학의 바탕이 되는 식을 다루는 힘을 기릅니다."],
  ["예비고1", "중학 전 범위의 취약점을 진단하고 공통수학의 다항식, 방정식, 경우의 수를 체계적으로 시작합니다."],
  ["예비고2", "공통수학의 빈틈을 보완하고 학교 선택 과목과 진로에 맞춰 대수·미적분 학습 순서를 설계합니다."],
  ["예비고3", "수능 출제 단원별 개념과 기출을 연결하고 제한 시간 안에 점수를 만드는 실전 루틴을 다집니다."]
];

const gradeCards = grades.map(([name, text], index) => `<article class="grade-card"><span>0${index + 1}</span><h3>${name} 수학과외</h3><p>${text}</p></article>`).join("");
const areaPath = area => `/areas/${area.slug}/`;

function layout({ title, description, canonical, body }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "제주 수학과외",
    url: siteUrl,
    areaServed: "제주특별자치도",
    description
  };

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="naver-site-verification" content="044544c41c6aa3979986fd9912b17b85cd82adc5">
  <meta name="theme-color" content="#183c35">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="https://images.unsplash.com/photo-1535189043414-47a3c49a0bed?auto=format&fit=crop&w=1200&q=85">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=IBM+Plex+Sans+KR:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/style.css">
  <script type="application/ld+json">${JSON.stringify(structuredData)}</script>
</head>
<body>
  <a class="skip-link" href="#main">본문으로 바로가기</a>
  <header class="site-header"><div class="wrap nav-inner"><a class="brand" href="/"><span>JEJU</span><strong>제주 수학과외</strong></a><nav aria-label="주요 메뉴"><a href="/#method">수업 방식</a><a href="/#grades">학년별 수업</a><a href="/#areas">지역 찾기</a></nav><a class="nav-cta" href="/#consult">상담 안내</a></div></header>
  ${body}
  <footer><div class="wrap footer-inner"><a class="brand footer-brand" href="/"><span>JEJU</span><strong>제주 수학과외</strong></a><p>학생의 이해에서 시작하는 1:1 맞춤 수업</p><p>© 2026 제주 수학과외</p></div></footer>
</body>
</html>`;
}

function homePage() {
  const cityLinks = cities.map(city => `<a class="city-link" href="${areaPath(city)}"><span>${city.name} 전 지역</span><strong>${city.name} 수학과외</strong><i aria-hidden="true">→</i></a>`).join("");
  const regionGroups = cities.map(city => `<section class="region-group"><div class="region-title"><p>${city.name}</p><span>${regions.filter(region => region.city === city.name).length}개 읍·면·동</span></div><div class="region-grid">${regions.filter(region => region.city === city.name).map(region => `<a href="${areaPath(region)}"><small>${region.type}</small><strong>${region.name} 수학과외</strong><span aria-hidden="true">↗</span></a>`).join("")}</div></section>`).join("");
  const body = `<main id="main">
    <section class="hero"><img src="https://images.unsplash.com/photo-1535189043414-47a3c49a0bed?auto=format&fit=crop&w=2000&q=88" alt="제주의 푸른 바다와 해안 풍경"><div class="hero-shade"></div><div class="wrap hero-content"><p class="eyebrow">JEJU · PRIVATE MATH COACHING</p><h1>제주<br>수학과외</h1><p class="hero-copy">답을 외우기 전에 원리를 이해하도록.<br>학교 진도와 학생의 속도에 맞춘 1:1 수학 수업.</p><a class="button button-citrus" href="#areas">우리 동네 수업 찾기 <span>↓</span></a></div><div class="hero-facts"><span>초등 · 중등 · 고등</span><span>내신 · 선행 · 수능</span><span>제주 전 지역 상담</span></div></section>
    <section class="intro" id="method"><div class="wrap"><div class="section-heading"><div><p class="kicker">01 · LESSON METHOD</p><h2>풀이보다 먼저<br>막힌 지점을 찾습니다</h2></div><p>같은 문제를 틀려도 이유는 다릅니다. 개념이 비어 있는지, 조건을 놓쳤는지, 계산 습관이 흔들리는지 먼저 구분한 뒤 학생에게 필요한 수업 순서를 정합니다.</p></div><div class="method-grid"><article><b>01</b><h3>현재 학습 진단</h3><p>최근 시험지와 교재에서 정확한 취약 지점을 확인합니다.</p></article><article><b>02</b><h3>개인 진도 설계</h3><p>학교 일정, 목표 성적, 학습 가능 시간을 함께 반영합니다.</p></article><article><b>03</b><h3>이해 중심 수업</h3><p>풀이의 이유를 학생이 자신의 말로 설명하도록 돕습니다.</p></article><article><b>04</b><h3>오답 습관 관리</h3><p>반복되는 실수를 기록하고 다음 학습 계획에 반영합니다.</p></article></div></div></section>
    <section class="grade-section" id="grades"><div class="wrap"><div class="section-heading light"><div><p class="kicker">02 · GRADE TRANSITION</p><h2>새 학년의 시작,<br>연결이 중요합니다</h2></div><p>무리한 선행보다 다음 과정에 필요한 이전 개념을 정확하게 이어 붙이는 일이 먼저입니다.</p></div><div class="grade-grid">${gradeCards}</div></div></section>
    <section class="study-scene"><div class="study-photo"><img src="https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1400&q=85" alt="수학 공식과 도형이 적힌 학습 공간" loading="lazy"></div><div><p class="kicker">A ROUTINE THAT LASTS</p><h2>수업이 없는 날에도<br>스스로 이어가도록</h2><p>과외 시간에만 풀 수 있는 문제는 오래 남지 않습니다. 문제를 읽고, 조건을 표시하고, 풀이를 검토하는 루틴을 반복해 혼자 공부할 때의 기준을 만듭니다.</p><ul><li>학교별 시험 범위와 일정 반영</li><li>매 수업 오답 원인 기록</li><li>개인별 과제량과 복습 주기 조정</li></ul></div></section>
    <section class="areas" id="areas"><div class="wrap"><div class="section-heading"><div><p class="kicker">03 · LOCAL CLASS</p><h2>제주 우리 동네<br>수학과외 찾기</h2></div><p>제주시와 서귀포시, 각 읍·면·동의 지역별 수업 안내를 확인하세요. 가까운 생활권을 기준으로 꾸준히 이어갈 수 있는 학습 계획을 제안합니다.</p></div><div class="city-grid">${cityLinks}</div>${regionGroups}</div></section>
    <section class="consult" id="consult"><div class="wrap consult-inner"><div><p class="kicker">04 · CONSULTATION</p><h2>현재 고민에서<br>상담을 시작합니다</h2></div><div><p>학생의 학년, 거주 지역, 최근 성적과 목표를 기준으로 필요한 수업 방향을 정리합니다. 상담 연락처는 운영 정보가 확정되는 대로 이 영역에 연결할 수 있습니다.</p><a class="button button-dark" href="#areas">지역별 안내 보기 <span>→</span></a></div></div></section>
  </main>`;
  return layout({ title: "제주 수학과외 | 예비중·예비고 1:1 맞춤 수업", description: "제주특별자치도 초중고 1:1 수학과외. 예비중1, 예비중2, 예비중3, 예비고1, 예비고2, 예비고3 학생별 내신·선행·수능 맞춤 수업.", canonical: `${siteUrl}/`, body });
}

function areaPage(area) {
  const isCity = area.type === "시";
  const childRegions = isCity ? regions.filter(region => region.city === area.name) : [];
  const nearby = (isCity ? childRegions : regions.filter(region => region.city === area.city && region.slug !== area.slug).slice(0, 8));
  const summary = isCity ? area.summary : `${area.nearby}`;
  const areaName = area.name;
  const cityName = isCity ? area.name : area.city;
  const intro = isCity
    ? `${areaName} 수학과외는 읍·면·동별 학교 일정과 학생의 생활권을 함께 고려합니다. 최근 시험지와 교재를 바탕으로 개념 이해, 풀이 순서, 계산 습관 가운데 어디에서 막혔는지 확인합니다.`
    : `${cityName} ${areaName} 수학과외는 최근 시험지와 현재 사용하는 교재를 먼저 살펴봅니다. 정답 개수만 확인하지 않고 개념 이해, 풀이 순서, 계산 습관 중 어디에서 막혔는지 구분해 다음 학습량을 정합니다.`;
  const regionDirectory = isCity ? `<section class="subareas"><div class="wrap"><div class="section-heading compact"><div><p class="kicker">LOCAL DIRECTORY</p><h2>${areaName} 읍·면·동 안내</h2></div><p>가까운 지역을 선택해 세부 수업 안내를 확인하세요.</p></div><div class="region-grid">${childRegions.map(region => `<a href="${areaPath(region)}"><small>${region.type}</small><strong>${region.name} 수학과외</strong><span aria-hidden="true">↗</span></a>`).join("")}</div></div></section>` : "";
  const nearbyLinks = nearby.map(item => `<a href="${areaPath(item)}">${item.name}<span>→</span></a>`).join("");
  const body = `<main id="main" class="local-page">
    <section class="local-hero"><div class="wrap"><nav class="breadcrumbs" aria-label="현재 위치"><a href="/">제주</a><span>/</span>${!isCity ? `<a href="${areaPath(cities.find(city => city.name === area.city))}">${area.city}</a><span>/</span>` : ""}<strong>${areaName}</strong></nav><p class="eyebrow">${cityName} · LOCAL MATH COACHING</p><h1>${areaName}<br>수학과외</h1><p>${summary}에서 만나는 1:1 맞춤 수업. ${area.focus} 방식으로 학생의 공부 흐름을 바로잡습니다.</p></div></section>
    <section class="local-intro"><div class="wrap section-heading"><div><p class="kicker">LOCAL STUDY PLAN</p><h2>가까운 곳에서<br>꾸준히 배우는 수학</h2></div><div><p>${intro}</p><p>${area.focus}. 초등 개념과 연산, 중등 내신의 서술형 풀이, 고등 수학의 개념 연결과 문제 해석까지 현재 필요한 단계에 집중합니다.</p></div></div></section>
    ${regionDirectory}
    <section class="grade-section local-grades" id="grades"><div class="wrap"><div class="section-heading light"><div><p class="kicker">GRADE TRANSITION</p><h2>${areaName} 학년별<br>수학 학습 안내</h2></div><p>학년 전환기의 복습과 선행을 학생별 이해도에 맞춰 조정합니다.</p></div><div class="grade-grid">${gradeCards}</div></div></section>
    <section class="local-details"><div class="wrap detail-grid"><article><p class="kicker">LESSON FOCUS</p><h2>${areaName} 학생에게 맞는<br>현실적인 계획</h2><p>학교별 시험 일정과 학생의 생활 패턴을 고려해 무리하지 않고 이어갈 수 있는 주간 계획을 세웁니다. 대면 수업 가능 여부와 시간은 세부 위치와 희망 일정에 따라 상담 후 안내합니다.</p></article><article><p class="kicker">NEARBY AREAS</p><h3>${isCity ? `${areaName} 세부 지역` : `${cityName} 다른 지역`} 수학과외</h3><div class="nearby-links">${nearbyLinks}</div></article></div></section>
    <section class="local-cta"><div class="wrap"><div><p class="kicker">CONSULTATION</p><h2>${areaName} 수학과외 상담</h2></div><a class="button button-citrus" href="/#consult">상담 안내 확인 <span>→</span></a></div></section>
  </main>`;
  return layout({ title: `${areaName} 수학과외 | 제주 예비중·예비고 맞춤 수업`, description: `제주 ${areaName} 초중고 1:1 수학과외. 예비중1, 예비중2, 예비중3, 예비고1, 예비고2, 예비고3 학생의 내신·선행·수능 맞춤 학습.`, canonical: `${siteUrl}${areaPath(area)}`, body });
}

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, "assets"), { recursive: true });
await writeFile(path.join(dist, "assets", "style.css"), await readFile(path.join(root, "src", "style.css"), "utf8"));
await writeFile(path.join(dist, "index.html"), homePage());
for (const area of [...cities, ...regions]) {
  const directory = path.join(dist, "areas", area.slug);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), areaPage(area));
}

const urls = [`${siteUrl}/`, ...[...cities, ...regions].map(area => `${siteUrl}${areaPath(area)}`)];
await writeFile(path.join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `\n  <url><loc>${url}</loc><lastmod>2026-10-02</lastmod><changefreq>weekly</changefreq></url>`).join("")}\n</urlset>\n`);
await writeFile(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
await writeFile(path.join(dist, "CNAME"), "tutorup.kr\n");
await writeFile(path.join(dist, ".nojekyll"), "");
await writeFile(path.join(dist, "404.html"), layout({ title: "페이지를 찾을 수 없습니다 | 제주 수학과외", description: "요청하신 페이지를 찾을 수 없습니다.", canonical: `${siteUrl}/404.html`, body: `<main id="main" class="not-found"><div><p class="kicker">404 ERROR</p><h1>페이지를 찾을 수 없습니다</h1><p>주소가 변경되었거나 존재하지 않는 페이지입니다.</p><a class="button button-citrus" href="/">홈으로 돌아가기</a></div></main>` }));
console.log(`Built ${urls.length} pages for ${siteUrl}`);