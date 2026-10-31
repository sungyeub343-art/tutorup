import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { deflateSync } from "node:zlib";
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

const lastUpdated = "2026-10-31";
const phone = "010-2928-3614";
const phoneLink = "tel:01029283614";
const ogImage = "https://images.unsplash.com/photo-1535189043414-47a3c49a0bed?auto=format&fit=crop&w=1200&q=85";

// 검색 사용자가 실제로 입력하는 짧은 지역명과 생활권 별칭
const shortOverrides = { "jeju-si": "제주시", "seogwipo-si": "서귀포", jungang: "서귀포 중앙동" };
const aliases = { yeon: "신제주", nohyung: "신제주", "ildo-1": "구제주", "ildo-2": "구제주", "ido-1": "구제주", "ido-2": "구제주", "samdo-1": "구제주", "samdo-2": "구제주", daejeong: "영어교육도시" };
const shortName = area => shortOverrides[area.slug] ?? (name => name.length >= 2 ? name : area.name)(/\d/.test(area.name) ? area.name : area.name.replace(/(읍|면|동)$/, ""));
const cityShort = name => name === "서귀포시" ? "서귀포" : "제주시";

const levels = [
  {
    slug: "elementary", key: "초등", eyebrow: "ELEMENTARY MATH",
    title: "제주 초등수학 과외 | 초등 수학수업·기초수학·연산 1:1",
    description: `제주 초등 수학과외. 연산·분수·도형 기초수학부터 서술형 문장제까지 초1~초6 학년별 1:1 초등 수학수업과 수학공부 습관을 함께 잡습니다. 상담 ${phone}`,
    lead: "연산 속도보다 원리 이해가 먼저입니다. 기초수학의 빈틈을 찾고 스스로 수학공부하는 습관을 만드는 초등 1:1 수학수업.",
    summary: "연산·분수·도형의 기초수학을 점검하고 문제를 끝까지 읽는 수학공부 습관을 만듭니다.",
    points: [["수학수업", "개념 설명 → 직접 풀이 → 말로 설명"], ["기초수학", "연산·분수·도형 빈틈 진단"], ["수학공부", "읽기·식 세우기·검산 습관"]],
    gradeTags: ["초1", "초2", "초3", "초4", "초5", "초6"],
    topics: [
      ["제주 초등 수학수업", "한 번의 수업에서 개념 설명, 직접 풀이, 풀이를 말로 설명하기를 순서대로 진행합니다. 학교 진도를 기준으로 하되 이해가 늦은 단원은 그림과 구체적인 예로 다시 설명합니다."],
      ["제주 초등 기초수학", "받아올림·받아내림, 곱셈구구, 나눗셈, 분수와 소수의 계산처럼 다음 학년의 바탕이 되는 기초수학을 진단합니다. 틀린 문제의 계산 과정을 보고 실수가 생기는 지점을 찾습니다."],
      ["제주 초등 수학공부 습관", "문제를 끝까지 읽고 조건에 표시하기, 식 세우기, 검산하기를 매 수업 반복합니다. 수업이 없는 날의 과제량은 학생의 속도에 맞춰 조절합니다."],
      ["서술형·문장제 대비", "문장제는 계산보다 읽기에서 막히는 경우가 많습니다. 문제를 그림이나 표로 바꾸는 연습으로 학교 서술형 평가에 대비합니다."]
    ],
    grades: [
      ["초1·초2", "수 세기, 가르기와 모으기, 덧셈과 뺄셈, 곱셈구구를 익히며 수 감각과 계산의 기초를 기릅니다."],
      ["초3·초4", "곱셈과 나눗셈, 분수와 소수의 기초, 각도와 평면도형을 다루며 기초수학의 빈틈을 메웁니다."],
      ["초5", "약수와 배수, 약분과 통분, 분수의 덧셈과 뺄셈, 다각형의 넓이처럼 중학 수학으로 이어지는 핵심 단원을 정리합니다."],
      ["초6·예비중1", "분수·소수의 나눗셈, 비와 비율, 비례식, 원의 넓이를 마무리하고 중1 정수와 문자와 식을 준비합니다."]
    ],
    faqs: [
      ["초등학생도 1:1 수학과외가 필요할까요?", "학교 수업을 잘 따라가고 있다면 꼭 필요하지 않을 수 있습니다. 다만 연산 실수가 반복되거나 분수·도형 단원에서 자주 막힌다면 기초수학 빈틈이 쌓이기 전에 점검하는 것이 좋습니다. 상담 때 최근 단원평가나 문제집을 보고 함께 판단합니다."],
      ["초등 수학공부는 하루에 얼마나 해야 하나요?", "학년과 집중 시간에 따라 다릅니다. 무리한 분량보다 매일 짧게라도 개념 복습과 오답 확인을 이어가도록 과제량을 조정합니다."],
      ["초등 수학 선행을 해야 하나요?", "현재 학년 개념이 탄탄하다면 다음 학기 내용을 미리 볼 수 있습니다. 빈틈이 있다면 복습을 먼저 하고, 초6은 중1 수학으로 자연스럽게 이어지도록 준비합니다."]
    ]
  },
  {
    slug: "middle", key: "중등", eyebrow: "MIDDLE SCHOOL MATH",
    title: "제주 중등수학 과외 | 중학생 수학내신·수학수업 1:1",
    description: `제주 중등 수학과외. 중1·중2·중3 학교별 수학내신 대비, 서술형·수행평가, 기초수학 보완까지 1:1 중등 수학수업으로 관리합니다. 상담 ${phone}`,
    lead: "학교별 시험 범위와 서술형까지 반영하는 수학내신 대비. 흔들리는 기초수학은 이전 개념부터 다시 잇는 중등 1:1 수학수업.",
    summary: "학교별 시험 범위와 서술형을 반영해 수학내신을 준비하고 흔들리는 기초수학을 보완합니다.",
    points: [["수학수업", "교과서 개념을 서술형 풀이로 연결"], ["수학내신", "학교별 시험 범위·서술형 대비"], ["기초수학", "정수·문자와 식·방정식 보완"], ["수학공부", "개념·오답 노트와 주간 과제 관리"]],
    gradeTags: ["중1", "중2", "중3", "예비고1"],
    topics: [
      ["제주 중등 수학내신", "학교별 시험 범위, 출제 경향, 서술형 비중을 확인하고 시험 4주 전부터 개념 정리 → 유형 연습 → 실전 점검 순서로 준비합니다. 시험 후에는 오답을 분석해 다음 시험 계획에 반영합니다."],
      ["제주 중등 수학수업", "교과서 개념을 학생이 직접 설명할 수 있을 때까지 다룬 뒤 문제에 적용합니다. 풀이 과정을 식으로 정리하는 연습이 서술형 점수로 이어집니다."],
      ["제주 중등 기초수학", "정수와 유리수 계산, 문자와 식, 방정식이 흔들리면 이후 단원이 모두 어려워집니다. 필요한 경우 초등 분수·비율까지 거슬러 올라가 보완합니다."],
      ["제주 중등 수학공부법", "개념 노트, 오답 노트, 주간 과제표로 수업 밖 공부를 관리합니다. 학교·학원 과제와 겹치지 않도록 분량을 조정합니다."]
    ],
    grades: [
      ["중1", "소인수분해, 정수와 유리수, 문자와 식, 일차방정식, 좌표평면과 그래프, 기본 도형을 다룹니다. 첫 지필평가에 대비해 서술형 풀이 습관을 잡습니다."],
      ["중2", "유리수와 순환소수, 식의 계산, 일차부등식과 연립방정식, 일차함수, 도형의 성질과 닮음, 확률을 다룹니다. 계산량이 많아지는 시기라 정확도 관리가 중요합니다."],
      ["중3", "제곱근과 실수, 다항식의 곱셈과 인수분해, 이차방정식, 이차함수, 삼각비, 원의 성질을 다룹니다. 고등 공통수학으로 이어지는 핵심 단원입니다."],
      ["예비고1", "중학 전 범위의 취약 단원을 정리하고 공통수학1의 다항식, 방정식과 부등식을 시작합니다."]
    ],
    faqs: [
      ["중학교 수학내신은 언제부터 준비하나요?", "보통 시험 4주 전부터 시험 범위 중심으로 전환합니다. 평소에는 진도 복습과 기초 보완을 하고, 시험 기간에는 교과서·학교 프린트·기출 유형을 중심으로 정리합니다."],
      ["수학학원과 과외를 함께 해도 되나요?", "가능합니다. 학원 진도를 따라가기 어려운 단원을 과외에서 보완하거나, 학원 과제와 겹치지 않도록 수업 내용을 조정할 수 있습니다."],
      ["기초가 많이 부족한 중학생도 수업할 수 있나요?", "가능합니다. 진단 후 필요하면 초등 과정의 분수·비율부터 다시 짚고 현재 학년 내용으로 빠르게 연결합니다."]
    ]
  },
  {
    slug: "high", key: "고등", eyebrow: "HIGH SCHOOL MATH",
    title: "제주 고등수학 과외 | 수능수학·수학내신·수능대비 1:1",
    description: `제주 고등 수학과외. 고1 공통수학 내신부터 고2·고3 수능수학·수능대비까지, 기초수학 보완과 학교별 수학내신을 1:1로 관리합니다. 상담 ${phone}`,
    lead: "학교별 수학내신과 수능수학을 함께 설계합니다. 모의고사 분석부터 실전 시간 관리까지 이어지는 고등 1:1 수능대비 수업.",
    summary: "학교별 수학내신과 수능수학을 함께 설계하고 모의고사 분석으로 수능대비를 이어갑니다.",
    points: [["수학내신", "학교별 부교재·기출 경향 반영"], ["수능수학", "단원별 기출 분석과 사고 과정 정리"], ["수능대비", "모의고사 분석과 실전 시간 관리"], ["기초수학", "중등 핵심 개념 빠른 보완"], ["수학수업", "직접 풀고 설명하는 1:1 수업"], ["수학공부", "내신·모의고사 일정 맞춤 학습 계획"]],
    gradeTags: ["고1", "고2", "고3", "예비고2", "예비고3"],
    topics: [
      ["제주 고등 수학내신", "학교별 시험 범위, 부교재, 기출 경향을 반영해 내신을 준비합니다. 변별력 문항에 대비해 개념의 조건과 예외를 꼼꼼하게 정리합니다."],
      ["제주 고등 수능수학", "수능수학은 개념을 정확히 알고 제한 시간 안에 적용하는 시험입니다. 단원별 기출을 분석해 자주 쓰이는 사고 과정을 정리합니다."],
      ["제주 고등 수능대비", "모의고사 결과를 단원·유형·시간 관리로 나눠 분석하고, 남은 기간에 맞춰 개념 보완과 실전 연습의 비율을 조정합니다."],
      ["제주 고등 수학수업", "설명 듣는 시간보다 학생이 직접 풀고 설명하는 시간을 늘립니다. 풀이가 막힌 지점에서 필요한 개념만 짚어 스스로 끝까지 풀게 합니다."],
      ["제주 고등 기초수학", "고등 수학이 어려운 원인은 중학 과정의 인수분해, 이차함수, 방정식에 있는 경우가 많습니다. 필요한 중등 개념을 짧게 복습하며 현재 진도를 따라갑니다."],
      ["제주 고등 수학공부법", "개념 정리, 오답 관리, 주간 복습 주기를 학생 일정에 맞게 설계합니다. 내신 기간과 모의고사 일정을 함께 고려합니다."]
    ],
    grades: [
      ["고1", "공통수학1(다항식, 방정식과 부등식, 경우의 수, 행렬)과 공통수학2(도형의 방정식, 집합과 명제, 함수와 그래프)를 다룹니다. 첫 고등 내신에서 기준을 잡는 것이 중요합니다."],
      ["고2", "대수, 미적분Ⅰ, 확률과 통계 등 학교 선택 과목에 맞춰 내신을 준비하고 수능 출제 범위와 연결해 공부합니다."],
      ["고3", "수능 출제 단원별 기출 분석과 실전 모의고사로 시간 관리 능력을 기르고, 남은 내신과 수시 일정을 함께 관리합니다."],
      ["예비고2·예비고3", "방학 동안 취약 단원을 정리하고 수능 범위 전체를 한 번 이상 학습하는 계획을 세웁니다."]
    ],
    faqs: [
      ["수능수학과 수학내신을 같이 준비할 수 있나요?", "학기 중에는 내신 비중을 높이고, 방학과 시험 이후 기간에는 수능 범위 학습과 기출 분석을 늘립니다. 학교 진도와 수능 범위가 겹치는 단원은 함께 정리해 시간을 아낍니다."],
      ["2028학년도 수능 수학은 어떻게 바뀌나요?", "2028학년도 수능부터 수학 영역은 선택과목 없이 대수, 미적분Ⅰ, 확률과 통계를 공통으로 출제합니다. 해당 학년 학생은 학교 내신 과목과 수능 범위를 연결해 학습 계획을 세우는 것이 좋습니다."],
      ["수학 기초가 부족한 고등학생도 가능한가요?", "가능합니다. 현재 진도를 따라가는 데 필요한 중등 개념을 우선 보완하고, 내신과 수능대비로 단계적으로 연결합니다."]
    ]
  }
];
const levelPath = level => `/${level.slug}/`;

// 학년별 페이지: 학년마다 배우는 단원과 자주 막히는 지점이 달라 페이지별 내용이 겹치지 않습니다.
const gradePages = [
  {
    slug: "e1", key: "초1", level: "초등", full: "초등학교 1학년", headline: "수 세기·덧셈과 뺄셈",
    units: ["9까지의 수", "여러 가지 모양", "덧셈과 뺄셈", "비교하기", "50까지의 수", "100까지의 수", "시계 보기와 규칙 찾기"],
    intro: "초등학교 1학년 수학은 숫자를 읽고 세는 것에서 시작해 덧셈과 뺄셈의 뜻을 익히는 단계입니다. 손가락 계산에서 벗어나 수를 가르고 모으는 감각을 기르면 2학년 받아올림 계산이 훨씬 쉬워집니다.",
    struggles: [["수의 순서와 크기", "몇째와 몇 개를 헷갈리거나 두 수의 크기를 비교할 때 막히는 경우가 많습니다."], ["가르기와 모으기", "10을 만드는 수의 짝을 바로 떠올리지 못하면 덧셈과 뺄셈이 느려집니다."], ["문장으로 된 문제", "문제를 읽고 더할지 뺄지 판단하는 연습이 필요합니다."]],
    faqs: [["초1도 수학과외가 필요한가요?", "대부분은 학교 수업과 가정 학습으로 충분합니다. 다만 수 세기나 10 만들기에서 자주 막힌다면 짧게라도 1:1로 점검하는 것이 도움이 됩니다."], ["초1 수학공부는 어떻게 시작하나요?", "구체물과 그림으로 수를 세고 가르는 활동을 먼저 하고, 익숙해지면 식으로 옮겨 쓰게 합니다."]]
  },
  {
    slug: "e2", key: "초2", level: "초등", full: "초등학교 2학년", headline: "곱셈구구·받아올림 계산",
    units: ["세 자리 수", "네 자리 수", "받아올림이 있는 덧셈", "받아내림이 있는 뺄셈", "길이 재기", "곱셈구구", "시각과 시간", "표와 그래프"],
    intro: "2학년은 세 자리 수와 네 자리 수, 받아올림·받아내림이 있는 덧셈과 뺄셈, 그리고 곱셈구구를 배웁니다. 곱셈구구를 외우는 것보다 '몇씩 몇 묶음'이라는 뜻을 이해하는 것이 3학년 나눗셈의 바탕이 됩니다.",
    struggles: [["받아올림·받아내림", "자리값을 이해하지 못한 채 계산 순서만 외우면 실수가 반복됩니다."], ["곱셈구구의 뜻", "외운 구구단을 문장제에 적용하지 못하는 경우가 많습니다."], ["길이와 시각 단위", "1m=100cm, 1시간=60분처럼 단위 사이의 관계를 헷갈리기 쉽습니다."]],
    faqs: [["곱셈구구는 언제까지 익혀야 하나요?", "2학년에 배우며 3학년 곱셈·나눗셈 전에 익숙해지는 것이 좋습니다. 뜻을 먼저 이해한 뒤 반복으로 속도를 높입니다."], ["계산 실수가 잦은데 어떻게 하나요?", "자리를 맞춰 쓰는 습관과 검산을 함께 연습하면 실수가 크게 줄어듭니다."]]
  },
  {
    slug: "e3", key: "초3", level: "초등", full: "초등학교 3학년", headline: "나눗셈·분수와 소수",
    units: ["세 자리 수의 덧셈과 뺄셈", "평면도형", "나눗셈", "곱셈", "길이와 시간", "분수와 소수", "원", "들이와 무게"],
    intro: "3학년은 나눗셈과 분수·소수를 처음 배우는 학년입니다. 곱셈과 나눗셈의 관계, 전체와 부분으로서의 분수를 정확히 이해해야 4학년 이후 계산이 흔들리지 않습니다.",
    struggles: [["나눗셈의 두 가지 뜻", "똑같이 나누기와 몇 번 덜어 내기를 구분하지 못하면 문장제에서 막힙니다."], ["분수와 소수의 첫 개념", "분모와 분자의 의미를 그림으로 설명하지 못하는 경우가 많습니다."], ["들이와 무게 단위", "L와 mL, kg과 g의 환산에서 실수가 잦습니다."]],
    faqs: [["3학년 수학이 갑자기 어려워졌어요.", "나눗셈과 분수가 새로 나오면서 흔히 생기는 변화입니다. 곱셈구구와 자리값을 먼저 점검하면 대부분 빠르게 회복됩니다."], ["분수는 어떻게 공부하나요?", "막대나 원 그림으로 전체를 똑같이 나누는 활동부터 시작해 수직선 위의 분수로 연결합니다."]]
  },
  {
    slug: "e4", key: "초4", level: "초등", full: "초등학교 4학년", headline: "큰 수·분수와 소수의 계산",
    units: ["큰 수", "각도", "곱셈과 나눗셈", "평면도형의 이동", "막대그래프", "분수의 덧셈과 뺄셈", "삼각형과 사각형", "소수의 덧셈과 뺄셈", "꺾은선그래프", "다각형"],
    intro: "4학년은 큰 수, 각도, 세 자리 수의 곱셈과 두 자리 수로 나누는 나눗셈, 분모가 같은 분수와 소수의 덧셈·뺄셈을 배웁니다. 계산량이 많아지고 도형 단원이 본격화되는 시기라 정확도와 공간 감각을 함께 길러야 합니다.",
    struggles: [["두 자리 수로 나누기", "몫을 어림하는 과정에서 시간이 오래 걸리고 실수가 생깁니다."], ["각도와 도형 분류", "각도기 사용과 삼각형·사각형의 분류 기준을 정확히 익혀야 합니다."], ["그래프 해석", "막대그래프·꺾은선그래프에서 눈금 한 칸의 크기를 놓치기 쉽습니다."]],
    faqs: [["4학년 때 선행을 시작해야 하나요?", "4학년 계산이 정확하다면 5학년 약수와 배수를 가볍게 미리 볼 수 있습니다. 나눗셈이 불안하다면 복습이 먼저입니다."], ["도형 단원을 어려워해요.", "직접 그리고 접어 보는 활동으로 성질을 확인한 뒤 문제로 옮기면 이해가 빨라집니다."]]
  },
  {
    slug: "e5", key: "초5", level: "초등", full: "초등학교 5학년", headline: "약수와 배수·분수의 계산",
    units: ["자연수의 혼합 계산", "약수와 배수", "규칙과 대응", "약분과 통분", "분수의 덧셈과 뺄셈", "다각형의 둘레와 넓이", "수의 범위와 어림", "분수의 곱셈", "합동과 대칭", "소수의 곱셈", "직육면체", "평균과 가능성"],
    intro: "5학년은 약수와 배수, 약분과 통분, 분모가 다른 분수의 덧셈과 뺄셈, 분수와 소수의 곱셈을 배웁니다. 초등 수학에서 가장 중요한 학년으로, 이 시기의 분수 계산이 중학교 문자와 식의 기초가 됩니다.",
    struggles: [["약분과 통분", "최대공약수·최소공배수를 구하는 이유를 모른 채 절차만 외우는 경우가 많습니다."], ["혼합 계산 순서", "괄호와 곱셈·나눗셈의 계산 순서를 놓쳐 답이 달라집니다."], ["넓이 공식", "다각형 넓이 공식을 외우기만 하면 응용 문제에서 막힙니다."]],
    faqs: [["5학년 수학이 왜 중요한가요?", "분수 계산과 약수·배수가 중학교 정수·유리수와 방정식의 바탕이 되기 때문입니다. 이 시기에 생긴 빈틈은 중학교에서 크게 드러납니다."], ["분수 계산 실수를 줄이려면?", "통분 과정을 생략하지 않고 쓰고, 마지막에 기약분수인지 확인하는 습관을 들입니다."]]
  },
  {
    slug: "e6", key: "초6", level: "초등", full: "초등학교 6학년", headline: "비와 비율·중학 수학 준비",
    units: ["분수의 나눗셈", "각기둥과 각뿔", "소수의 나눗셈", "비와 비율", "여러 가지 그래프", "직육면체의 부피와 겉넓이", "공간과 입체", "비례식과 비례배분", "원의 넓이", "원기둥, 원뿔, 구"],
    intro: "6학년은 분수와 소수의 나눗셈, 비와 비율, 비례식과 비례배분, 원의 넓이, 입체도형을 배웁니다. 초등 과정을 마무리하면서 중1 정수와 유리수, 문자와 식으로 넘어갈 준비를 하는 학년입니다.",
    struggles: [["비와 비율", "백분율과 비율을 상황에 맞게 바꾸어 표현하는 데 어려움을 겪습니다."], ["분수의 나눗셈", "나누는 수를 뒤집어 곱하는 이유를 모르면 응용 문제에서 흔들립니다."], ["입체도형", "겉넓이와 부피를 혼동하거나 전개도를 떠올리지 못하는 경우가 많습니다."]],
    faqs: [["초6 겨울방학에는 무엇을 준비하나요?", "초등 분수·소수 계산을 정리한 뒤 중1 1학기의 소인수분해와 정수·유리수를 미리 학습합니다."], ["중학교 선행은 어디까지 하나요?", "현재 실력에 따라 다르지만 중1 1학기 내용을 정확히 이해하는 것을 우선 목표로 합니다."]]
  },
  {
    slug: "m1", key: "중1", level: "중등", full: "중학교 1학년", headline: "정수와 유리수·일차방정식",
    units: ["소인수분해", "정수와 유리수", "문자의 사용과 식의 계산", "일차방정식", "좌표평면과 그래프", "기본 도형", "작도와 합동", "평면도형과 입체도형", "자료의 정리와 해석"],
    intro: "중학교 1학년은 소인수분해, 정수와 유리수, 문자와 식, 일차방정식, 좌표평면과 그래프, 기본 도형과 통계를 배웁니다. 음수와 문자가 처음 등장해 계산 규칙이 바뀌는 시기이므로 초등 계산 습관을 중학 방식으로 바꾸는 것이 중요합니다. 학교에 따라 지필평가가 없는 학기가 있어 첫 시험 경험이 늦어질 수 있습니다.",
    struggles: [["음수의 계산", "부호 실수가 가장 많이 나오는 단원으로, 수직선으로 원리를 이해해야 합니다."], ["문자와 식", "분배법칙과 동류항 정리에서 실수가 반복됩니다."], ["일차방정식 활용", "문장을 식으로 세우는 단계에서 가장 많이 막힙니다."]],
    faqs: [["중1 첫 시험은 어떻게 준비하나요?", "교과서 개념과 예제를 먼저 정리하고, 서술형에 대비해 풀이 과정을 식으로 쓰는 연습을 합니다. 시험 4주 전부터 학교 프린트와 기출 유형을 중심으로 준비합니다."], ["초등 때 수학을 잘했는데 중1에서 떨어졌어요.", "음수와 문자가 등장하면서 계산 방식이 바뀌기 때문에 흔히 생기는 일입니다. 부호와 식 정리 습관을 바로잡으면 빠르게 회복됩니다."]]
  },
  {
    slug: "m2", key: "중2", level: "중등", full: "중학교 2학년", headline: "연립방정식·일차함수",
    units: ["유리수와 순환소수", "식의 계산", "일차부등식", "연립일차방정식", "일차함수와 그래프", "삼각형과 사각형의 성질", "도형의 닮음", "피타고라스 정리", "확률"],
    intro: "중학교 2학년은 유리수와 순환소수, 식의 계산, 일차부등식, 연립방정식, 일차함수, 도형의 성질과 닮음, 피타고라스 정리, 확률을 배웁니다. 계산량이 가장 많고 함수가 본격적으로 시작되는 학년이라 중학 수학의 분기점으로 꼽힙니다.",
    struggles: [["연립방정식 활용", "미지수 두 개를 정하고 조건을 식으로 옮기는 과정이 어렵습니다."], ["일차함수와 그래프", "기울기와 절편의 의미를 그래프와 연결하지 못하면 고등 함수까지 영향을 받습니다."], ["도형의 성질 설명", "삼각형·사각형의 성질을 근거로 설명하는 서술형에서 감점이 많습니다."]],
    faqs: [["중2 수학이 가장 어렵다고 하던데요?", "계산·함수·도형이 한꺼번에 나오기 때문입니다. 단원별로 약한 부분을 진단하고 서술형 풀이를 꾸준히 연습하면 충분히 대비할 수 있습니다."], ["일차함수를 어려워하면 어떻게 하나요?", "표·식·그래프를 오가며 같은 관계를 세 가지로 표현하는 연습을 합니다."]]
  },
  {
    slug: "m3", key: "중3", level: "중등", full: "중학교 3학년", headline: "인수분해·이차함수",
    units: ["제곱근과 실수", "다항식의 곱셈", "인수분해", "이차방정식", "이차함수와 그래프", "삼각비", "원의 성질", "대푯값과 산포도", "상관관계"],
    intro: "중학교 3학년은 제곱근과 실수, 다항식의 곱셈과 인수분해, 이차방정식, 이차함수, 삼각비, 원의 성질, 통계를 배웁니다. 고1 공통수학이 이 내용을 바로 이어받기 때문에 고등 수학 준비의 출발점입니다.",
    struggles: [["인수분해", "공식을 바로 떠올리지 못하면 이차방정식과 고등 다항식까지 느려집니다."], ["이차함수의 그래프", "꼭짓점과 축을 구하는 과정에서 완전제곱식 변형이 흔들립니다."], ["원의 성질", "원주각과 접선의 성질을 문제 상황에 적용하는 데 어려움을 겪습니다."]],
    faqs: [["중3 2학기 이후에는 무엇을 해야 하나요?", "2학기 내신을 마무리한 뒤 겨울방학까지 중학 전 범위 취약 단원 정리와 고1 공통수학1 예습을 병행합니다."], ["고등학교 선행은 어느 정도 필요할까요?", "공통수학1의 다항식과 방정식·부등식을 한 번 정확히 학습하는 것을 우선 목표로 합니다."]]
  },
  {
    slug: "h1", key: "고1", level: "고등", full: "고등학교 1학년", headline: "공통수학1·공통수학2",
    units: ["다항식의 연산", "나머지정리와 인수분해", "복소수와 이차방정식", "이차방정식과 이차함수", "여러 가지 방정식과 부등식", "경우의 수", "행렬", "도형의 방정식", "집합과 명제", "함수와 그래프"],
    intro: "고등학교 1학년은 공통수학1(다항식, 방정식과 부등식, 경우의 수, 행렬)과 공통수학2(도형의 방정식, 집합과 명제, 함수와 그래프)를 배웁니다. 첫 고등 내신의 결과가 이후 학습 계획의 기준이 되기 때문에 1학기 준비가 특히 중요합니다.",
    struggles: [["나머지정리와 인수분해", "중학교 인수분해가 약하면 다항식 단원부터 막힙니다."], ["이차방정식과 이차함수", "판별식과 그래프의 위치 관계를 연결하는 문제가 변별 문항으로 자주 나옵니다."], ["도형의 방정식", "좌표와 식으로 도형을 해석하는 계산량이 많아 시간 관리가 필요합니다."]],
    faqs: [["고1 첫 내신은 어떻게 준비하나요?", "학교 교과서와 부교재, 프린트 범위를 확인하고 시험 4~5주 전부터 개념 정리와 학교 출제 유형 연습을 진행합니다."], ["고1 모의고사도 대비해야 하나요?", "학기 중에는 내신을 우선하고, 모의고사는 범위가 겹치는 단원을 중심으로 시간 관리 연습을 함께 합니다."]]
  },
  {
    slug: "h2", key: "고2", level: "고등", full: "고등학교 2학년", headline: "대수·미적분Ⅰ·확률과 통계",
    units: ["지수와 로그", "지수함수와 로그함수", "삼각함수", "수열", "함수의 극한과 연속", "미분", "적분", "경우의 수와 확률", "통계"],
    intro: "고등학교 2학년은 대수(지수와 로그, 삼각함수, 수열), 미적분Ⅰ(함수의 극한과 연속, 미분, 적분), 확률과 통계 가운데 학교가 편성한 과목을 배웁니다. 2028학년도 수능부터 이 세 과목이 수학 영역 공통 출제 범위이므로 내신 공부가 곧 수능 준비로 이어집니다.",
    struggles: [["지수·로그와 삼각함수", "새로운 함수의 성질과 그래프를 외우기만 하면 응용 문제에서 흔들립니다."], ["수열", "규칙을 식으로 일반화하는 과정이 어려운 단원입니다."], ["미분의 활용", "극대·극소와 그래프 개형을 해석하는 문제가 변별 문항으로 나옵니다."]],
    faqs: [["고2 수학 과목은 학교마다 다른가요?", "네. 학교 교육과정 편성에 따라 학기별로 배우는 과목과 순서가 다르기 때문에 학교 편성표를 확인하고 계획을 세웁니다."], ["2028학년도 수능 수학은 무엇이 달라지나요?", "수학 영역에서 선택과목 없이 대수, 미적분Ⅰ, 확률과 통계를 공통으로 출제합니다."]]
  },
  {
    slug: "h3", key: "고3", level: "고등", full: "고등학교 3학년", headline: "수능수학·내신 마무리",
    units: ["수능 출제 단원 기출 분석", "실전 모의고사", "시간 관리 훈련", "취약 유형 집중 보완", "남은 학기 내신", "수시 일정 관리"],
    intro: "고등학교 3학년은 수능수학 실전 대비와 남은 내신, 수시 일정을 함께 관리하는 학년입니다. 2027학년도 수능은 수학Ⅰ·수학Ⅱ 공통과 선택과목(확률과 통계·미적분·기하) 구조이고, 2028학년도 수능부터는 대수·미적분Ⅰ·확률과 통계 공통 출제로 바뀌므로 응시 연도에 맞춰 범위를 확인합니다.",
    struggles: [["시간 관리", "아는 문제도 시간 안에 풀지 못하는 경우가 많아 실전 연습이 필요합니다."], ["고난도 문항", "어려운 문항에 시간을 과하게 쓰지 않도록 문항 선택 순서를 정합니다."], ["반복되는 실수", "모의고사마다 같은 유형에서 실수가 나오면 원인을 기록해 줄여 나갑니다."]],
    faqs: [["고3인데 지금 시작해도 늦지 않나요?", "남은 기간에 맞춰 점수를 올릴 수 있는 단원과 유형을 우선 정리합니다. 모의고사 결과를 분석해 현실적인 목표를 함께 세웁니다."], ["수시 준비와 수능 공부를 같이 할 수 있나요?", "내신 시험 기간에는 내신에 집중하고, 그 외 기간에는 수능 기출과 실전 모의고사 비중을 높여 균형을 맞춥니다."]]
  }
];
const gradePath = grade => `/grades/${grade.slug}/`;
const gradeByKey = key => gradePages.find(grade => grade.key === key);
const gradeTagLinks = tags => tags.map(tag => gradeByKey(tag) ? `<a href="${gradePath(gradeByKey(tag))}">${tag}</a>` : tag).join(" · ");

const gradeCards = grades.map(([name, text], index) => `<article class="grade-card"><span>0${index + 1}</span><h3>${name} 수학과외</h3><p>${text}</p></article>`).join("");
const areaPath = area => `/areas/${area.slug}/`;
const esc = text => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const pointList = level => `<ul>${level.points.map(([keyword, text]) => `<li><b>${level.key} ${keyword}</b><span>${text}</span></li>`).join("")}</ul>`;
const faqSection = (heading, faqs) => `<section class="faq" id="faq"><div class="wrap"><div class="section-heading compact"><div><p class="kicker">FAQ</p><h2>${heading}</h2></div><p>상담 전에 자주 묻는 질문을 정리했습니다.</p></div><div class="faq-list">${faqs.map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join("")}</div></div></section>`;
const pages = [];

// 학교 데이터(src/schools.json, scripts/import-schools.py로 생성)의 법정동·읍면을 사이트의 지역 페이지에 연결합니다.
// 법정동 하나가 여러 행정동에 걸치면 해당 페이지마다 인근 학교로 함께 보여 줍니다.
const schools = JSON.parse(await readFile(path.join(root, "src", "schools.json"), "utf8"));
const seogwipoDowntown = ["songsan", "jeongbang", "jungang", "cheonji"];
const townAreas = {
  제주시: {
    일도일동: ["ildo-1"], 일도이동: ["ildo-2"], 이도일동: ["ido-1"], 이도이동: ["ido-2"], 도남동: ["ido-2"],
    삼도일동: ["samdo-1"], 삼도이동: ["samdo-1", "samdo-2"], 용담일동: ["yongdam-1"], 용담이동: ["yongdam-1", "yongdam-2"], 용담삼동: ["yongdam-2"],
    건입동: ["geonip"], 화북일동: ["hwabuk"], 화북이동: ["hwabuk"], 삼양일동: ["samyang"], 삼양이동: ["samyang"], 삼양삼동: ["samyang"], 도련일동: ["samyang"], 도련이동: ["samyang"],
    봉개동: ["bonggae"], 회천동: ["bonggae"], 용강동: ["bonggae"], 아라일동: ["ara"], 아라이동: ["ara"], 영평동: ["ara"], 월평동: ["ara"], 오등동: ["ara"],
    오라일동: ["ora"], 오라이동: ["ora"], 오라삼동: ["ora"], 연동: ["yeon"], 노형동: ["nohyung"], 해안동: ["nohyung"],
    외도일동: ["oedo"], 외도이동: ["oedo"], 내도동: ["oedo"], 도평동: ["oedo"], 이호일동: ["iho"], 이호이동: ["iho"], 도두일동: ["dodu"], 도두이동: ["dodu"]
  },
  서귀포시: {
    서귀동: seogwipoDowntown, 보목동: ["songsan"], 토평동: ["yeongcheon"], 상효동: ["yeongcheon"], 하효동: ["hyodon"], 신효동: ["hyodon"],
    동홍동: ["donghong"], 서홍동: ["seohong"], 법환동: ["daeryun"], 서호동: ["daeryun"], 호근동: ["daeryun"],
    강정동: ["daecheon"], 도순동: ["daecheon"], 영남동: ["daecheon"], 월평동: ["daecheon"],
    중문동: ["jungmun"], 대포동: ["jungmun"], 하원동: ["jungmun"], 회수동: ["jungmun"], 상예동: ["yerae"], 하예동: ["yerae"], 색달동: ["yerae"]
  }
};
// 학교가 없는 동은 가까운 동의 학교를 인근 학교로 보여 줍니다.
const nearbySchoolAreas = { "ildo-1": ["ildo-2", "ido-1"], iho: ["dodu", "oedo"] };
for (const school of schools) {
  school.areas = townAreas[school.city]?.[school.town] ?? regions.filter(region => region.city === school.city && region.name === school.town).map(region => region.slug);
  if (!school.areas.length) throw new Error(`${school.name}(${school.city} ${school.town})의 지역 페이지를 찾을 수 없습니다`);
}
const schoolLevels = [["초등", "초등학교"], ["중등", "중학교"], ["고등", "고등학교"], ["국제", "국제학교"]];
const findArea = slug => regions.find(region => region.slug === slug);
const schoolSlug = school => school.name.replace(/\s+/g, "-");
const schoolPath = school => `/schools/${encodeURIComponent(schoolSlug(school))}/`;
const schoolLink = school => `<a class="school-link" href="${schoolPath(school)}">${school.name}</a>`;
// 검색에서 많이 쓰는 줄임말(오현고, 제주여중 등)
const schoolShortOverrides = { 제주대학교사범대학부설고등학교: "사대부고", 제주대학교사범대학부설중학교: "사대부중", 제주대학교교육대학부설초등학교: "교대부설초", 제주여자상업고등학교: "제주여상", 제주외국어고등학교: "제주외고", "세인트존스베리 아카데미 제주": "SJA Jeju" };
const schoolShort = school => schoolShortOverrides[school.name] ?? school.name.replace("여자", "여").replace(/고등학교$/, "고").replace(/중학교$/, "중").replace(/초등학교$/, "초");
function schoolsFor(area) {
  if (area.type === "시") return { list: schools.filter(school => school.city === area.name), nearby: false };
  const list = schools.filter(school => school.areas.includes(area.slug));
  return list.length ? { list, nearby: false } : { list: schools.filter(school => school.areas.some(slug => nearbySchoolAreas[area.slug]?.includes(slug))), nearby: true };
}
function schoolGrid(list, grouped) {
  return `<div class="school-grid">${schoolLevels.map(([level, label]) => {
    const items = list.filter(school => school.level === level);
    if (!items.length) return "";
    const towns = [...new Set(items.map(school => school.town))];
    const content = grouped
      ? towns.map(town => { const inTown = items.filter(school => school.town === town); return `<p><a href="${areaPath(findArea(inTown[0].areas[0]))}">${town}</a>${inTown.map(schoolLink).join(" · ")}</p>`; }).join("")
      : `<p>${items.map(schoolLink).join(" · ")}</p>`;
    return `<article><h3>${label}<small>${items.length}개교</small></h3>${content}</article>`;
  }).join("")}</div>`;
}
const citySchoolBlocks = list => cities.map(city => { const inCity = list.filter(school => school.city === city.name); return inCity.length ? `<div class="school-city"><div class="region-title"><p><a href="${areaPath(city)}">${city.name}</a></p><span>${inCity.length}개교</span></div>${schoolGrid(inCity, true)}</div>` : ""; }).join("");
function schoolSentence(list) {
  const sample = level => list.filter(school => school.level === level).slice(0, 2).map(school => school.name).join("·");
  const parts = [
    sample("초등") && `${sample("초등")} 등 초등학생은 학교 진도에 맞춘 기초수학`,
    sample("중등") && `${sample("중등")} 등 중학생은 학교별 수학내신과 서술형`,
    sample("고등") && `${sample("고등")} 등 고등학생은 수학내신과 수능수학`
  ].filter(Boolean);
  const international = list.some(school => school.level === "국제") ? " 국제학교 학생은 학교 커리큘럼과 진도를 확인해 수업 방향을 정합니다." : "";
  return `${parts.join(", ")}을 중심으로 준비합니다. 학교마다 다른 시험 범위와 부교재를 확인해 수업에 반영합니다.${international}`;
}

// 학교별 페이지: 학교 고유 정보(개교 연도·설립 구분·주소·같은 지역 학교)로 페이지마다 내용이 달라지도록 구성합니다.
const schoolCopy = {
  초등: {
    tagline: "학교 진도와 단원평가에 맞춰 기초수학과 수학공부 습관을 함께 잡습니다.",
    title: name => `${name} 초등 수학·기초수학 1:1`,
    description: (school, short, loc) => `${short} 학생 1:1 수학과외. ${school.name} 학교 진도와 단원평가에 맞춘 초등 기초수학·연산·서술형 수업과 수학공부 습관 관리. ${loc} 상담 ${phone}`,
    intro: [
      (school, short, loc) => `${loc}에 있는 ${school.name}(${school.founded}년 개교·${school.type}) 학생을 위한 초등 수학 수업입니다. 학교 진도와 단원평가를 기준으로 연산·분수·도형 같은 기초수학의 빈틈을 먼저 확인합니다.`,
      (school, short, loc) => `${short} 학생의 초등 수학공부는 학교에서 배우는 단원을 놓치지 않는 것에서 시작합니다. ${loc} ${school.name}의 학기 진도에 맞춰 개념 설명과 직접 풀이를 반복합니다.`,
      (school, short, loc) => `${school.founded}년 개교한 ${loc}의 ${school.type} 초등학교, ${school.name}. 학생마다 이해 속도가 다르기 때문에 ${short} 초등 수학수업은 현재 학년의 핵심 단원부터 차근히 점검합니다.`
    ],
    steps: [["단원평가 확인", "최근 단원평가와 학교 수학 익힘 문제에서 틀린 유형을 확인합니다."], ["기초수학 점검", "연산·분수·도형 가운데 다음 단원에 필요한 기초를 먼저 다집니다."], ["서술형 연습", "문제를 읽고 식으로 바꾸는 과정을 말과 글로 설명하게 합니다."], ["복습 루틴", "수업이 없는 날의 과제량을 정해 꾸준한 수학공부 습관을 만듭니다."]],
    faq: short => [`${short} 학생도 기초수학부터 시작할 수 있나요?`, "네. 연산, 분수, 도형 중 어느 부분에서 막히는지 확인한 뒤 현재 학년 진도와 함께 기초수학을 단계적으로 보완합니다."]
  },
  중등: {
    tagline: "학교별 시험 범위와 서술형까지 반영해 수학내신을 준비합니다.",
    title: name => `${name} 수학내신·서술형 대비 1:1`,
    description: (school, short, loc) => `${short} 학생 1:1 수학과외. ${school.name} 시험 범위·학교 프린트·서술형에 맞춘 중등 수학내신 대비와 기초수학 보완. ${loc} 상담 ${phone}`,
    intro: [
      (school, short, loc) => `${loc}에 있는 ${school.name}(${school.founded}년 개교·${school.type}) 학생을 위한 중등 수학 수업입니다. 학교별 시험 범위와 서술형 비중을 확인해 ${short} 수학내신을 준비합니다.`,
      (school, short, loc) => `${short} 수학내신은 같은 교과서를 쓰더라도 학교 프린트와 서술형 출제 방식에 따라 준비 방법이 달라집니다. ${loc} ${school.name}의 시험 일정에 맞춰 개념 정리부터 실전 점검까지 계획을 세웁니다.`,
      (school, short, loc) => `${school.founded}년 개교한 ${loc}의 ${school.type} 중학교, ${school.name}. ${short} 학생의 기초수학 빈틈을 보완하면서 학기별 수학내신과 다음 학년 준비를 함께 설계합니다.`
    ],
    steps: [["시험 범위 확인", "학교 공지와 교과서, 학교 프린트로 시험 범위를 정리합니다."], ["개념 정리", "시험 4주 전까지 단원별 개념과 기본 유형을 정리합니다."], ["학교 유형 연습", "서술형과 수행평가를 포함해 학교 출제 경향에 맞춘 문제를 풉니다."], ["실전 점검", "시험 직전 제한 시간 안에 풀어 보고 오답을 마지막으로 정리합니다."]],
    faq: short => [`${short} 서술형과 수행평가도 준비하나요?`, "네. 풀이 과정을 식과 문장으로 정리하는 연습을 매 수업 진행하고, 수행평가 일정과 과제도 함께 확인합니다."]
  },
  고등: {
    tagline: "학교 부교재와 기출 경향을 반영한 수학내신, 그리고 수능수학까지 함께 설계합니다.",
    title: name => `${name} 수학내신·수능수학 1:1`,
    description: (school, short, loc) => `${short} 학생 1:1 수학과외. ${school.name} 부교재·기출 경향을 반영한 고등 수학내신과 수능수학·수능대비, 기초수학 보완까지. ${loc} 상담 ${phone}`,
    intro: [
      (school, short, loc) => `${loc}에 있는 ${school.name}(${school.founded}년 개교·${school.type}) 학생을 위한 고등 수학 수업입니다. 학교 부교재와 기출 경향을 반영한 수학내신, 그리고 수능수학 대비를 함께 설계합니다.`,
      (school, short, loc) => `${short} 수학내신은 학교마다 다른 부교재와 변별력 문항에 대비하는 것이 핵심입니다. ${loc} ${school.name}의 시험 일정에 맞춰 내신을 준비하고, 시험 이후에는 수능대비로 이어갑니다.`,
      (school, short, loc) => `${school.founded}년 개교한 ${loc}의 ${school.type} 고등학교, ${school.name}. ${short} 학생의 기초수학 보완부터 모의고사 분석, 수능수학 실전 연습까지 단계적으로 관리합니다.`
    ],
    steps: [["시험 범위·부교재", "학교 교과서와 부교재, 프린트 범위를 확인합니다."], ["개념과 변별 문항", "개념의 조건과 예외를 정리해 고난도 문항에 대비합니다."], ["학교 기출 경향", "학교 시험의 출제 경향에 맞춰 유형을 연습합니다."], ["내신 이후 수능", "시험이 끝나면 수능수학 기출과 모의고사 분석으로 이어갑니다."]],
    faq: short => [`${short} 학생의 수능수학 대비도 가능한가요?`, "가능합니다. 학기 중에는 수학내신 비중을 높이고, 방학과 시험 이후에는 수능 기출 분석과 모의고사 실전 연습 비중을 높입니다."]
  },
  국제: {
    tagline: "학교 진도와 과제를 확인해 막히는 수학 개념을 보완합니다.",
    title: (name, loc) => `${loc} 국제학교 수학 1:1`,
    description: (school, short, loc) => `${school.name} 학생 1:1 수학과외. 학교 진도와 과제에 맞춰 막히는 수학 개념을 보완하고 평가 일정에 맞춰 준비합니다. ${loc} 영어교육도시 상담 ${phone}`,
    intro: [(school, short, loc) => `${loc} 제주영어교육도시에 있는 국제학교 ${school.name}(${school.founded}년 개교) 학생을 위한 1:1 수학 수업입니다. 학교 진도와 과제를 확인하고 막히는 개념을 한국어로 정리한 뒤 원래 표현과 연결합니다.`],
    steps: [["학교 진도 확인", "수업 자료와 과제로 현재 학교 진도를 확인합니다."], ["개념 보완", "막히는 개념을 한국어로 정리하고 학교에서 쓰는 표현과 연결합니다."], ["과제·평가 대비", "학교 과제와 평가 일정에 맞춰 연습 문제를 준비합니다."], ["진로 연계", "학년과 진로 계획에 맞춰 필요한 수학 과정을 함께 점검합니다."]],
    faq: short => [`${short} 학교 과제와 평가도 함께 준비할 수 있나요?`, "네. 학교 수업 자료와 과제, 평가 일정을 확인해 필요한 개념과 연습 문제를 준비합니다."]
  }
};

function schoolPage(school, index) {
  const copy = schoolCopy[school.level];
  const short = schoolShort(school);
  const loc = `${school.city} ${school.town}`;
  const levelInfo = levels.find(level => level.key === school.level);
  const label = schoolLevels.find(([key]) => key === school.level)[1];
  const city = cities.find(item => item.name === school.city);
  const areas = school.areas.map(findArea);
  const neighbours = schools.filter(other => other !== school && other.areas.some(slug => school.areas.includes(slug)));
  const faqs = [
    [`${short} 시험 범위에 맞춰 수업하나요?`, `네. ${school.name}의 ${school.level === "초등" ? "학기 진도와 단원평가" : school.level === "국제" ? "수업 자료와 평가 일정" : "시험 범위와 교과서·부교재"}를 확인해 수업 계획을 세웁니다.`],
    copy.faq(short),
    [`${short} 학생은 어디에서 수업하나요?`, `${areas.map(area => area.name).join("·")} 지역 안내를 기준으로, 대면 수업 가능 여부와 시간은 세부 위치와 희망 일정에 따라 상담 후 안내합니다.`],
    ["상담은 어떻게 신청하나요?", `${phone}로 전화하시면 학생의 학년, 최근 성적, 목표를 듣고 수업 방향을 안내합니다.`]
  ];
  const facts = [["학교명", school.name], ["학교급", label], ["설립 구분", school.type], ["개교", `${school.founded}년`], ["소재지", school.address], ["지역 안내", areas.map(area => `<a href="${areaPath(area)}">${area.name} 수학과외</a>`).join(" · ")]];
  const gradeSection = levelInfo ? `<section class="grade-section"><div class="wrap"><div class="section-heading light"><div><p class="kicker">BY GRADE</p><h2>${short} 학년별<br>수학 수업</h2></div><p>학년마다 필요한 개념과 공부 방법이 다릅니다.</p></div><div class="grade-grid cols-2">${levelInfo.grades.map(([name, text], gradeIndex) => `<article class="grade-card"><span>0${gradeIndex + 1}</span><h3>${short} ${name} 수학</h3><p>${text}</p></article>`).join("")}</div></div></section>` : "";
  const neighbourSection = neighbours.length ? `<section class="schools"><div class="wrap"><div class="section-heading compact"><div><p class="kicker">NEARBY SCHOOLS</p><h2>${areas[0].name} 다른 학교<br>수학 수업 안내</h2></div><p>같은 지역 학교의 수학 수업 안내도 확인할 수 있습니다.</p></div>${schoolGrid(neighbours, false)}</div></section>` : "";
  const body = `<main id="main" class="local-page">
    <section class="local-hero"><div class="wrap"><nav class="breadcrumbs" aria-label="현재 위치"><a href="/">제주</a><span>/</span><a href="${areaPath(city)}">${school.city}</a><span>/</span><a href="${areaPath(areas[0])}">${areas[0].name}</a><span>/</span><strong>${school.name}</strong></nav><p class="eyebrow">${loc} · SCHOOL MATH</p><h1>${short}<br>수학과외</h1><p>${school.name} 학생을 위한 1:1 맞춤 수학 수업. ${copy.tagline}</p></div></section>
    <section class="local-intro"><div class="wrap section-heading"><div><p class="kicker">SCHOOL PROFILE</p><h2>${short} 학생을 위한<br>수학 수업</h2></div><div><p>${copy.intro[index % copy.intro.length](school, short, loc)}</p><dl class="school-facts">${facts.map(([term, value]) => `<div><dt>${term}</dt><dd>${value}</dd></div>`).join("")}</dl></div></div></section>
    <section class="levels"><div class="wrap"><div class="section-heading compact"><div><p class="kicker">STUDY PLAN</p><h2>${short} ${school.level === "초등" ? "수학 수업" : school.level === "국제" ? "수학 학습" : "수학내신"}<br>준비 과정</h2></div><p>${school.name}의 일정과 학생의 현재 실력을 기준으로 아래 순서로 진행합니다.</p></div><div class="topic-grid">${copy.steps.map(([heading, text], stepIndex) => `<article><b>0${stepIndex + 1}</b><h3>${heading}</h3><p>${text}</p></article>`).join("")}</div>${levelInfo ? `<p class="level-more"><a href="${levelPath(levelInfo)}">제주 ${levelInfo.key} 수학과외 전체 안내 →</a></p>` : ""}</div></section>
    ${gradeSection}
    ${neighbourSection}
    ${faqSection(`${short} 수학과외<br>자주 묻는 질문`, faqs)}
    <section class="local-cta"><div class="wrap"><div><p class="kicker">CONSULTATION</p><h2>${short} 수학과외 상담</h2></div><a class="button button-citrus" href="${phoneLink}" aria-label="${phone}로 전화 상담">${phone} <span>☎</span></a></div></section>
  </main>`;
  return layout({
    title: `${short} 수학과외 | ${copy.title(school.name, loc)}`,
    description: copy.description(school, short, loc),
    canonical: `${siteUrl}${schoolPath(school)}`,
    breadcrumbs: [["제주 수학과외", `${siteUrl}/`], [`${city.name} 수학과외`, `${siteUrl}${areaPath(city)}`], [`${areas[0].name} 수학과외`, `${siteUrl}${areaPath(areas[0])}`], [`${short} 수학과외`, `${siteUrl}${schoolPath(school)}`]],
    faqs,
    body
  });
}

const heroImage = "https://images.unsplash.com/photo-1535189043414-47a3c49a0bed?auto=format&fit=crop&w=1600&q=70";
const indexNowKey = (await readFile(path.join(root, "src", "indexnow-key.txt"), "utf8")).trim();

function layout({ title, description, canonical, body, breadcrumbs = [], faqs = [], noindex = false, preloadImage }) {
  const graph = [
    {
      "@type": "EducationalOrganization",
      "@id": `${siteUrl}/#organization`,
      name: "제주 수학과외",
      url: `${siteUrl}/`,
      logo: `${siteUrl}/apple-touch-icon.png`,
      telephone: "+82-10-2928-3614",
      areaServed: [...cities, ...regions].map(area => ({ "@type": "AdministrativeArea", name: area.type === "시" ? `제주특별자치도 ${area.name}` : `${area.city} ${area.name}` })),
      knowsAbout: ["초등 수학", "중등 수학", "고등 수학", "기초수학", "수학내신", "수능수학", "수능대비"]
    },
    { "@type": "WebSite", "@id": `${siteUrl}/#website`, name: "제주 수학과외", url: `${siteUrl}/`, inLanguage: "ko-KR", publisher: { "@id": `${siteUrl}/#organization` } },
    { "@type": "WebPage", "@id": `${canonical}#webpage`, url: canonical, name: title, description, inLanguage: "ko-KR", dateModified: lastUpdated, isPartOf: { "@id": `${siteUrl}/#website` }, about: { "@id": `${siteUrl}/#organization` } }
  ];
  if (breadcrumbs.length) graph.push({ "@type": "BreadcrumbList", itemListElement: breadcrumbs.map(([name, url], index) => ({ "@type": "ListItem", position: index + 1, name, item: url })) });
  if (faqs.length) graph.push({ "@type": "FAQPage", mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) });
  if (!noindex) pages.push({ title, description, url: canonical });

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  ${noindex ? '<meta name="robots" content="noindex">' : `<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">
  <link rel="canonical" href="${canonical}">`}
  <meta name="naver-site-verification" content="044544c41c6aa3979986fd9912b17b85cd82adc5">
  <meta name="google-site-verification" content="WXFdoOwFb2R59oiI-PXgL5uYDhWaYWBE7siZCPZX4oM">
  <meta name="theme-color" content="#183c35">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="제주 수학과외">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ogImage}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.ico" sizes="32x32">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="alternate" type="application/rss+xml" title="제주 수학과외" href="${siteUrl}/rss.xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=IBM+Plex+Sans+KR:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/style.css">${preloadImage ? `
  <link rel="preload" as="image" href="${preloadImage}" fetchpriority="high">` : ""}
  <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script>
</head>
<body>
  <a class="skip-link" href="#main">본문으로 바로가기</a>
  <header class="site-header"><div class="wrap nav-inner"><a class="brand" href="/"><span>JEJU</span><strong>제주 수학과외</strong></a><nav aria-label="주요 메뉴"><a href="/#method">수업 방식</a>${levels.map(level => `<a href="${levelPath(level)}">${level.key} 수학</a>`).join("")}<a href="/#areas">지역 찾기</a></nav><a class="nav-cta" href="${phoneLink}" aria-label="${phone}로 전화 상담">전화 상담</a></div></header>
  ${body}
  <footer><div class="wrap footer-inner"><div><a class="brand footer-brand" href="/"><span>JEJU</span><strong>제주 수학과외</strong></a><p>학생의 이해에서 시작하는 초등·중등·고등 1:1 맞춤 수학 수업</p><nav class="footer-links" aria-label="바로가기">${levels.map(level => `<a href="${levelPath(level)}">제주 ${level.key} 수학</a>`).join("")}${cities.map(city => `<a href="${areaPath(city)}">${cityShort(city.name)} 수학과외</a>`).join("")}</nav></div><p><a class="footer-phone" href="${phoneLink}">상담 ${phone}</a><br>© 2026 제주 수학과외</p></div></footer>
</body>
</html>`;
}

function homePage() {
  const cityLinks = cities.map(city => `<a class="city-link" href="${areaPath(city)}"><span>${city.name} 전 지역</span><strong>${city.name} 수학과외</strong><i aria-hidden="true">→</i></a>`).join("");
  const regionGroups = cities.map(city => `<section class="region-group"><div class="region-title"><p>${city.name}</p><span>${regions.filter(region => region.city === city.name).length}개 읍·면·동</span></div><div class="region-grid">${regions.filter(region => region.city === city.name).map(region => `<a href="${areaPath(region)}"><small>${region.type}</small><strong>${region.name} 수학과외</strong><span aria-hidden="true">↗</span></a>`).join("")}</div></section>`).join("");
  const levelCards = levels.map(level => `<a class="level-card" href="${levelPath(level)}"><small>${level.eyebrow}</small><h3>제주 ${level.key} 수학</h3><p>${level.summary}</p>${pointList(level)}<span class="more">${level.key} 수학과외 안내 →</span></a>`).join("");
  const countIn = name => regions.filter(region => region.city === name).length;
  const faqs = [
    ["제주 수학과외는 어떤 학생이 수업하나요?", "제주시와 서귀포시의 초등학생, 중학생, 고등학생이 대상입니다. 초등 기초수학부터 중등 수학내신, 고등 수능수학과 수능대비까지 학년과 목표에 맞춰 수업합니다."],
    ["첫 수업 전에 무엇을 준비하면 되나요?", "최근 시험지, 사용 중인 교재나 문제집, 학교 시험 범위를 준비해 주시면 현재 학습 상태를 정확하게 진단할 수 있습니다."],
    ["수학학원과 1:1 수학과외는 무엇이 다른가요?", "학원은 정해진 진도로 여러 학생이 함께 배우는 반면, 1:1 수학과외는 학생 한 명의 취약 단원과 속도에 맞춰 수업 순서를 조정합니다. 학원과 병행하며 부족한 부분만 보완하는 것도 가능합니다."],
    ["수업 지역은 어디까지인가요?", `제주시 ${countIn("제주시")}개, 서귀포시 ${countIn("서귀포시")}개 읍·면·동의 지역별 안내를 제공합니다. 대면 수업 가능 여부와 시간은 세부 위치와 일정에 따라 상담 후 안내합니다.`],
    ["상담은 어떻게 하나요?", `${phone}로 전화하시면 학생의 학년, 거주 지역, 최근 성적과 목표를 듣고 필요한 수업 방향을 안내합니다.`]
  ];
  const body = `<main id="main">
    <section class="hero"><img src="${heroImage}" alt="돌담과 기와지붕이 이어진 골목 풍경" width="1600" height="900" fetchpriority="high" decoding="async"><div class="hero-shade"></div><div class="wrap hero-content"><p class="eyebrow">JEJU · PRIVATE MATH COACHING</p><h1>제주<br>수학과외</h1><p class="hero-copy">답을 외우기 전에 원리를 이해하도록.<br>초등 기초수학부터 중등 수학내신, 고등 수능수학까지 1:1 수학 수업.</p><div class="hero-actions"><a class="button button-citrus" href="#areas">우리 동네 수업 찾기 <span>↓</span></a><a class="button button-ghost" href="${phoneLink}" aria-label="${phone}로 전화 상담">${phone} <span>☎</span></a></div></div><div class="hero-facts">${levels.map(level => `<a href="${levelPath(level)}">${level.key} 수학</a>`).join("")}<span>내신 · 선행 · 수능</span><span>제주 전 지역 상담</span></div></section>
    <section class="intro" id="method"><div class="wrap"><div class="section-heading"><div><p class="kicker">01 · LESSON METHOD</p><h2>풀이보다 먼저<br>막힌 지점을 찾습니다</h2></div><p>같은 문제를 틀려도 이유는 다릅니다. 개념이 비어 있는지, 조건을 놓쳤는지, 계산 습관이 흔들리는지 먼저 구분한 뒤 학생에게 필요한 수업 순서를 정합니다.</p></div><div class="method-grid"><article><b>01</b><h3>현재 학습 진단</h3><p>최근 시험지와 교재에서 정확한 취약 지점을 확인합니다.</p></article><article><b>02</b><h3>개인 진도 설계</h3><p>학교 일정, 목표 성적, 학습 가능 시간을 함께 반영합니다.</p></article><article><b>03</b><h3>이해 중심 수업</h3><p>풀이의 이유를 학생이 자신의 말로 설명하도록 돕습니다.</p></article><article><b>04</b><h3>오답 습관 관리</h3><p>반복되는 실수를 기록하고 다음 학습 계획에 반영합니다.</p></article></div></div></section>
    <section class="levels" id="levels"><div class="wrap"><div class="section-heading"><div><p class="kicker">02 · SCHOOL LEVEL</p><h2>초등부터 고등까지,<br>단계별 수학 수업</h2></div><p>제주 초등 수학은 기초수학과 공부 습관, 중등 수학은 학교별 수학내신, 고등 수학은 내신과 수능수학의 균형에 집중합니다.</p></div><div class="level-grid">${levelCards}</div><nav class="grade-links light" aria-label="학년별 페이지">${gradePages.map(grade => `<a href="${gradePath(grade)}">${grade.key} 수학과외</a>`).join("")}</nav></div></section>
    <section class="grade-section" id="grades"><div class="wrap"><div class="section-heading light"><div><p class="kicker">03 · GRADE TRANSITION</p><h2>새 학년의 시작,<br>연결이 중요합니다</h2></div><p>무리한 선행보다 다음 과정에 필요한 이전 개념을 정확하게 이어 붙이는 일이 먼저입니다.</p></div><div class="grade-grid">${gradeCards}</div></div></section>
    <section class="study-scene"><div class="study-photo"><img src="https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1400&q=85" alt="수학 공식과 도형이 적힌 학습 공간" loading="lazy"></div><div><p class="kicker">A ROUTINE THAT LASTS</p><h2>수업이 없는 날에도<br>스스로 이어가도록</h2><p>과외 시간에만 풀 수 있는 문제는 오래 남지 않습니다. 문제를 읽고, 조건을 표시하고, 풀이를 검토하는 루틴을 반복해 혼자 수학공부할 때의 기준을 만듭니다.</p><ul><li>학교별 시험 범위와 일정 반영</li><li>매 수업 오답 원인 기록</li><li>개인별 과제량과 복습 주기 조정</li></ul></div></section>
    <section class="areas" id="areas"><div class="wrap"><div class="section-heading"><div><p class="kicker">04 · LOCAL CLASS</p><h2>제주 우리 동네<br>수학과외 찾기</h2></div><p>제주시와 서귀포시, 각 읍·면·동의 지역별 수업 안내를 확인하세요. 가까운 생활권을 기준으로 꾸준히 이어갈 수 있는 학습 계획을 제안합니다.</p></div><div class="city-grid">${cityLinks}</div>${regionGroups}</div></section>
    <section class="schools" id="schools"><div class="wrap"><div class="section-heading"><div><p class="kicker">05 · SCHOOLS</p><h2>제주 학교별<br>수학 내신 대비</h2></div><p>제주 초등학교 ${schools.filter(school => school.level === "초등").length}곳, 중학교 ${schools.filter(school => school.level === "중등").length}곳, 고등학교 ${schools.filter(school => school.level === "고등").length}곳의 학교별 진도와 시험 범위를 반영합니다. 학교 이름 옆 지역을 누르면 동네별 수업 안내로 이동합니다.</p></div>${citySchoolBlocks(schools)}</div></section>
    ${faqSection("제주 수학과외<br>자주 묻는 질문", faqs)}
    <section class="consult" id="consult"><div class="wrap consult-inner"><div><p class="kicker">CONSULTATION</p><h2>현재 고민에서<br>상담을 시작합니다</h2></div><div><p>학생의 학년, 거주 지역, 최근 성적과 목표를 기준으로 필요한 수업 방향을 정리합니다. 아래 번호를 누르면 바로 전화로 상담할 수 있습니다.</p><a class="button button-dark" href="${phoneLink}" aria-label="${phone}로 전화 상담">${phone} <span>☎</span></a></div></div></section>
  </main>`;
  return layout({
    title: "제주 수학과외 | 초등·중등·고등 1:1 수학 내신·수능 대비",
    description: `제주시·서귀포시 초등 기초수학, 중등 수학내신, 고등 수능수학까지 1:1 맞춤 수학과외. 현재 실력을 진단하고 학교 진도에 맞춰 수업합니다. 전화 상담 ${phone}`,
    canonical: `${siteUrl}/`,
    preloadImage: heroImage,
    breadcrumbs: [["제주 수학과외", `${siteUrl}/`]],
    faqs,
    body
  });
}

function gradePage(grade, index) {
  const level = levels.find(item => item.key === grade.level);
  const previous = gradePages[index - 1];
  const next = gradePages[index + 1];
  const schoolCount = schools.filter(school => school.level === grade.level).length;
  const directory = cities.map(city => `<section class="region-group"><div class="region-title"><p>${city.name}</p><span>${regions.filter(region => region.city === city.name).length + 1}개 지역</span></div><div class="region-grid">${[city, ...regions.filter(region => region.city === city.name)].map(area => `<a href="${areaPath(area)}#${level.slug}"><small>${area.type === "시" ? `${area.name} 전 지역` : area.name}</small><strong>${shortName(area)} ${grade.key} 수학과외</strong><span aria-hidden="true">↗</span></a>`).join("")}</div></section>`).join("");
  const moreLinks = [
    previous && `<a href="${gradePath(previous)}">← 제주 ${previous.key} 수학과외<span>${previous.headline}</span></a>`,
    next && `<a href="${gradePath(next)}">제주 ${next.key} 수학과외 →<span>${next.headline}</span></a>`,
    `<a href="${levelPath(level)}">제주 ${level.key} 수학 전체 안내<span>→</span></a>`,
    `<a href="/#schools">제주 학교별 수학 내신<span>→</span></a>`
  ].filter(Boolean).join("");
  const faqs = [
    ...grade.faqs,
    [`제주 ${grade.key} 수학과외는 어디에서 수업하나요?`, "제주시와 서귀포시 각 읍·면·동 안내를 기준으로, 대면 수업 가능 여부와 시간은 세부 위치와 희망 일정에 따라 상담 후 안내합니다."],
    ["상담은 어떻게 신청하나요?", `${phone}로 전화하시면 학생의 학교, 최근 성적, 목표를 듣고 ${grade.key} 수학 수업 방향을 안내합니다.`]
  ];
  const body = `<main id="main" class="local-page">
    <section class="local-hero"><div class="wrap"><nav class="breadcrumbs" aria-label="현재 위치"><a href="/">제주</a><span>/</span><a href="${levelPath(level)}">${level.key} 수학</a><span>/</span><strong>${grade.key}</strong></nav><p class="eyebrow">JEJU · ${grade.full}</p><h1>제주<br>${grade.key} 수학과외</h1><p>${grade.full} 수학, ${grade.headline}까지 학교 진도와 학생의 속도에 맞춘 1:1 수업.</p></div></section>
    <section class="local-intro"><div class="wrap section-heading"><div><p class="kicker">CURRICULUM</p><h2>${grade.key} 수학에서<br>배우는 것</h2></div><div><p>${grade.intro}</p><ul class="unit-list">${grade.units.map(unit => `<li>${unit}</li>`).join("")}</ul><p class="unit-note">단원 이름과 순서는 교과서와 학교 편성에 따라 조금씩 다를 수 있어 첫 수업에서 학생의 교과서를 함께 확인합니다.</p></div></div></section>
    <section class="levels"><div class="wrap"><div class="section-heading compact"><div><p class="kicker">CHECK POINTS</p><h2>${grade.key} 수학에서<br>자주 막히는 지점</h2></div><p>제주 ${grade.key} 학생의 최근 시험지와 교재를 보고 아래 지점부터 확인합니다.</p></div><div class="topic-grid cols-3">${grade.struggles.map(([heading, text], itemIndex) => `<article><b>0${itemIndex + 1}</b><h3>${heading}</h3><p>${text}</p></article>`).join("")}</div></div></section>
    <section class="intro"><div class="wrap"><div class="section-heading compact"><div><p class="kicker">STUDY PLAN</p><h2>${grade.key} 수학<br>수업 진행 순서</h2></div><p>제주 ${level.key} 학교 ${schoolCount}곳의 진도와 시험 범위를 학교별로 확인해 반영합니다.</p></div><div class="topic-grid">${schoolCopy[grade.level].steps.map(([heading, text], stepIndex) => `<article><b>0${stepIndex + 1}</b><h3>${heading}</h3><p>${text}</p></article>`).join("")}</div></div></section>
    <section class="areas"><div class="wrap"><div class="section-heading"><div><p class="kicker">LOCAL CLASS</p><h2>지역별<br>${grade.key} 수학과외</h2></div><p>제주시와 서귀포시 각 읍·면·동의 ${level.key} 수학 수업 안내로 바로 이동합니다.</p></div>${directory}</div></section>
    ${faqSection(`${grade.key} 수학과외<br>자주 묻는 질문`, faqs)}
    <section class="local-details"><div class="wrap detail-grid"><article><p class="kicker">MORE</p><h2>다른 학년<br>수학 안내</h2></article><article><div class="nearby-links grade-nav">${moreLinks}</div></article></div></section>
    <section class="local-cta"><div class="wrap"><div><p class="kicker">CONSULTATION</p><h2>제주 ${grade.key} 수학과외 상담</h2></div><a class="button button-citrus" href="${phoneLink}" aria-label="${phone}로 전화 상담">${phone} <span>☎</span></a></div></section>
  </main>`;
  return layout({
    title: `제주 ${grade.key} 수학과외 | ${grade.full} ${grade.headline} 1:1`,
    description: `제주 ${grade.key} 수학과외. ${grade.full} ${grade.units.slice(0, 4).join("·")} 등 학교 진도와 내신에 맞춘 1:1 맞춤 수학 수업. 제주시·서귀포시 상담 ${phone}`,
    canonical: `${siteUrl}${gradePath(grade)}`,
    breadcrumbs: [["제주 수학과외", `${siteUrl}/`], [`제주 ${level.key} 수학`, `${siteUrl}${levelPath(level)}`], [`제주 ${grade.key} 수학과외`, `${siteUrl}${gradePath(grade)}`]],
    faqs,
    body
  });
}

function levelPage(level) {
  const directory = cities.map(city => `<section class="region-group"><div class="region-title"><p>${city.name}</p><span>${regions.filter(region => region.city === city.name).length + 1}개 지역</span></div><div class="region-grid">${[city, ...regions.filter(region => region.city === city.name)].map(area => `<a href="${areaPath(area)}#${level.slug}"><small>${area.type === "시" ? `${area.name} 전 지역` : area.name}</small><strong>${shortName(area)} ${level.key} 수학</strong><span aria-hidden="true">↗</span></a>`).join("")}</div></section>`).join("");
  const otherLevels = levels.filter(other => other !== level).map(other => `<a href="${levelPath(other)}">제주 ${other.key} 수학과외<span>→</span></a>`).join("");
  const body = `<main id="main" class="local-page">
    <section class="local-hero"><div class="wrap"><nav class="breadcrumbs" aria-label="현재 위치"><a href="/">제주</a><span>/</span><strong>${level.key} 수학</strong></nav><p class="eyebrow">JEJU · ${level.eyebrow}</p><h1>제주<br>${level.key} 수학</h1><p>${level.lead}</p></div></section>
    <section class="intro"><div class="wrap"><div class="section-heading"><div><p class="kicker">LESSON FOCUS</p><h2>제주 ${level.key} 수학과외,<br>이렇게 수업합니다</h2></div><p>${level.summary} 학생마다 막히는 지점이 다르기 때문에 첫 수업에서 최근 시험지와 교재를 함께 보고 수업 순서를 정합니다.</p></div><div class="topic-grid${level.topics.length > 4 ? " cols-3" : ""}">${level.topics.map(([heading, text], index) => `<article><b>0${index + 1}</b><h3>${heading}</h3><p>${text}</p></article>`).join("")}</div></div></section>
    <section class="grade-section"><div class="wrap"><div class="section-heading light"><div><p class="kicker">BY GRADE</p><h2>학년별<br>${level.key} 수학과외</h2></div><p>같은 학교급 안에서도 학년마다 필요한 개념과 공부 방법이 다릅니다.</p></div><div class="grade-grid cols-2">${level.grades.map(([name, text], index) => `<article class="grade-card"><span>0${index + 1}</span><h3>제주 ${name} 수학과외</h3><p>${text}</p></article>`).join("")}</div><nav class="grade-links" aria-label="학년별 페이지">${gradePages.filter(grade => grade.level === level.key).map(grade => `<a href="${gradePath(grade)}">제주 ${grade.key} 수학과외</a>`).join("")}</nav></div></section>
    <section class="areas"><div class="wrap"><div class="section-heading"><div><p class="kicker">LOCAL CLASS</p><h2>지역별<br>${level.key} 수학 찾기</h2></div><p>제주시와 서귀포시 각 읍·면·동의 ${level.key} 수학 수업 안내로 바로 이동합니다.</p></div>${directory}</div></section>
    <section class="schools"><div class="wrap"><div class="section-heading"><div><p class="kicker">SCHOOLS</p><h2>제주 ${schoolLevels.find(([key]) => key === level.key)[1]}별<br>${level.key} 수학 내신</h2></div><p>제주시와 서귀포시 ${schoolLevels.find(([key]) => key === level.key)[1]} ${schools.filter(school => school.level === level.key).length}곳의 진도와 시험 범위를 학교별로 확인해 수업에 반영합니다.</p></div>${citySchoolBlocks(schools.filter(school => school.level === level.key))}</div></section>
    ${faqSection(`${level.key} 수학<br>자주 묻는 질문`, level.faqs)}
    <section class="local-details"><div class="wrap detail-grid"><article><p class="kicker">MORE</p><h2>다른 학교급<br>수학 안내</h2></article><article><div class="nearby-links">${otherLevels}<a href="/#areas">제주 지역별 수학과외<span>→</span></a></div></article></div></section>
    <section class="local-cta"><div class="wrap"><div><p class="kicker">CONSULTATION</p><h2>제주 ${level.key} 수학 상담</h2></div><a class="button button-citrus" href="${phoneLink}" aria-label="${phone}로 전화 상담">${phone} <span>☎</span></a></div></section>
  </main>`;
  return layout({
    title: level.title,
    description: level.description,
    canonical: `${siteUrl}${levelPath(level)}`,
    breadcrumbs: [["제주 수학과외", `${siteUrl}/`], [`제주 ${level.key} 수학`, `${siteUrl}${levelPath(level)}`]],
    faqs: level.faqs,
    body
  });
}

// 지역 페이지끼리 문장이 똑같아지지 않도록 학교급별 설명을 지역 순서에 따라 바꿔 씁니다.
const levelCopy = {
  elementary: [
    (s, n) => `${s} 초등 수학수업은 연산과 분수, 도형처럼 다음 학년의 바탕이 되는 기초수학부터 점검합니다. 문제를 끝까지 읽고 식을 세우는 수학공부 습관을 함께 잡습니다.`,
    (s, n) => `${n} 초등학생은 학교 단원평가와 문제집 오답을 보고 수업 순서를 정합니다. 계산 실수와 문장제 이해를 나눠 확인하고 ${s} 초등 기초수학의 빈틈을 차례로 메웁니다.`,
    (s, n, near) => `${near} 생활권 초등학생이 무리 없는 분량으로 수학공부를 이어가도록 돕습니다. ${s} 초등 수학은 원리 설명과 직접 풀이를 반복하며 기초수학을 단단히 합니다.`
  ],
  middle: [
    (s, n) => `${s} 중등 수학은 학교별 시험 범위에 맞춘 수학내신 대비와 서술형 풀이 연습을 중심으로 진행합니다. 기초수학이 흔들리는 단원은 이전 개념부터 다시 연결합니다.`,
    (s, n) => `${n} 중학생의 최근 시험지를 보고 개념, 계산, 서술형 중 어디에서 점수를 잃었는지 확인합니다. ${s} 중등 수학수업은 그 결과를 바탕으로 다음 수학내신 계획을 세웁니다.`,
    (s, n) => `${s} 중등 수학공부는 평소 진도 복습과 시험 기간 수학내신 대비를 나눠 관리합니다. 시험 4주 전부터는 교과서·학교 프린트·기출 유형 중심으로 전환합니다.`
  ],
  high: [
    (s, n) => `${s} 고등 수학은 학교별 수학내신과 수능수학을 함께 설계합니다. 학기 중에는 내신, 방학에는 수능대비 비중을 높여 두 목표의 균형을 맞춥니다.`,
    (s, n) => `${n} 고등학생은 모의고사와 내신 결과를 단원·유형별로 나눠 분석합니다. ${s} 고등 수학수업은 부족한 기초수학을 보완하며 수능대비 실전 연습으로 이어집니다.`,
    (s, n) => `${s} 고등 수학공부는 공통수학의 기초를 다진 뒤 대수·미적분Ⅰ·확률과 통계로 확장합니다. 수능수학 기출 분석과 시간 관리 훈련으로 수능대비를 마무리합니다.`
  ]
};

function areaPage(area, index) {
  const isCity = area.type === "시";
  const childRegions = isCity ? regions.filter(region => region.city === area.name) : [];
  const nearby = (isCity ? childRegions : regions.filter(region => region.city === area.city && region.slug !== area.slug).slice(0, 8));
  const summary = isCity ? area.summary : `${area.nearby}`;
  const areaName = area.name;
  const cityName = isCity ? area.name : area.city;
  const short = shortName(area);
  const alias = aliases[area.slug];
  const remote = ["chuja", "udo"].includes(area.slug);
  const areaSchools = schoolsFor(area);
  const intro = isCity
    ? `${areaName} 수학과외는 읍·면·동별 학교 일정과 학생의 생활권을 함께 고려합니다. 최근 시험지와 교재를 바탕으로 개념 이해, 풀이 순서, 계산 습관 가운데 어디에서 막혔는지 확인합니다.`
    : `${cityName} ${areaName} 수학과외는 최근 시험지와 현재 사용하는 교재를 먼저 살펴봅니다. 정답 개수만 확인하지 않고 개념 이해, 풀이 순서, 계산 습관 중 어디에서 막혔는지 구분해 다음 학습량을 정합니다.${alias ? ` ${alias} 생활권 학생의 학교 일정도 함께 반영합니다.` : ""}`;
  const levelCards = levels.map(level => `<article class="level-card" id="${level.slug}"><small>${level.eyebrow}</small><h3>${short} ${level.key} 수학</h3><p>${levelCopy[level.slug][index % 3](short, areaName, summary)}</p>${pointList(level)}<p class="grade-tags"><b>${short} 학년별 수학과외</b>${gradeTagLinks(level.gradeTags)}</p><a class="more" href="${levelPath(level)}">제주 ${level.key} 수학 자세히 →</a></article>`).join("");
  const faqs = [
    [`${short} 초등 기초수학부터 시작할 수 있나요?`, "네. 최근 단원평가나 문제집을 보고 연산, 분수, 도형 중 어느 부분에서 막히는지 확인한 뒤 기초수학부터 단계적으로 수업합니다."],
    [`${short} 중학생 수학내신 대비는 어떻게 하나요?`, `${areaName} 학생이 다니는 학교의 시험 범위와 서술형 비중을 확인하고, 시험 4주 전부터 교과서·학교 프린트·기출 유형 중심으로 준비합니다.`],
    [`${short} 고등학생 수능수학 대비도 가능한가요?`, "가능합니다. 학기 중에는 수학내신, 방학과 시험 이후에는 수능대비 비중을 높이고 모의고사 결과에 맞춰 계획을 조정합니다."],
    [`${areaName} 수학과외 수업 장소와 시간은 어떻게 정하나요?`, `세부 위치와 희망 일정에 따라 대면 수업 가능 여부와 시간을 상담 후 안내합니다.${remote ? " 이동이 어려운 경우 온라인 수업도 함께 고려합니다." : ""}`],
    ["상담은 어떻게 신청하나요?", `${phone}로 전화하시면 학생의 학년, 최근 성적, 목표를 듣고 수업 방향을 안내합니다.`]
  ];
  const regionDirectory = isCity ? `<section class="subareas"><div class="wrap"><div class="section-heading compact"><div><p class="kicker">LOCAL DIRECTORY</p><h2>${areaName} 읍·면·동 안내</h2></div><p>가까운 지역을 선택해 세부 수업 안내를 확인하세요.</p></div><div class="region-grid">${childRegions.map(region => `<a href="${areaPath(region)}"><small>${region.type}</small><strong>${region.name} 수학과외</strong><span aria-hidden="true">↗</span></a>`).join("")}</div></div></section>` : "";
  const nearbyLinks = nearby.map(item => `<a href="${areaPath(item)}">${item.name} 수학과외<span>→</span></a>`).join("");
  const parentCity = isCity ? null : cities.find(city => city.name === area.city);
  const body = `<main id="main" class="local-page">
    <section class="local-hero"><div class="wrap"><nav class="breadcrumbs" aria-label="현재 위치"><a href="/">제주</a><span>/</span>${parentCity ? `<a href="${areaPath(parentCity)}">${area.city}</a><span>/</span>` : ""}<strong>${areaName}</strong></nav><p class="eyebrow">${cityName} · LOCAL MATH COACHING</p><h1>${areaName}<br>수학과외</h1><p>${summary}에서 만나는 초등·중등·고등 1:1 맞춤 수학 수업. ${area.focus} 방식으로 학생의 공부 흐름을 바로잡습니다.</p></div></section>
    <section class="local-intro"><div class="wrap section-heading"><div><p class="kicker">LOCAL STUDY PLAN</p><h2>가까운 곳에서<br>꾸준히 배우는 수학</h2></div><div><p>${intro}</p><p>${area.focus}. 초등 개념과 연산, 중등 내신의 서술형 풀이, 고등 수학의 개념 연결과 문제 해석까지 현재 필요한 단계에 집중합니다.</p></div></div></section>
    <section class="levels"><div class="wrap"><div class="section-heading compact"><div><p class="kicker">SCHOOL LEVEL</p><h2>${short} 학교급별<br>수학 수업 안내</h2></div><p>학교급마다 필요한 공부가 다릅니다. ${short} 학생의 학년과 목표에 맞는 수업을 확인하세요.</p></div><div class="level-grid">${levelCards}</div></div></section>
    ${regionDirectory}
    <section class="schools" id="schools"><div class="wrap"><div class="section-heading compact"><div><p class="kicker">SCHOOLS</p><h2>${short} ${areaSchools.nearby ? "인근 " : ""}학교별<br>수학 내신 대비</h2></div><p>${schoolSentence(areaSchools.list)}</p></div>${isCity ? schoolGrid(areaSchools.list, true) : schoolGrid(areaSchools.list, false)}</div></section>
    <section class="grade-section local-grades" id="grades"><div class="wrap"><div class="section-heading light"><div><p class="kicker">GRADE TRANSITION</p><h2>${areaName} 학년별<br>수학 학습 안내</h2></div><p>학년 전환기의 복습과 선행을 학생별 이해도에 맞춰 조정합니다.</p></div><div class="grade-grid">${gradeCards}</div></div></section>
    <section class="local-details"><div class="wrap detail-grid"><article><p class="kicker">LESSON FOCUS</p><h2>${areaName} 학생에게 맞는<br>현실적인 계획</h2><p>학교별 시험 일정과 학생의 생활 패턴을 고려해 무리하지 않고 이어갈 수 있는 주간 계획을 세웁니다. 대면 수업 가능 여부와 시간은 세부 위치와 희망 일정에 따라 상담 후 안내합니다.</p></article><article><p class="kicker">NEARBY AREAS</p><h3>${isCity ? `${areaName} 세부 지역` : `${cityName} 다른 지역`} 수학과외</h3><div class="nearby-links">${nearbyLinks}</div></article></div></section>
    ${faqSection(`${short} 수학과외<br>자주 묻는 질문`, faqs)}
    <section class="local-cta"><div class="wrap"><div><p class="kicker">CONSULTATION</p><h2>${areaName} 수학과외 상담</h2></div><a class="button button-citrus" href="${phoneLink}" aria-label="${phone}로 전화 상담">${phone} <span>☎</span></a></div></section>
  </main>`;
  const breadcrumbs = [["제주 수학과외", `${siteUrl}/`], ...(parentCity ? [[`${parentCity.name} 수학과외`, `${siteUrl}${areaPath(parentCity)}`]] : []), [`${areaName} 수학과외`, `${siteUrl}${areaPath(area)}`]];
  return layout({
    title: isCity ? `${short} 수학과외 | ${areaName} 초등·중등·고등 수학 1:1 수업` : `${short} 수학과외 | ${area.city} ${areaName} 초등·중등·고등 수학 1:1`,
    description: `${isCity ? areaName : `${area.city} ${areaName}`} 초등 기초수학, 중등 수학내신, 고등 수능수학·수능대비까지 1:1 맞춤 수학과외. 현재 실력 진단 후 학교 진도에 맞춰 수업합니다. 상담 ${phone}`,
    canonical: `${siteUrl}${areaPath(area)}`,
    breadcrumbs,
    faqs,
    body
  });
}

// 외부 이미지 도구 없이 파비콘(PNG·ICO)을 만듭니다: 숲색 배경 위 귤색 더하기 기호
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = buffer => { let c = 0xffffffff; for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function pngChunk(type, data) {
  const length = Buffer.alloc(4); length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const checksum = Buffer.alloc(4); checksum.writeUInt32BE(crc(body));
  return Buffer.concat([length, body, checksum]);
}
function iconPng(size) {
  const center = size / 2, bar = size * .17, arm = size * .3;
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3);
    for (let x = 0; x < size; x++) {
      const dx = Math.abs(x + .5 - center), dy = Math.abs(y + .5 - center);
      const plus = (dx < bar / 2 && dy < arm) || (dy < bar / 2 && dx < arm);
      Buffer.from(plus ? [0xf2, 0xbd, 0x3d] : [0x18, 0x3c, 0x35]).copy(row, 1 + x * 3);
    }
    rows.push(row);
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(size, 0); header.writeUInt32BE(size, 4); header.set([8, 2, 0, 0, 0], 8);
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), pngChunk("IHDR", header), pngChunk("IDAT", deflateSync(Buffer.concat(rows))), pngChunk("IEND", Buffer.alloc(0))]);
}
function iconIco(size) {
  const png = iconPng(size);
  const header = Buffer.alloc(22);
  header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
  header.set([size, size, 0, 0], 6); header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14); header.writeUInt32LE(22, 18);
  return Buffer.concat([header, png]);
}
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#183c35"/><path d="M26.6 12.8h10.8v13.8h13.8v10.8H37.4v13.8H26.6V37.4H12.8V26.6h13.8z" fill="#f2bd3d"/></svg>\n`;

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, "assets"), { recursive: true });
await writeFile(path.join(dist, "assets", "style.css"), await readFile(path.join(root, "src", "style.css"), "utf8"));
await writeFile(path.join(dist, "index.html"), homePage());
for (const level of levels) {
  await mkdir(path.join(dist, level.slug), { recursive: true });
  await writeFile(path.join(dist, level.slug, "index.html"), levelPage(level));
}
for (const [index, area] of [...cities, ...regions].entries()) {
  const directory = path.join(dist, "areas", area.slug);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), areaPage(area, index));
}
for (const [index, grade] of gradePages.entries()) {
  await mkdir(path.join(dist, "grades", grade.slug), { recursive: true });
  await writeFile(path.join(dist, "grades", grade.slug, "index.html"), gradePage(grade, index));
}
for (const [index, school] of schools.entries()) {
  const directory = path.join(dist, "schools", schoolSlug(school));
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), schoolPage(school, index));
}

const priority = url => url === `${siteUrl}/` ? "1.0" : levels.some(level => url.endsWith(levelPath(level))) || cities.some(city => url.endsWith(areaPath(city))) ? "0.9" : url.includes("/grades/") ? "0.8" : url.includes("/schools/") ? "0.6" : "0.7";
await writeFile(path.join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(page => `\n  <url><loc>${page.url}</loc><lastmod>${lastUpdated}</lastmod><changefreq>weekly</changefreq><priority>${priority(page.url)}</priority></url>`).join("")}\n</urlset>\n`);
const pubDate = new Date(`${lastUpdated}T09:00:00+09:00`).toUTCString();
await writeFile(path.join(dist, "rss.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>제주 수학과외</title><link>${siteUrl}/</link><description>제주 초등·중등·고등 1:1 수학과외 지역별·학교급별 수업 안내</description><language>ko</language><lastBuildDate>${pubDate}</lastBuildDate>${pages.map(page => `\n  <item><title>${esc(page.title)}</title><link>${page.url}</link><guid>${page.url}</guid><description>${esc(page.description)}</description><pubDate>${pubDate}</pubDate></item>`).join("")}\n</channel></rss>\n`);
await writeFile(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
await writeFile(path.join(dist, "CNAME"), "tutorup.kr\n");
await writeFile(path.join(dist, `${indexNowKey}.txt`), `${indexNowKey}\n`);
await writeFile(path.join(dist, ".nojekyll"), "");
await writeFile(path.join(dist, "favicon.svg"), faviconSvg);
await writeFile(path.join(dist, "favicon.ico"), iconIco(32));
await writeFile(path.join(dist, "apple-touch-icon.png"), iconPng(180));
await writeFile(path.join(dist, "404.html"), layout({ title: "페이지를 찾을 수 없습니다 | 제주 수학과외", description: "요청하신 페이지를 찾을 수 없습니다.", canonical: `${siteUrl}/404.html`, noindex: true, body: `<main id="main" class="not-found"><div><p class="kicker">404 ERROR</p><h1>페이지를 찾을 수 없습니다</h1><p>주소가 변경되었거나 존재하지 않는 페이지입니다.</p><a class="button button-citrus" href="/">홈으로 돌아가기</a></div></main>` }));
console.log(`Built ${pages.length} pages for ${siteUrl}`);
