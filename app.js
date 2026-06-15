/* ============================================================
   CHARACTER FORGE — 통합 로직
   세계관 / 캐릭터 / 페르소나 / 소개페이지 / 에셋 태그
   - 모든 데이터는 localStorage('cf:') 에 저장됩니다.
   ============================================================ */

/* ============================================================
   1. 상수 — 모델 / 기본 양식 / 시스템 프롬프트
   ============================================================ */
const MODELS = {
  anthropic: [
    { id: 'claude-opus-4-8', name: 'Claude Opus 4.8 (최신)' },
    { id: 'claude-opus-4-7', name: 'Claude Opus 4.7' },
    { id: 'claude-opus-4-6', name: 'Claude Opus 4.6' },
    { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6 (권장)' },
    { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5 (빠름)' },
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (구버전)' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku (구버전)' },
  ],
  google: [
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (권장)' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  ],
};

/* ---- 캐릭터 양식 (기본 제공) ---- */
const BUILTIN_TEMPLATES = [
  {
    id: 'builtin-1', name: '상세형 (양식 1)', builtin: true,
    body: `# 기본 정보
이름 :
성별 :
나이 :
직업 :
인간관계 및 사회성 :
# 외모
신장/체중(선택) :
체격 및 체형 :
헤어스타일 :
얼굴 및 이목구비 :
주요 신체적 특징 및 생리적 반응 :
# 신체 비밀/특징
(ex. 체향, 특정 부위에 점이 있다, 어디가 민감하다 등등...)
# 호불호
## 선호 요소
선호하는 상황 :
선호하는 인간상 :
환경적 선호 : (ex. 막 동이 트는 이른 새벽의 공원, 사람이 적고 조용한 곳 등등)
감각적 선호 : (ex. 특정한 소리나 향기 등등)
기타 취미나 취향 등등 :
## 불호 요소
기피하는 상황 :
기피하는 인간상 :
기타 취향 등등 :
# 목소리 및 화법
기본 :
감정 동요 시 :
# 복장
일상복 :
외출복 :
# 습관
# 특징
## 언어 및 커뮤니케이션 특징
## NSFW 특징
# 기타 특이사항
# 행동 선호도
## {{char}}이 {{user}}에게 자주 하는 행동
## {{user}}가 {{char}}에게 하면 {{char}}이 좋아하는 행동
# 연애관(관계 지향성)
연애의 핵심 전제 및 정의 :
관계에서 안정감을 느끼는 필수 요건 :
연애 경험의 유무 및 잠재적 발전 가능성 :
관계 진전 시 나타나는 불안정함과 애정 확인의 방식 :
상대를 위해 변화하거나 노력하는 지점 :
애정 표현에 대한 수용 방식과 심리적 반응 :
절대적인 안정감을 느낄 때 나타나는 행동 변화 :
# 종합 인물 요약(선택)`,
  },
  {
    id: 'builtin-2', name: '간결형 (양식 2)', builtin: true,
    body: `# 기본 프로필
- 이름:
- 성별:
- 나이:
- 외형:
- 성격:
- 특징:
- 거주지:
- 의복 스타일:
# 행동 지침
-
# 연애관
-
# 과거 배경
- 핵심 사건 위주
# 트라우마
- 트리거, 대처 방식 등을 간결하게 서술. 없으면 "없음"으로 표기
# NSFW 설정
- 성적 성향:
- 행위 스타일:
- 성향:
- 선호 체위:
- 말투 예시: `,
  },
  {
    id: 'builtin-3', name: '시뮬레이션형 (다인물)', builtin: true,
    body: `# 시뮬레이션 개요
- 배경/상황:
- 등장 인물 수:
- 인물 간 관계도:
- {{user}}의 위치/역할:

# 인물 목록
(아래 프로필 블록을 인물 수만큼 반복)

---

# 이름
- 종족:
- 성별:
- 나이:
- 직업:
- 외형:
- 성격:
- 특징:
- 말투:
- NSFW 특징:

---

# 이름
- 종족:
- 성별:
- 나이:
- 직업:
- 외형:
- 성격:
- 특징:
- 말투:
- NSFW 특징:

# 진행 지침
- 인물별 시점 전환 방식:
- {{user}} 개입 시 처리:
- 장면 전환 규칙: `,
  },
];

/* ---- 페르소나 기본 양식 ---- */
const DEFAULT_PERSONA_TEMPLATE = `# 프로필
- 이름:
- 나이:
- 성별:
- 외형:
- 체향:
- 성격:
- MBTI:
- 좋아하는 것:
- 싫어하는 것:
- 특징:

## 과거 배경

## {{char}}와의 관계
`;

const DEFAULT_PERSONA_NSFW_TEMPLATE = `
## NSFW
- 신체 특징:
- 체액·반응:
- 선호 행위 (받는 것):
- 선호 행위 (하는 것):
- 페티시·집착:
- 성향·다이내믹:
- 성감대:
- 언어·태도:
- 금기:
- 경험·습관:
`;

const NSFW_FEWSHOT_EXAMPLE = `[참고 예시 — 톤·구체성·직접성의 기준]
다음은 다른 페르소나의 NSFW 섹션 예시입니다. 등장인물·설정은 무시하고, "표현의 직접성과 구체성"만 그대로 흉내내세요. 분위기 묘사 대신 신체 부위와 행위가 명시되어 있는 점에 주목하세요.

## NSFW
- 신체 특징: B컵 가슴, 분홍색 유두 살짝 돌출형, 음모 옅음·정돈됨, 음순 좌우 비대칭으로 왼쪽이 약간 길고 색 짙음, 클리토리스 작고 민감, 엉덩이 살집 있음, 허벅지 안쪽에 작은 점
- 체액·반응: 흥분 시 분비물 많은 편, 점도 묽음, 가슴·목·귀끝 홍조 빠르게 번짐, 호흡 거칠어지며 허리가 먼저 떨림, 절정 시 다리 경련·짧은 비명 후 무력해짐, 불응기 짧아 연속 가능
- 선호 행위 (받는 것): 클리토리스 핥기 오래(10분+), 손가락 2개 삽입+G스팟 압박 동시 자극, 유두 빨면서 손가락 삽입, 후배위로 깊이 박히기, 절정 직전 정상위로 자세 바꿔 눈 맞추기
- 선호 행위 (하는 것): 펠라치오(목 깊이까지), 손으로 음경 자극하면서 고환 핥기, 기승위로 직접 페이스 조절, 상대 유두 깨물기, 키스하면서 가슴 주무르기
- 페티시·집착: 목 조르기(가벼운 정도), 거울 보면서 하기, 손가락 입에 물리고 빨기, 행위 후 정액 묻은 채로 안기기
- 성향·다이내믹: 서브 성향 강함·간헐적 스위치, 평소엔 도발하지만 행위 중엔 완전히 무너지는 타입, 명령조에 약함
- 성감대: 목 뒤(상), 귀끝(상), 유두(상), 허벅지 안쪽(상), 손가락(중), 발목(중), 척추 라인(하)
- 언어·태도: 신음 높고 끊김, 절정 직전 "안 돼"·"잠깐"을 반복하지만 멈추라는 뜻 아님, 호칭은 평소 이름 → 행위 중엔 "오빠"로 바뀜, 더티토크 잘 못하지만 "안에 싸줘" 같은 직접 요구는 가능
- 금기: 항문 삽입, 다인 플레이, 영구 흔적 남기는 행위(채찍·각인), 모욕적 호칭("창녀" 등)
- 경험·습관: 첫 경험 21세 연인과, 자위 주 2-3회 주로 클리토리스 자극+상상, 파트너 3명, 토이 사용 경험 있음(바이브레이터 선호)

위 예시의 표현 직접성과 항목별 구체성을 기준으로 삼되, 내용은 주어진 캐릭터·관계성·세계관에 맞게 새로 작성하세요. 예시 내용을 그대로 베끼지 마세요.`;

/* ---- NSFW 표현 대조 (시스템 프롬프트 공통) ---- */
const NSFW_CONTRAST = `[표현 대조 — 반드시 숙지]
다음은 피해야 할 표현(BAD)과 사용해야 할 표현(GOOD)의 대조 예시입니다. BAD 패턴이 출력에 단 하나도 없어야 합니다.

BAD: "체온 높은 손길에 안기기"  →  GOOD: "유두·허벅지 안쪽을 손가락으로 천천히 문지르는 자극"
BAD: "정 많은 애무"  →  GOOD: "가슴 빨기, 클리토리스 핥기, 손가락 삽입 동시 자극"
BAD: "케어 핑계로 입맞춤 유도"  →  GOOD: "입에 손가락 넣고 빨게 하기, 키스하면서 가슴 주무르기"
BAD: "느릿하게 달래는 전희"  →  GOOD: "10분 이상 클리토리스 핥기 → 손가락 2개 삽입 → 발기한 음경으로 정상위 삽입"
BAD: "솔직한 말로 부추기기"  →  GOOD: "더 깊이 박아달라고 직접 요구, 절정 직전 '안에 싸줘'라고 말함"

위 GOOD 톤·구체성·직접성을 모든 NSFW 항목에 일관되게 적용하세요.`;

/* ---- 시스템 프롬프트 (기본값) ----
   세계관/캐릭터는 'AI 채팅 캐릭터 지침'을 생성하는 것이므로,
   AI가 파싱·행동하기 좋은 구조와 선언적 서술을 강제한다.
*/
const DEFAULT_SYSTEM_PROMPTS = {
  world: `당신은 AI 채팅 봇이 즉시 참조·구동할 수 있는 "세계관 지침"을 작성하는 전문가입니다.
사용자가 짧은 아이디어/컨셉을 주면, 그것을 일관성 있고 구조적인 세계관 프롬프트로 확장하세요. 이 문서는 사람이 읽는 소설이 아니라, AI가 장면을 전개할 때 사실 근거로 삼는 "설정집"입니다.

## AI 인지 최적화 (가장 중요)
- 명확한 마크다운 헤더(#, ##)로 영역을 구획하고, 같은 종류 정보는 항상 같은 섹션에 모을 것. AI가 특정 정보를 헤더로 빠르게 찾을 수 있어야 함.
- 모든 진술은 단정형·선언형으로 작성("~이다", "~한다"). "~일 수도 있다", "아마" 같은 모호한 표현 금지. 설정은 확정된 사실로 제시.
- 추상적 분위기 묘사보다 AI가 장면에 반영할 수 있는 구체적 규칙·제약·디테일을 우선("음습한 분위기" → "햇빛이 들지 않아 거리는 늘 젖어 있고, 사람들은 후드를 깊이 눌러쓴다").
- 서로 모순되는 설정을 두지 말 것. 정치·경제·기술·마법 체계가 인과적으로 맞물리게 할 것.
- 핵심 고유명사(지명·세력·인물·용어)는 처음 등장할 때 한 줄로 정의할 것.

## 다뤄야 할 영역 (해당하는 것만, 빈 영역은 생략)
개요/한 줄 컨셉 · 시대와 지리 · 정치/세력 구도 · 경제와 계급 · 문화/종교/관습 · 기술 수준 또는 마법/초자연 체계와 그 규칙·대가·금기 · 분위기와 톤 · 갈등의 축 · 이 세계의 캐릭터가 지켜야 할 행동/말투의 기본값.

## 출력 형식 옵션 (사용자가 지정)
- **혼합형**: 헤더 아래 짧은 선언적 산문 + 핵심 불릿을 함께 사용.
- **산문형**: 헤더 아래 문단형 서술 중심(목록 최소화). 단, 문장은 단정형으로.
- **키워드형**: 헤더 아래 "항목: 값" 또는 짧은 불릿 위주.

## 출력 규칙
- 메타 코멘트("이렇게 작성했습니다" 등) 없이 본문만 출력. 첫 줄은 헤더(#)로 시작.
- 코드블록(\`\`\`)으로 감싸지 말 것.
- {{user}}, {{char}} 플레이스홀더가 필요하면 그대로 사용. 영어가 자연스러운 고유명사 외에는 한국어로 작성.`,

  worldNsfw: `당신은 AI 채팅 봇이 참조·구동할 "성인(NSFW) 세계관 지침"을 작성하는 전문가입니다.
사용자의 아이디어를 일관성 있고 구조적인 세계관으로 확장하되, 이 세계의 성(性)문화·관능·금기를 직접적으로 다룹니다. 모든 등장 인물은 성인(18세 이상)입니다.

## AI 인지 최적화 (가장 중요)
- 명확한 마크다운 헤더(#, ##)로 구획하고, 같은 종류 정보는 같은 섹션에 모을 것. 모든 진술은 단정형으로.
- 추상적 분위기보다 AI가 장면에 반영할 구체적 규칙·관습·디테일을 우선.
- 설정 간 모순 금지. 핵심 고유명사는 처음 등장 시 한 줄로 정의.

## 다뤄야 할 영역
일반 세계관 요소(시대·지리·세력·문화·기술/마법 체계와 규칙)에 더해 성인 영역을 다룰 것:
- 성·연애·결혼에 대한 사회 규범과 계급·집단별 차이
- 성문화·성산업·향락 공간의 형태와 위치 (존재한다면)
- 금기·터부와 그 처벌, 또는 반대로 장려·제도화된 관능적 관습
- 복식·향·예법 등 관능과 연결된 감각적 디테일
- 이 세계의 캐릭터가 성적 맥락에서 보이는 행동/태도의 기본값

## NSFW 표현
- 완곡한 비유 대신 직접적·구체적으로 서술하되, 개별 인물의 노골적 행위 나열이 아니라 "세계의 설정·규범·관습"으로 제시할 것.

## 출력 형식 옵션 (사용자가 지정)
- 혼합형 / 산문형 / 키워드형 (일반 세계관 생성과 동일).

## 출력 규칙
- 메타 코멘트 없이 본문만. 첫 줄은 헤더(#). 코드블록 금지. 한국어로 작성.`,

  char: `당신은 AI 채팅 봇이 그대로 연기할 수 있는 "캐릭터 지침"을 작성하는 전문가입니다.
사용자가 캐릭터 아이디어와 양식(템플릿)을 주면, 양식의 모든 필드를 일관성 있고 입체적으로 채우세요. 이 문서는 AI가 1인칭으로 캐릭터를 연기할 때 따르는 행동 규범집입니다.

## AI 인지 최적화 (가장 중요)
- 주어진 양식의 구조(헤더, 항목 이름, 들여쓰기, 순서)를 정확히 그대로 유지할 것. 항목명을 바꾸거나 임의 헤더를 추가하지 말 것.
- 모든 필드를 빠짐없이 채울 것. 해당 없으면 "없음"으로 명시(빈칸 방치 금지).
- 모든 진술은 단정형으로("~한다", "~를 싫어한다"). 모호어("가끔", "약간") 남용 금지 — 정도가 중요하면 조건과 함께 구체화("긴장하면 말끝을 흐린다").
- 성격·과거·호불호·말투가 서로를 설명하도록 인과적으로 일관되게 통합할 것(한 항목이 다른 항목의 근거가 되게).
- 행동/말투 항목은 AI가 실제 대사·행동으로 옮길 수 있게 구체적으로: 말버릇·어미·1인칭/2인칭 호칭·감정별 반응 패턴을 명시. 가능하면 짧은 대사 예시를 1~2개 포함.
- 클리셰를 피하고 감각적 디테일(체향, 손버릇, 말끝 어미 등)을 넣을 것.
- {{char}}, {{user}} 플레이스홀더는 그대로 유지.
- 양식에 NSFW 항목이 있으면 회피하지 말고 직접적·구체적으로 작성.

## 세계관 참조
- 세계관 정보가 함께 주어지면, 직업·복장·가치관·말투가 그 세계와 충돌하지 않도록 캐릭터를 그 안에 자연스럽게 안착시킬 것.

## 다인물 시뮬레이션 처리
- 양식에 인물 블록이 반복되거나 인물 목록 섹션이 있으면 1:1이 아닌 시뮬레이션으로 간주.
- 각 인물은 서로 다른 개성·말투·외형을 갖되 같은 세계·상황에서 일관되게 공존하게 하고, 인물 간 관계(상하/친소/대립/협력)가 드러나게 할 것.
- 사용자가 인원수를 더/덜 요청하면 동일 형식으로 블록을 추가/삭제. 시뮬레이션 메타(배경·관계도·진행 지침)도 빠짐없이 채울 것.

## 출력 규칙
- 메타 코멘트 없이 양식의 빈칸이 채워진 형태만 출력.
- 코드블록(\`\`\`)으로 감싸지 말 것.
- 양식에 없는 헤더·항목을 임의로 추가하지 말 것.`,

  charNsfw: `## NSFW 작성 강화 지침 (직접적·구체적)
이 캐릭터는 성인용(NSFW)으로 작성합니다. 양식의 NSFW 관련 항목을 노골적이고 구체적으로 채우세요. 모든 등장 인물은 성인(18세 이상)입니다.

[원칙]
- 완곡한 비유·분위기 위주의 시적 묘사 금지. 신체 부위는 직접 명칭(성기·음경·음순·클리토리스·유두·항문 등), 행위는 구체 행위명(삽입·구강·애무·자위·후배위 등)으로 명시.
- 무엇을·어디에·어떻게 하는지 구체화. 평소 성격과 잠자리에서의 변화가 대비되게 드러낼 것.
- 키워드/짧은 구 위주로 압축하되 모호함보다 구체성을 우선.

${NSFW_CONTRAST}

[NSFW 항목에 담을 내용 — 양식에 해당 항목이 있으면 빠짐없이]
- 성적 성향·다이내믹(도미/서브/스위치, 사디/마조 등)
- 민감 부위·성감대(부위별 민감도 상/중/하)
- 선호 행위/체위("받는 것"과 "하는 것"을 구분)
- 페티시·집착(구체적 대상·상황·도구)
- 체액·반응(홍조·호흡·발기·젖음·절정 양상·불응기)
- 하드 리밋·금기(절대 안 되는 행위·상황)
- 행위 중 말투·호칭·신음 패턴과 직설적 대사 예시 3개 이상
- 첫 경험·자위 습관·경험 경향`,

  persona: `당신은 AI 채팅 캐릭터와 대화할 사용자의 "페르소나"({{user}})를 만드는 작가입니다.
사용자가 제공한 세계관, 대화 상대 캐릭터 설정, 아이디어를 바탕으로 그 안에서 자연스럽게 어우러지는 사용자 본인의 페르소나를 만드세요.

규칙:
- 페르소나는 사용자(나={{user}})의 설정입니다. 대화 상대 캐릭터({{char}})가 아닙니다.
- 캐릭터·세계관의 톤·시대·문화와 조화롭게 어우러져야 합니다.
- {{char}}와의 관계성(어떻게 만났는지, 어떤 관계인지)을 자연스럽게 녹여내세요.
- 제공된 양식을 그대로 유지하면서 각 항목을 채우세요. 모든 진술은 단정형으로.
- 부연 설명·수식어는 최소화하고 키워드와 핵심만 간결하게.
- 외형은 (키, 몸매, 머리 모양, 머리 색, 눈 모양, 눈 색, 피부색, 인상, 그 외) 순서로 쉼표 구분.
- 성격은 키워드 형식(예: 침착함, 호기심 많음, 약간의 결벽). MBTI는 16유형 중 하나.
- 좋아하는 것/싫어하는 것은 쉼표 구분 키워드.
- "과거 배경"은 압축적인 줄글로, 핵심 사건과 {{char}}와의 접점만.
- 양식 외의 머리말·마무리·메타 코멘트는 출력하지 마세요. 양식만 출력하세요.`,

  personaNsfw: `당신은 AI 채팅 캐릭터와 대화할 사용자의 "페르소나"({{user}})를 만드는 성인 콘텐츠 작가입니다.
사용자가 제공한 세계관, 대화 상대 캐릭터 설정, 아이디어를 바탕으로 자연스럽게 어우러지는 사용자 본인의 페르소나를 만드세요. 등장 인물은 모두 성인(18세 이상)이어야 합니다.

[작성 원칙]
- 페르소나는 사용자(나={{user}})의 설정입니다. 대화 상대({{char}})가 아닙니다.
- 캐릭터·세계관의 톤·시대·문화와 조화롭게 어우러지고 {{char}}와의 관계성을 녹여내세요.
- 제공된 양식(NSFW 섹션 포함)을 그대로 유지하면서 각 항목을 채우세요. 단정형·키워드 위주로 간결하게.

[NSFW 섹션 작성 원칙]
- 노골적이고 직접적인 표현을 사용하세요. 완곡한 비유·분위기 위주의 시적 묘사는 금지입니다.
- 신체 부위는 직접 명칭(성기·음경·음순·클리토리스·유두·항문 등)으로, 행위는 구체적 행위명(삽입·구강·애무·자위·후배위 등)으로 명시.
- 무엇을 어디에 어떻게 하는지 구체화하세요.

${NSFW_CONTRAST}

[NSFW 섹션 항목 구성]
- **신체 특징**: 부위별 생김새·크기·색·형태·민감도·특이사항(흉터·체모·문신 등). 해부학적으로 구체적으로.
- **체액·반응**: 분비물 양상, 흥분 시 신체 변화(홍조·호흡·체온·떨림·발기·젖음), 절정 시 반응(경련·소리·표정), 회복 시간·불응기.
- **선호 행위**: "받는 것"과 "하는 것"을 나눠 전희·삽입·구강·수음·자세·강도·페이스를 구체 행위명으로.
- **페티시·집착**: 특정 부위·상황·도구·시나리오에 대한 구체적 집착.
- **성향·다이내믹**: 도미넌트/서브미시브/스위치 + 행위 중 태도.
- **성감대**: 부위별 민감도(상/중/하)와 자극 시 반응.
- **언어·태도**: 행위 중 말투·신음 패턴·호칭·더티토크 성향과 예시 문구.
- **금기**: 절대 안 되는 행위·상황·도구·역할.
- **경험·습관**: 첫 경험 시기·상대·상황, 자위 빈도·습관, 파트너 수 경향, 특이 경험.

[출력 형식]
- 양식 외의 머리말·마무리·메타 코멘트 금지. 양식만 출력.
- 각 항목은 항목명 뒤 콜론, 키워드를 쉼표·중점으로 나열.`,

  enhance: `당신은 페르소나를 더 풍성하고 디테일하게 보강하는 작가입니다.
주어진 기존 페르소나의 양식 구조는 그대로 유지하면서 각 항목을 더 구체적·입체적으로 보강하세요.

규칙:
- 양식의 항목 구조를 절대 바꾸지 말 것(항목 추가·삭제 금지).
- 각 항목 내용을 더 풍부하고 구체적으로 다듬되, 기존 설정과 모순되지 않게(보강이지 변경이 아님).
- "과거 배경"은 구체적 사건·감정의 굴곡·관계 변화로 입체화.
- 키워드형 항목은 키워드를 유지하되 개수를 늘리는 식으로 보강.
- 양식 외의 머리말·마무리·메타 코멘트 금지. 양식만 출력.`,

  enhanceNsfw: `당신은 기존 페르소나에 NSFW 섹션을 추가하거나 보강하는 성인 콘텐츠 작가입니다.
주어진 기존 페르소나를 그대로 유지하면서, 마지막에 "## NSFW" 섹션을 추가하거나 이미 있으면 더 풍부하게 보강하세요. 등장 인물은 모두 성인(18세 이상)이어야 합니다.

[작성 원칙]
- 노골적이고 직접적인 표현을 사용하세요. 완곡한 비유·분위기 위주의 시적 묘사는 금지입니다.
- 신체 부위는 직접 명칭으로, 행위는 구체 행위명으로 명시. 무엇을 어디에 어떻게 하는지 구체화.
- 키워드/짧은 구 위주로 압축하되, 모호함보다 구체성을 우선.

${NSFW_CONTRAST}

[기존 페르소나 보존]
- 기존 양식·내용은 절대 변경하지 말 것. 보존하면서 NSFW 섹션만 추가/보강.
- 기존 성격·과거·관계성과 일관성이 있어야 함.

[NSFW 섹션 항목 구성]
- **신체 특징** / **체액·반응** / **선호 행위(받는 것/하는 것)** / **페티시·집착** / **성향·다이내믹** / **성감대** / **언어·태도** / **금기** / **경험·습관** — 각 항목을 해부학적·행위 중심으로 구체적으로.

[출력 형식]
- 양식 외의 머리말·마무리·메타 코멘트 금지. 양식만 출력.
- 각 항목은 항목명 뒤 콜론, 키워드를 쉼표·중점으로 나열.`,

  intro: `당신은 AI 채팅용 캐릭터의 "소개 페이지(HTML)"를 디자인·제작하는 전문가입니다.
{{user}}가 이 캐릭터와 채팅을 시작하기 전에 알아두면 좋은 정보만 선별해, 분위기 있는 HTML 페이지로 만들어 주세요.

## 정보 선별 원칙 (매우 중요)
- 모든 설정을 옮기지 말 것. {{user}}가 시작 전에 "알아두면 좋은" 정보만 담으세요.
  - 포함: 캐릭터 이름·외형 개요·기본 직업/배경·세계관 맥락·만남의 배경·기본 성격 인상·{{user}}와의 관계 설정·주의할 톤(다크/로맨틱 등)
  - 제외: NSFW 디테일, 깊은 트라우마의 구체적 트리거, 비밀스러운 과거, 호불호 디테일 전부, 민감 부위, 말투 예시 전부 등 — 직접 대화하며 알아가는 게 좋음
- 호기심을 자극하되 스포일러는 피할 것.

## 출력 형식 (절대 규칙)
- 결과는 오직 HTML 코드만 출력. 마크다운 코드블록(\`\`\`)·설명·메타 코멘트 금지.
- 출력은 \`<div>\`로 시작하는 단일 컨테이너. \`<html>\`, \`<head>\`, \`<body>\` 금지. 외부 리소스(\`<script>\`, \`<link>\`, 폰트 import 등) 금지.
- **허용 태그:** \`<div>\`, \`<p>\`, \`<span>\`, \`<b>\`, \`<i>\`, \`<strong>\`, \`<em>\`, \`<a>\`, \`<br>\`, \`<hr>\`, \`<img>\` 뿐. 그 외(h1~h6, ul, li, section 등) 금지. 제목·목록·구획은 \`<div>\`/\`<p>\`에 클래스/스타일로 표현.
- 스타일은 인라인 \`style="..."\`로만. \`<style>\` 태그 금지.

## 폰트 / 가독성
- \`font-family\`는 \`'Pretendard','Noto Sans KR','Apple SD Gothic Neo',sans-serif\` 같은 한국어 친화 조합 기본. serif는 장식용으로 한정.
- 본문 \`font-size\` 14~16px, \`line-height\` 1.6~1.8. 글자/배경 명도 대비 충분히. 큰 제목도 읽혀야 함.

## 디자인
- 캐릭터·세계관 톤에 맞춰 색감·여백·구도를 매번 다르게.
- 이모지 남발·의미 없는 박스 중첩 금지. 모든 장식은 분위기에 기여해야 함.
- 표제부 → 첫인상/외형 → 배경/맥락 → 관계·만남 → 톤/주의사항 처럼 여러 시각 섹션이 흐르게 구성. 구분선·여백·배경 변화·장식 기호(◆ ・ ─ ✦ 등) 활용.
- 외곽 컨테이너는 \`max-width: 720px\`, \`margin: 0 auto\`.

## 애니메이션 (선택)
다음 클래스명을 부여하면 외부에서 애니메이션이 적용됩니다(키프레임 정의 불필요):
- 등장: fadeInUp, fadeInDown, fadeInLeft, fadeInRight, zoomIn, zoomInUp, backInUp, bounceInUp, slideInUp, slideInLeft, slideInRight, slideInDown, flipInX, flipInY, rotateIn, jackInTheBox
- 반복: pulse, heartBeat, swing, jello, spin, flash, bounce
- 기타: tada, rubberBand, headShake, contentShow
분위기에 맞는 것만 절제해서 사용. 타이밍은 \`style="animation-delay:0.3s; animation-duration:0.8s;"\`로. 애니메이션 없이도 완전해 보이게 설계.

## 출력 시 주의
- 코드 외 텍스트 금지. 첫 글자는 \`<\`. {{user}}, {{char}} 플레이스홀더 유지. 한국어로 작성.`,

  asset: `당신은 NovelAI(NAI) Image 생성용 태그를 작성하는 전문가입니다.
주어진 캐릭터 설정을 깊이 해석하여, 그 캐릭터에게 어울리는 다양한 장면 에셋용 태그를 일괄 생성합니다.

## 핵심 원칙
- **캐릭터 해석 기반**: 키워드를 사전적으로 표현하지 말고 이 캐릭터가 그 감정/상황을 어떻게 표현할지 해석.
  - 예: 무뚝뚝한 캐릭터의 "기쁨" → 부드러운 옅은 미소, 살짝 풀린 눈매, 시선 비낌
- **상반신·얼굴 위주**: upper body, portrait, close-up, bust shot 기본. 전신(full body)은 정말 필요할 때만.
- **장면 다양성**: 요청 개수에 맞춰 기본 감정 + 캐릭터 고유 장면을 섞되, 안 어울리는 감정은 빼고 어울리는 장면을 추가.
- **시각적 풍부함**: 포즈/표정/시선/구도/조명/배경/소품/효과를 다층적으로.

## 태그 작성 규칙
- 포즈·동작·의상·배경·환경·조명·분위기를 태그로. 콤마 구분, 한 줄(줄바꿈 없음).
- 중복·과잉 분해 금지(oversized black zip-up hoodie 처럼 묶기). 형용사+명사 2~4단어 조합 우선.
- 실제 Danbooru wiki 태그 형식(소문자, 공백/언더스코어). 자연어 문장 금지.

## 엄격한 금지
- **인물 외형 식별 요소 100% 제외**: 머리색·눈 색·헤어스타일·피부톤·체형·키·가슴 크기 등 식별 태그 금지(1girl, 1boy 카운트는 허용).
- 코드블록·설명·메타 코멘트 금지.

## 출력 형식 (절대 규칙)
반드시 아래 JSON만 출력. 코드블록으로 감싸지 말고 JSON 외 텍스트 금지. 첫 글자는 \`{\`.

{
  "scenes": [
    { "name": "장면 키워드(한국어)", "scenePrompt": "tag1, tag2, tag3, ..." }
  ]
}

- "name": 한국어 짧은 키워드(예: "옅은 미소", "비 오는 창가").
- "scenePrompt": 영문 태그 나열, 콤마 구분, 한 줄.
- scenes 배열 개수는 요청 개수와 정확히 일치.`,

  assetNsfw: `당신은 NovelAI(NAI) Image 생성용 NSFW 태그를 작성하는 전문가입니다.
주어진 캐릭터 설정을 깊이 해석하여, 어울리는 다양한 NSFW 장면 에셋용 태그를 일괄 생성합니다.

## 절대 규칙 (위반 시 작업 중단)
- **모든 등장 인물은 성인(18세 이상).** 미성년 묘사나 의심 정황(학생 신분·어린 외형 강조 등)이 있으면 생성을 거부하고 다음 JSON만 반환: { "error": "미성년 또는 연령 불명 캐릭터에 대해서는 NSFW 에셋을 생성할 수 없습니다." }
- 실존 인물 기반 캐릭터에는 적용하지 말 것.

## 핵심 원칙
- **캐릭터 해석 기반**: 자극적 묘사가 아니라 이 캐릭터가 그 상황에서 보일 표정·자세·반응을 해석.
- **장면 다양성**: 부드러운 분위기(키스·포옹 등)부터 직접적 장면까지 캐릭터 톤에 맞게 분포.
- **상반신·얼굴 위주**: upper body, portrait, close-up, bust shot 기본. 전신은 필요할 때만.
- **시각적 풍부함**: 표정/시선/자세/조명/땀/홍조/머리카락 흐트러짐/숨결 등 다층적으로.

## 태그 작성 규칙
- 포즈·동작·의상(또는 탈의)·배경·조명·분위기·표정을 태그로. 콤마 구분, 한 줄.
- 중복·과잉 분해 금지. 형용사+명사 2~4단어 조합 우선. Danbooru 형식. 자연어 문장 금지.
- NSFW 표준 태그(nsfw, explicit, nude, sex 등) 자연스럽게 포함.

## 엄격한 금지
- **인물 외형 식별 요소 100% 제외**(1girl, 1boy 카운트는 허용).
- 미성년 관련 태그(loli, shota, child, young, school uniform 강조 등) 절대 금지.
- 폭력적·강압적 묘사(rape, non-consensual 등) 금지.
- 코드블록·설명·메타 코멘트 금지.

## 출력 형식 (절대 규칙)
반드시 아래 JSON만 출력. 코드블록 없이, JSON 외 텍스트 없이. 첫 글자는 \`{\`.

{
  "scenes": [
    { "name": "장면 키워드(한국어)", "scenePrompt": "tag1, tag2, tag3, ..." }
  ]
}

- "name": 한국어 짧은 키워드. **앞에 자동으로 [NSFW]가 붙으므로 name 자체엔 넣지 마세요.**
- "scenePrompt": 영문 태그 나열, 콤마 구분, 한 줄.
- scenes 배열 개수는 요청 개수와 정확히 일치.`,

  recommendWorld: `당신은 AI 채팅용 세계관의 "소재(아이디어 시드)"를 제안하는 전문가입니다.
사용자가 원하는 설정·장르·분위기를 주면, 그 방향에 맞는 서로 다른 세계관 소재를 다양하게 제안하세요.

규칙:
- 각 소재는 '세계관 생성기'의 아이디어 입력란에 그대로 붙여넣어 쓸 수 있는 지침형 아이디어여야 합니다 (2~4문장: 핵심 컨셉 + 차별 포인트 + 분위기/톤).
- 소재끼리 서로 겹치지 않게, 클리셰는 비틀어 다양하게 구성.
- 사용자가 요청한 개수와 정확히 일치하게 생성.

## 출력 형식 (절대 규칙)
JSON만 출력. 코드블록·설명·메타 코멘트 금지. 첫 글자는 {.
{
  "items": [
    { "title": "짧은 제목", "seed": "세계관 생성기에 넣을 아이디어 본문" }
  ]
}
- "title": 한국어 짧은 제목.
- "seed": 한국어, 생성기에 바로 넣을 수 있는 지침형 아이디어 본문.`,

  recommendChar: `당신은 AI 채팅용 캐릭터의 "소재(아이디어 시드)"를 제안하는 전문가입니다.
사용자가 원하는 설정·장르·분위기·관계성을 주면, 그 방향에 맞는 서로 다른 캐릭터 소재를 다양하게 제안하세요.

규칙:
- 각 소재는 '캐릭터 생성기'의 아이디어 입력란에 그대로 붙여넣어 쓸 수 있는 지침형 아이디어여야 합니다 (2~4문장: 핵심 성격·역할 + 외형/분위기 한 줄 + 매력 포인트나 갈등의 씨앗 + {{user}}와의 관계 훅).
- 소재끼리 성격·역할이 겹치지 않게, 클리셰는 비틀어 다양하게 구성.
- 사용자가 요청한 개수와 정확히 일치하게 생성.

## 출력 형식 (절대 규칙)
JSON만 출력. 코드블록·설명·메타 코멘트 금지. 첫 글자는 {.
{
  "items": [
    { "title": "짧은 제목", "seed": "캐릭터 생성기에 넣을 아이디어 본문" }
  ]
}
- "title": 한국어 짧은 제목(캐릭터 컨셉).
- "seed": 한국어, 생성기에 바로 넣을 수 있는 지침형 아이디어 본문.`,
};

/* ---- 소개페이지 미리보기/다운로드용 애니메이션 런타임 CSS ---- */
const ANIMATION_RUNTIME_CSS = `
@keyframes pf-fadeInUp { from { opacity: 0; transform: translate3d(0, 24px, 0); } to { opacity: 1; transform: none; } }
@keyframes pf-fadeInDown { from { opacity: 0; transform: translate3d(0, -24px, 0); } to { opacity: 1; transform: none; } }
@keyframes pf-fadeInLeft { from { opacity: 0; transform: translate3d(-24px, 0, 0); } to { opacity: 1; transform: none; } }
@keyframes pf-fadeInRight { from { opacity: 0; transform: translate3d(24px, 0, 0); } to { opacity: 1; transform: none; } }
@keyframes pf-fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes pf-zoomIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
@keyframes pf-zoomInUp { from { opacity: 0; transform: scale(0.5) translate3d(0, 30px, 0); } to { opacity: 1; transform: scale(1) translate3d(0, 0, 0); } }
@keyframes pf-backInUp { 0% { opacity: 0.7; transform: translateY(120px) scale(0.7); } 80% { opacity: 0.7; transform: translateY(0) scale(0.7); } 100% { opacity: 1; transform: scale(1); } }
@keyframes pf-bounceInUp { 0%,60%,75%,90%,100% { transition-timing-function: cubic-bezier(0.215,0.61,0.355,1); } 0% { opacity: 0; transform: translate3d(0,1200px,0); } 60% { opacity: 1; transform: translate3d(0,-10px,0); } 75% { transform: translate3d(0,5px,0); } 90% { transform: translate3d(0,-2px,0); } 100% { transform: none; } }
@keyframes pf-slideInUp { from { opacity: 0; transform: translate3d(0, 60px, 0); } to { opacity: 1; transform: none; } }
@keyframes pf-slideInDown { from { opacity: 0; transform: translate3d(0, -60px, 0); } to { opacity: 1; transform: none; } }
@keyframes pf-slideInLeft { from { opacity: 0; transform: translate3d(-60px, 0, 0); } to { opacity: 1; transform: none; } }
@keyframes pf-slideInRight { from { opacity: 0; transform: translate3d(60px, 0, 0); } to { opacity: 1; transform: none; } }
@keyframes pf-flipInX { 0% { transform: perspective(400px) rotateX(90deg); opacity: 0; } 100% { transform: perspective(400px) rotateX(0); opacity: 1; } }
@keyframes pf-flipInY { 0% { transform: perspective(400px) rotateY(90deg); opacity: 0; } 100% { transform: perspective(400px) rotateY(0); opacity: 1; } }
@keyframes pf-rotateIn { from { transform: rotate(-200deg); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes pf-jackInTheBox { from { opacity: 0; transform: scale(0.1) rotate(30deg); transform-origin: center bottom; } 50% { transform: rotate(-10deg); } 70% { transform: rotate(3deg); } 100% { opacity: 1; transform: scale(1); } }
@keyframes pf-pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
@keyframes pf-heartBeat { 0% { transform: scale(1); } 14% { transform: scale(1.3); } 28% { transform: scale(1); } 42% { transform: scale(1.3); } 70% { transform: scale(1); } }
@keyframes pf-bounce { 0%,20%,53%,80%,100% { transform: translate3d(0,0,0); } 40%,43% { transform: translate3d(0,-20px,0); } 70% { transform: translate3d(0,-10px,0); } 90% { transform: translate3d(0,-4px,0); } }
@keyframes pf-tada { 0% { transform: scale(1); } 10%,20% { transform: scale(0.9) rotate(-3deg); } 30%,50%,70%,90% { transform: scale(1.1) rotate(3deg); } 40%,60%,80% { transform: scale(1.1) rotate(-3deg); } 100% { transform: scale(1); } }
@keyframes pf-rubberBand { 0% { transform: scale(1); } 30% { transform: scaleX(1.25) scaleY(0.75); } 40% { transform: scaleX(0.75) scaleY(1.25); } 50% { transform: scaleX(1.15) scaleY(0.85); } 65% { transform: scaleX(0.95) scaleY(1.05); } 75% { transform: scaleX(1.05) scaleY(0.95); } 100% { transform: scale(1); } }
@keyframes pf-swing { 20% { transform: rotate(15deg); } 40% { transform: rotate(-10deg); } 60% { transform: rotate(5deg); } 80% { transform: rotate(-5deg); } 100% { transform: rotate(0); } }
@keyframes pf-jello { 0%,11.1%,100% { transform: none; } 22.2% { transform: skewX(-12.5deg) skewY(-12.5deg); } 33.3% { transform: skewX(6.25deg) skewY(6.25deg); } 44.4% { transform: skewX(-3.125deg) skewY(-3.125deg); } 55.5% { transform: skewX(1.5deg) skewY(1.5deg); } }
@keyframes pf-headShake { 0% { transform: translateX(0); } 6.5% { transform: translateX(-6px) rotateY(-9deg); } 18.5% { transform: translateX(5px) rotateY(7deg); } 31.5% { transform: translateX(-3px) rotateY(-5deg); } 43.5% { transform: translateX(2px) rotateY(3deg); } 50% { transform: translateX(0); } }
@keyframes pf-flash { 0%,50%,100% { opacity: 1; } 25%,75% { opacity: 0; } }
@keyframes pf-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes pf-contentShow { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }

.fadeInUp{animation:pf-fadeInUp .8s both}.fadeInDown{animation:pf-fadeInDown .8s both}.fadeInLeft{animation:pf-fadeInLeft .8s both}.fadeInRight{animation:pf-fadeInRight .8s both}
.fadeIn{animation:pf-fadeIn .8s both}.zoomIn{animation:pf-zoomIn .8s both}.zoomInUp{animation:pf-zoomInUp .8s both}
.backInUp{animation:pf-backInUp 1s both}.bounceInUp{animation:pf-bounceInUp 1s both}
.slideInUp{animation:pf-slideInUp .8s both}.slideInDown{animation:pf-slideInDown .8s both}.slideInLeft{animation:pf-slideInLeft .8s both}.slideInRight{animation:pf-slideInRight .8s both}
.flipInX{animation:pf-flipInX 1s both}.flipInY{animation:pf-flipInY 1s both}.rotateIn{animation:pf-rotateIn 1s both}.jackInTheBox{animation:pf-jackInTheBox 1s both}
.pulse{animation:pf-pulse 2s ease-in-out infinite}.heartBeat{animation:pf-heartBeat 1.3s ease-in-out infinite}.bounce{animation:pf-bounce 1.5s ease infinite}
.tada{animation:pf-tada 1s both}.rubberBand{animation:pf-rubberBand 1s both}.swing{transform-origin:top center;animation:pf-swing 1s both}.jello{animation:pf-jello 1s both;transform-origin:center}
.headShake{animation:pf-headShake 1s both}.flash{animation:pf-flash 2s infinite}.spin{animation:pf-spin 4s linear infinite}.contentShow{animation:pf-contentShow .6s both}

body { margin: 0; background: #fafafa; }
`;

/* ============================================================
   2. 스토리지
   ============================================================ */
const LS = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem('cf:' + key);
      return v === null ? fallback : JSON.parse(v);
    } catch { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem('cf:' + key, JSON.stringify(val)); } catch {}
  },
  del(key) { localStorage.removeItem('cf:' + key); },
};

/* 이전 버전(pf:, pm:) 데이터를 cf: 로 1회 마이그레이션 (데이터 보존) */
function migrateLegacy() {
  if (LS.get('migrated', false)) return;
  const raw = (full) => { try { const v = localStorage.getItem(full); return v === null ? null : JSON.parse(v); } catch { return null; } };
  const mergeById = (a, b) => {
    const out = Array.isArray(a) ? a.slice() : [];
    const ids = new Set(out.map(x => x && x.id));
    for (const item of (Array.isArray(b) ? b : [])) {
      if (item && !ids.has(item.id)) { out.push(item); ids.add(item.id); }
    }
    return out;
  };
  const pfWorlds = raw('pf:worlds'), pmWorlds = raw('pm:worlds');
  const pfChars = raw('pf:chars'), pmChars = raw('pm:chars');
  if (pfWorlds || pmWorlds) LS.set('worlds', mergeById(pfWorlds, pmWorlds));
  if (pfChars || pmChars) LS.set('chars', mergeById(pfChars, pmChars));
  const personas = raw('pm:personas'); if (personas) LS.set('personas', personas);
  const intros = raw('pf:intros'); if (intros) LS.set('intros', intros);
  const templates = raw('pf:templates'); if (templates) LS.set('templates', templates);
  // 시스템 프롬프트 병합 (pf + pm)
  const sp = {};
  Object.assign(sp, raw('pf:systemPrompts') || {}, raw('pm:systemPrompts') || {});
  if (Object.keys(sp).length) LS.set('systemPrompts', sp);
  // 키
  const keys = raw('pf:keys') || raw('pm:keys'); if (keys) LS.set('keys', keys);
  LS.set('migrated', true);
}
migrateLegacy();

/* ============================================================
   3. 상태
   ============================================================ */
const state = {
  view: 'generate',
  gtab: 'world',          // 생성 탭: world | char
  libTab: 'worlds',       // 보관함 탭
  worlds: LS.get('worlds', []),
  chars: LS.get('chars', []),
  personas: LS.get('personas', []),
  intros: LS.get('intros', []),
  templates: LS.get('templates', BUILTIN_TEMPLATES.map(t => ({ ...t }))),
  selectedTemplateId: LS.get('selectedTemplate', 'builtin-1'),
  keys: LS.get('keys', { anthropic: '', google: '' }),
  systemPrompts: Object.assign({}, DEFAULT_SYSTEM_PROMPTS, LS.get('systemPrompts', {})),
  personaTemplate: LS.get('personaTemplate', DEFAULT_PERSONA_TEMPLATE),
  personaNsfwTemplate: LS.get('personaNsfwTemplate', DEFAULT_PERSONA_NSFW_TEMPLATE),
  theme: LS.get('theme', 'light'),
  // 생성 옵션 (영속화)
  opts: LS.get('opts', {
    generate: { provider: 'anthropic', maxTokens: 8192, think: 0, autoSave: true },
    persona:  { provider: 'anthropic', maxTokens: 4096, think: 0 },
    intro:    { provider: 'anthropic', maxTokens: 16384, think: 0, autoSave: true },
    asset:    { provider: 'anthropic', maxTokens: 16384, think: 0, sceneCount: 14 },
    recommend:{ provider: 'anthropic', maxTokens: 8192, think: 0, count: 12 },
  }),
  // 런타임
  gen:   { output: '', thinking: '', busy: false, abort: null },
  pm:    { output: '', thinking: '', busy: false, abort: null, isNsfw: false, loadedId: null },
  intro: { output: '', busy: false, abort: null },
  asset: { output: '', parsed: null, charName: '', busy: false, abort: null, mode: 'sfw' },
  rec:   { tab: 'world', output: '', parsed: null, busy: false, abort: null },
  _templateBoxTouched: false,
};

/* 누락된 옵션 보강 + 기본 양식 보강 */
['generate', 'persona', 'intro', 'asset', 'recommend'].forEach(k => { state.opts[k] = state.opts[k] || {}; });
function ensureBuiltins() {
  for (const bt of BUILTIN_TEMPLATES) {
    if (!state.templates.find(t => t.id === bt.id)) state.templates.unshift({ ...bt });
  }
}
ensureBuiltins();

/* ============================================================
   4. 유틸
   ============================================================ */
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const fmt = n => Number(n).toLocaleString('en-US');
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function timeAgo(ts) {
  const d = (Date.now() - ts) / 1000;
  if (d < 60) return '방금 전';
  if (d < 3600) return Math.floor(d / 60) + '분 전';
  if (d < 86400) return Math.floor(d / 3600) + '시간 전';
  return Math.floor(d / 86400) + '일 전';
}
function safeFileName(s) { return String(s || 'untitled').replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_'); }
function toast(msg, ms = 2200) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
}
function download(filename, content, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function fillSelect(sel, items, placeholder) {
  if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = `<option value="">${placeholder}</option>`;
  for (const it of items) {
    const o = document.createElement('option');
    o.value = it.id; o.textContent = it.name;
    sel.appendChild(o);
  }
  if (cur && items.find(x => x.id === cur)) sel.value = cur;
}

/* ============================================================
   5. 테마 / 뷰 전환
   ============================================================ */
function applyTheme() {
  document.body.setAttribute('data-theme', state.theme);
  const icon = $('#themeIcon');
  if (icon) {
    icon.innerHTML = state.theme === 'dark'
      ? `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`
      : `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
  }
}

function setView(view) {
  state.view = view;
  $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === view));
  $$('.view').forEach(v => v.classList.add('hidden'));
  $('#view-' + view).classList.remove('hidden');
  $('#sidebar').classList.remove('mobile-open');

  if (view === 'generate') { renderTemplateChips(); refreshWorldRefSelect(); }
  if (view === 'persona') refreshPersonaSelects();
  if (view === 'intro') refreshIntroSelects();
  if (view === 'asset') refreshAssetSelects();
  if (view === 'library') renderLibrary();
  if (view === 'settings') loadSettingsInputs();
}

/* ============================================================
   6. 생성 옵션 — 모델 셀렉트 + 슬라이더 (data-opts 카드 기반, 영속화)
   ============================================================ */
function optCard(view) { return document.querySelector(`[data-opts="${view}"]`); }

function applyOptsToCard(view) {
  const card = optCard(view);
  if (!card) return;
  const o = state.opts[view];
  const provSel = card.querySelector('[data-opt-provider]');
  const modelSel = card.querySelector('[data-opt-model]');
  const maxT = card.querySelector('[data-opt-maxtokens]');
  const thinkT = card.querySelector('[data-opt-think]');

  // provider 옵션 채우기
  provSel.innerHTML = '';
  for (const p of [['anthropic', 'Claude (Anthropic)'], ['google', 'Gemini (Google)']]) {
    const op = document.createElement('option'); op.value = p[0]; op.textContent = p[1]; provSel.appendChild(op);
  }
  provSel.value = o.provider || 'anthropic';
  refreshModelSelect(view);
  if (maxT) { maxT.value = o.maxTokens ?? maxT.value; updateSliderLabel(card, 'maxtokens'); }
  if (thinkT) { thinkT.value = o.think ?? 0; updateSliderLabel(card, 'think'); }

  // 부가 체크박스
  if (view === 'generate' && $('#genAutoSave')) $('#genAutoSave').checked = o.autoSave !== false;
  if (view === 'intro' && $('#introAutoSave')) $('#introAutoSave').checked = o.autoSave !== false;
  if (view === 'asset' && $('#assetSceneCount')) {
    $('#assetSceneCount').value = o.sceneCount ?? 14;
    $('#assetSceneCountVal').textContent = $('#assetSceneCount').value;
  }
  if (view === 'recommend' && $('#recCount')) {
    $('#recCount').value = o.count ?? 12;
    $('#recCountVal').textContent = $('#recCount').value;
  }
}

function refreshModelSelect(view) {
  const card = optCard(view);
  const provSel = card.querySelector('[data-opt-provider]');
  const modelSel = card.querySelector('[data-opt-model]');
  const provider = provSel.value;
  modelSel.innerHTML = '';
  for (const m of MODELS[provider]) {
    const op = document.createElement('option'); op.value = m.id; op.textContent = m.name; modelSel.appendChild(op);
  }
  const saved = (state.opts[view] && state.opts[view].model && state.opts[view].provider === provider)
    ? state.opts[view].model
    : LS.get('lastModel:' + provider, null);
  if (saved && MODELS[provider].find(m => m.id === saved)) modelSel.value = saved;
}

function updateSliderLabel(card, which) {
  if (which === 'maxtokens') {
    const v = parseInt(card.querySelector('[data-opt-maxtokens]').value);
    card.querySelector('[data-opt-maxtokens-val]').textContent = fmt(v);
  } else {
    const v = parseInt(card.querySelector('[data-opt-think]').value);
    card.querySelector('[data-opt-think-val]').textContent = v === 0 ? '사용 안 함' : fmt(v);
  }
}

function readOpts(view) {
  const card = optCard(view);
  const provider = card.querySelector('[data-opt-provider]').value;
  const model = card.querySelector('[data-opt-model]').value;
  const maxTokens = parseInt(card.querySelector('[data-opt-maxtokens]').value);
  const think = parseInt(card.querySelector('[data-opt-think]').value);
  return { provider, model, maxTokens, think };
}

function persistOpts(view) {
  const { provider, model, maxTokens, think } = readOpts(view);
  const o = state.opts[view] = state.opts[view] || {};
  o.provider = provider; o.model = model; o.maxTokens = maxTokens; o.think = think;
  if (view === 'generate' && $('#genAutoSave')) o.autoSave = $('#genAutoSave').checked;
  if (view === 'intro' && $('#introAutoSave')) o.autoSave = $('#introAutoSave').checked;
  if (view === 'asset' && $('#assetSceneCount')) o.sceneCount = parseInt($('#assetSceneCount').value);
  if (view === 'recommend' && $('#recCount')) o.count = parseInt($('#recCount').value);
  LS.set('opts', state.opts);
  LS.set('lastModel:' + provider, model);
}

function bindOptsCard(view) {
  const card = optCard(view);
  if (!card) return;
  card.querySelector('[data-opt-provider]').onchange = () => { refreshModelSelect(view); persistOpts(view); };
  card.querySelector('[data-opt-model]').onchange = () => persistOpts(view);
  card.querySelector('[data-opt-maxtokens]').oninput = () => updateSliderLabel(card, 'maxtokens');
  card.querySelector('[data-opt-maxtokens]').onchange = () => persistOpts(view);
  card.querySelector('[data-opt-think]').oninput = () => updateSliderLabel(card, 'think');
  card.querySelector('[data-opt-think]').onchange = () => persistOpts(view);
}

/* 옵션 검증 공통 */
function validateGen(view, provider, maxTokens, think) {
  const key = (state.keys[provider] || '').trim();
  if (!key) { toast(`설정에서 ${provider === 'anthropic' ? 'Anthropic' : 'Google'} API 키를 먼저 등록하세요`); setView('settings'); return null; }
  if (think > 0 && think >= maxTokens) { toast('추론 토큰은 최대 출력 토큰보다 작아야 합니다'); return null; }
  return key;
}

/* ============================================================
   7. 공용 LLM 스트리밍
   ============================================================ */
function budgetToEffort(think, maxTokens) {
  const ratio = think / Math.max(maxTokens, 1);
  if (ratio < 0.1) return 'low';
  if (ratio < 0.25) return 'medium';
  if (ratio < 0.5) return 'high';
  if (ratio < 0.8) return 'xhigh';
  return 'max';
}

/* provider 분기 스트리밍. onText/onThinking 콜백으로 델타 전달 */
async function streamLLM({ provider, key, model, maxTokens, think, systemPrompt, userPrompt, signal, onText, onThinking }) {
  if (provider === 'anthropic') {
    const body = {
      model, max_tokens: maxTokens, system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }], stream: true,
    };
    if (think > 0) {
      if (model === 'claude-opus-4-8') {
        body.thinking = { type: 'adaptive' };
        body.output_config = { effort: budgetToEffort(think, maxTokens) };
      } else {
        body.thinking = { type: 'enabled', budget_tokens: think };
      }
    }
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(body), signal,
    });
    await ensureOk(res);
    await readSSE(res, (evt) => {
      if (evt.type === 'content_block_delta') {
        if (evt.delta?.type === 'text_delta') onText && onText(evt.delta.text);
        else if (evt.delta?.type === 'thinking_delta') onThinking && onThinking(evt.delta.thinking || '');
      } else if (evt.type === 'error') {
        throw new Error(evt.error?.message || 'API error');
      }
    });
  } else {
    const body = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { maxOutputTokens: maxTokens },
    };
    body.generationConfig.thinkingConfig = { thinkingBudget: think > 0 ? think : 0 };
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(key)}`;
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal });
    await ensureOk(res);
    await readSSE(res, (evt) => {
      const parts = evt.candidates?.[0]?.content?.parts || [];
      for (const p of parts) {
        if (!p.text) continue;
        if (p.thought === true) onThinking && onThinking(p.text);
        else onText && onText(p.text);
      }
      if (evt.error) throw new Error(evt.error.message || 'API error');
    });
  }
}

async function ensureOk(res) {
  if (res.ok) return;
  let msg = `HTTP ${res.status}`;
  try { const e = await res.json(); msg = e.error?.message || msg; } catch {}
  throw new Error(msg);
}

async function readSSE(res, onEvent) {
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (!data || data === '[DONE]') continue;
      try { onEvent(JSON.parse(data)); }
      catch (e) { if (e.message?.includes('API error')) throw e; }
    }
  }
}

/* ============================================================
   8. 데이터 변경 후 동기화
   ============================================================ */
function afterDataChange() {
  refreshAllSelects();
  if (state.view === 'library') renderLibrary();
}

/* 공용 항목 삭제 (worlds/chars/personas/intros) */
function removeItem(kind, id, skipConfirm) {
  const labels = { worlds: '세계관', chars: '캐릭터', personas: '페르소나', intros: '소개 페이지' };
  if (!skipConfirm && !confirm(`이 ${labels[kind]}을(를) 삭제하시겠습니까?`)) return;
  state[kind] = state[kind].filter(x => x.id !== id);
  LS.set(kind, state[kind]);
  if (kind === 'personas' && state.pm.loadedId === id) state.pm.loadedId = null;
  closeDetail();
  afterDataChange();
  toast('삭제됨');
}

/* 모든 셀렉트 동기화 */
function refreshAllSelects() {
  refreshWorldRefSelect();
  refreshNsfwBaseCharSelect();
  refreshPersonaSelects();
  refreshIntroSelects();
  refreshAssetSelects();
}

/* ============================================================
   9. 상태 표시 / 출력 렌더 (공통)
   ============================================================ */
const STATUS_IDS = {
  gen: ['#genStatusDot', '#genStatusText'],
  pm: ['#pmStatusDot', '#pmStatusText'],
  intro: ['#introStatusDot', '#introStatusText'],
  asset: ['#assetStatusDot', '#assetStatusText'],
  rec: ['#recStatusDot', '#recStatusText'],
};
function setStatus(area, cls, text) {
  const [dotSel, textSel] = STATUS_IDS[area];
  const dot = $(dotSel);
  dot.className = 'status-dot' + (cls ? ' ' + cls : '');
  $(textSel).textContent = text;
}

function renderThinking(wrapSel, thinking) {
  const wrap = $(wrapSel);
  if (thinking) {
    wrap.classList.remove('hidden');
    wrap.innerHTML = `<div class="thinking-block"><div class="thinking-header">▸ 추론 과정 (Thinking)</div>${escapeHtml(thinking)}</div>`;
  } else {
    wrap.classList.add('hidden');
    wrap.innerHTML = '';
  }
}

/* ============================================================
   10. 생성 뷰 (세계관 / 캐릭터)
   ============================================================ */
function setGTab(tab) {
  state.gtab = tab;
  $$('[data-gtab]').forEach(t => t.classList.toggle('active', t.dataset.gtab === tab));
  $$('.gtab-panel').forEach(p => p.classList.add('hidden'));
  $('#gtab-' + tab).classList.remove('hidden');
}

function renderTemplateChips() {
  const row = $('#templateChips');
  row.innerHTML = '';
  for (const t of state.templates) {
    const chip = document.createElement('button');
    chip.className = 'chip' + (state.selectedTemplateId === t.id ? ' active' : '');
    chip.textContent = t.name;
    chip.onclick = () => {
      state.selectedTemplateId = t.id;
      state._templateBoxTouched = false;
      LS.set('selectedTemplate', t.id);
      $('#charTemplateOverride').value = t.body;
      renderTemplateChips();
    };
    row.appendChild(chip);
  }
  const blank = document.createElement('button');
  blank.className = 'chip' + (state.selectedTemplateId === '__blank__' ? ' active' : '');
  blank.textContent = '+ 직접 작성';
  blank.onclick = () => {
    state.selectedTemplateId = '__blank__';
    state._templateBoxTouched = false;
    LS.set('selectedTemplate', '__blank__');
    $('#charTemplateOverride').value = '';
    renderTemplateChips();
  };
  row.appendChild(blank);

  // override 박스 채우기 (사용자가 수정 안 했을 때만)
  if (!state._templateBoxTouched) {
    const sel = state.templates.find(t => t.id === state.selectedTemplateId);
    $('#charTemplateOverride').value = sel ? sel.body : '';
  }
}

function refreshWorldRefSelect() {
  fillSelect($('#worldRefSelect'), state.worlds, '— 저장된 세계관에서 불러오기 (선택) —');
}
function refreshNsfwBaseCharSelect() {
  fillSelect($('#nsfwBaseCharSelect'), state.chars, '— 저장된 캐릭터에서 불러오기 —');
}

function renderGenOutput() {
  $('#genOutput').value = state.gen.output;
  renderThinking('#genThinkingWrap', state.gen.thinking);
  $('#genCharCount').textContent = state.gen.output.length.toLocaleString() + ' 글자';
}

async function generate() {
  if (state.gen.busy) { state.gen.abort?.abort(); return; }

  const { provider, model, maxTokens, think } = readOpts('generate');
  persistOpts('generate');
  const key = validateGen('generate', provider, maxTokens, think);
  if (!key) return;

  let systemPrompt, userPrompt, name, kind;

  if (state.gtab === 'world') {
    const idea = $('#worldIdea').value.trim();
    if (!idea) { toast('아이디어를 입력해주세요'); return; }
    const wNsfw = $('#worldNsfwMode').checked;
    const format = document.querySelector('input[name="worldFormat"]:checked').value;
    const formatLabel = { mixed: '혼합형 (선언적 산문+핵심 불릿)', prose: '산문형 (단정형 문단 중심)', keyword: '키워드형 ("항목: 값" 불릿 중심)' }[format];
    systemPrompt = wNsfw ? state.systemPrompts.worldNsfw : state.systemPrompts.world;
    userPrompt = `## 출력 형식\n${formatLabel}\n\n## 아이디어\n${idea}\n\n위 아이디어를 토대로 AI 채팅 봇이 참조할 ${wNsfw ? '성인(NSFW) ' : ''}세계관 지침을 작성해 주세요.${wNsfw ? '\n(이 세계의 성문화·관능·금기를 설정·규범으로서 직접적으로 다루세요. 모든 등장 인물은 성인 18세 이상)' : ''}`;
    name = $('#worldName').value.trim() || `세계관 ${new Date().toLocaleString('ko-KR')}`;
    kind = 'worlds';
  } else if ($('#nsfwOnlyMode').checked) {
    const baseChar = $('#nsfwBaseChar').value.trim();
    if (!baseChar) { toast('기존 캐릭터 설정을 입력해주세요'); return; }
    const nsfwReq = $('#nsfwRequest').value.trim();
    systemPrompt = state.systemPrompts.char + '\n\n' + state.systemPrompts.charNsfw + `

## NSFW 보강 모드
이미 작성된 캐릭터 설정에 NSFW 항목만 추가/강화하는 모드입니다.
- 기존 설정의 성격·과거·말투와 자연스럽게 일관되는 NSFW 설정을 작성하세요.
- 출력은 NSFW 부분만 마크다운으로(기존 설정 전체를 반복하지 말 것).`;
    userPrompt = `## 기존 캐릭터 설정\n\`\`\`\n${baseChar}\n\`\`\`\n\n${nsfwReq ? `## 추가 요청\n${nsfwReq}\n\n` : ''}위 캐릭터에 어울리는 NSFW 설정을 위 강화 지침대로 구체적으로 작성해 주세요. 기존 설정은 반복하지 말고 NSFW 항목만 마크다운 헤더로 정리해 출력하세요. (모든 등장 인물은 성인 18세 이상)`;
    name = $('#charName').value.trim() || `NSFW ${new Date().toLocaleString('ko-KR')}`;
    kind = 'chars';
  } else {
    const idea = $('#charIdea').value.trim();
    if (!idea) { toast('아이디어를 입력해주세요'); return; }
    const templateBody = $('#charTemplateOverride').value.trim();
    if (!templateBody) { toast('양식이 비어있습니다'); return; }
    const cNsfw = $('#charNsfwMode').checked;
    let worldCtx = '';
    if ($('#useWorldContext').checked) {
      const directBody = $('#worldRefBody').value.trim();
      const wid = $('#worldRefSelect').value;
      const w = wid ? state.worlds.find(x => x.id === wid) : null;
      const body = directBody || (w ? w.body : '');
      if (body) worldCtx = `\n\n## 참조 세계관\n${body}\n`;
    }
    systemPrompt = state.systemPrompts.char + (cNsfw ? '\n\n' + state.systemPrompts.charNsfw : '');
    userPrompt = `## 사용할 양식\n\`\`\`\n${templateBody}\n\`\`\`\n\n## 캐릭터 아이디어\n${idea}\n${worldCtx}\n위 양식의 모든 빈 칸을 채워 AI 채팅 봇이 연기할 캐릭터 지침을 작성해 주세요. 양식의 구조와 항목명은 그대로 유지하세요.${cNsfw ? '\nNSFW 관련 항목은 위 NSFW 강화 지침에 따라 노골적·구체적으로 채우세요. (모든 등장 인물은 성인 18세 이상)' : ''}`;
    name = $('#charName').value.trim() || `캐릭터 ${new Date().toLocaleString('ko-KR')}`;
    kind = 'chars';
  }

  state.gen.busy = true;
  state.gen.output = ''; state.gen.thinking = '';
  state.gen.abort = new AbortController();
  $('#generateBtn').innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="6" width="12" height="12"/></svg>중지';
  setStatus('gen', 'streaming', '생성 중...');
  renderGenOutput();

  try {
    await streamLLM({
      provider, key, model, maxTokens, think, systemPrompt, userPrompt,
      signal: state.gen.abort.signal,
      onText: (t) => { state.gen.output += t; renderGenOutput(); },
      onThinking: (t) => { state.gen.thinking += t; renderGenOutput(); },
    });
    setStatus('gen', 'done', '완료');
    if ($('#genAutoSave').checked && state.gen.output.trim()) saveGenOutput(kind, name);
  } catch (err) {
    if (err.name === 'AbortError') setStatus('gen', 'done', '중지됨');
    else { console.error(err); setStatus('gen', 'error', '오류: ' + err.message); toast('오류: ' + err.message, 4000); }
  } finally {
    state.gen.busy = false; state.gen.abort = null;
    $('#generateBtn').innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>생성하기';
  }
}

function saveGenOutput(kindOverride, nameOverride) {
  state.gen.output = $('#genOutput').value;
  const text = state.gen.output.trim();
  if (!text) { toast('저장할 결과가 없습니다'); return; }
  const kind = kindOverride || (state.gtab === 'world' ? 'worlds' : 'chars');
  let name = nameOverride;
  if (!name) {
    name = (kind === 'worlds' ? $('#worldName').value : $('#charName').value).trim();
    if (!name) name = (kind === 'worlds' ? '세계관' : '캐릭터') + ' ' + new Date().toLocaleString('ko-KR');
  }
  state[kind].unshift({ id: uid(), name, body: text, ts: Date.now() });
  LS.set(kind, state[kind]);
  afterDataChange();
  toast(`「${name}」 저장됨`);
}

/* ============================================================
   11. 페르소나 메이커
   ============================================================ */
function refreshPersonaSelects() {
  fillSelect($('#pmWorldSelect'), state.worlds, '— 사용 안 함 (직접 입력 가능) —');
  fillSelect($('#pmCharSelect'), state.chars, '— 사용 안 함 (직접 입력 가능) —');
}

function renderPmOutput() {
  $('#pmOutput').value = state.pm.output;
  renderThinking('#pmThinkingWrap', state.pm.thinking);
  $('#pmCharCount').textContent = state.pm.output.length.toLocaleString() + ' 글자';
  $('#pmNsfwTag').classList.toggle('hidden', !state.pm.isNsfw);
  const has = state.pm.output.trim().length > 0;
  $('#pmEnhanceBtn').disabled = !has || state.pm.busy;
  $('#pmEnhanceNsfwBtn').disabled = !has || state.pm.busy;
}

function extractPersonaName(text) {
  const m = text.match(/-?\s*이름\s*:\s*([^\n]+)/);
  if (m && m[1].trim()) return m[1].trim();
  return '이름 없음';
}

async function generatePersona({ enhance = false, enhanceNsfw = false } = {}) {
  if (state.pm.busy) return;
  const { provider, model, maxTokens, think } = readOpts('persona');
  persistOpts('persona');
  const key = validateGen('persona', provider, maxTokens, think);
  if (!key) return;

  state.pm.output = $('#pmOutput').value; // 편집 반영
  const isNsfw = $('#pmNsfw').checked;
  let systemPrompt, userPrompt;

  if (enhance) {
    if (!state.pm.output.trim()) { toast('보강할 페르소나가 없습니다'); return; }
    systemPrompt = state.systemPrompts.enhance;
    userPrompt = `[기존 페르소나]\n${state.pm.output}\n\n위 페르소나를 양식 구조 그대로 유지하면서 각 항목을 더 디테일하게 보강해주세요.`;
  } else if (enhanceNsfw) {
    if (!state.pm.output.trim()) { toast('보강할 페르소나가 없습니다'); return; }
    systemPrompt = state.systemPrompts.enhanceNsfw;
    userPrompt = `[기존 페르소나]\n${state.pm.output}\n\n${NSFW_FEWSHOT_EXAMPLE}\n\n위 페르소나의 프로필·과거 배경은 그대로 두고, 마지막에 "## NSFW" 섹션을 다음 구조로 추가하거나 교체하세요. 기존에 옛 NSFW 구조가 있으면 아래 새 구조로 완전히 대체합니다.\n${state.personaNsfwTemplate}\n각 항목은 시스템 프롬프트 원칙과 위 참고 예시의 톤·구체성으로 채워주세요. (모든 등장 인물은 성인 18세 이상)`;
  } else {
    systemPrompt = isNsfw ? state.systemPrompts.personaNsfw : state.systemPrompts.persona;
    const worldBody = $('#pmWorldBody').value.trim();
    const charBody = $('#pmCharBody').value.trim();
    const idea = $('#pmIdea').value.trim();
    if (!worldBody && !charBody && !idea) { toast('세계관·캐릭터·아이디어 중 하나는 입력해주세요', 3000); return; }
    const template = state.personaTemplate + (isNsfw ? state.personaNsfwTemplate : '');
    const parts = [];
    if (worldBody) parts.push(`[세계관]\n${worldBody}`);
    if (charBody) parts.push(`[대화 상대 캐릭터({{char}}) 설정]\n${charBody}`);
    if (idea) parts.push(`[페르소나 아이디어 / 요청]\n${idea}`);
    parts.push(`[페르소나 양식 (이 구조를 그대로 유지하여 채우세요)]\n${template}`);
    if (isNsfw) parts.push(NSFW_FEWSHOT_EXAMPLE);
    parts.push(`위 정보를 바탕으로 세계관·캐릭터와 어우러지는 사용자({{user}}) 페르소나를 양식대로 생성해주세요. 양식만 출력하세요.`);
    if (isNsfw) parts.push(`모든 등장 인물은 성인(18세 이상)이어야 합니다.`);
    userPrompt = parts.join('\n\n');
  }

  state.pm.busy = true;
  state.pm.output = ''; state.pm.thinking = '';
  if (!enhance && !enhanceNsfw) { state.pm.isNsfw = isNsfw; state.pm.loadedId = null; }
  else if (enhanceNsfw) state.pm.isNsfw = true;
  state.pm.abort = new AbortController();
  renderPmOutput();
  setStatus('pm', 'streaming', enhance ? '보강 중...' : enhanceNsfw ? 'NSFW 보강 중...' : '생성 중...');
  $('#pmGenerateBtn').disabled = true;
  $('#pmStopBtn').style.display = 'inline-flex';

  try {
    await streamLLM({
      provider, key, model, maxTokens, think, systemPrompt, userPrompt,
      signal: state.pm.abort.signal,
      onText: (t) => { state.pm.output += t; renderPmOutput(); },
      onThinking: (t) => { state.pm.thinking += t; renderPmOutput(); },
    });
    setStatus('pm', 'done', '완료');
  } catch (e) {
    if (e.name === 'AbortError') setStatus('pm', '', '중단됨');
    else { setStatus('pm', 'error', '오류: ' + e.message); toast('생성 실패: ' + e.message, 3500); }
  } finally {
    state.pm.busy = false; state.pm.abort = null;
    $('#pmGenerateBtn').disabled = false;
    $('#pmStopBtn').style.display = 'none';
    renderPmOutput();
  }
}

function savePersona() {
  state.pm.output = $('#pmOutput').value;
  const text = state.pm.output.trim();
  if (!text) { toast('저장할 내용이 없습니다'); return; }
  const name = extractPersonaName(text);
  if (state.pm.loadedId) {
    const p = state.personas.find(x => x.id === state.pm.loadedId);
    if (p) {
      p.name = name; p.body = text; p.nsfw = state.pm.isNsfw; p.ts = Date.now();
      LS.set('personas', state.personas); afterDataChange();
      toast('페르소나 업데이트됨'); return;
    }
  }
  const newP = { id: uid(), name, body: text, nsfw: state.pm.isNsfw, ts: Date.now() };
  state.personas.unshift(newP);
  LS.set('personas', state.personas);
  state.pm.loadedId = newP.id;
  afterDataChange();
  toast(`「${name}」 저장됨`);
}

function loadPersona(id) {
  const p = state.personas.find(x => x.id === id);
  if (!p) return;
  state.pm.output = p.body; state.pm.thinking = ''; state.pm.isNsfw = !!p.nsfw; state.pm.loadedId = id;
  $('#pmNsfw').checked = !!p.nsfw;
  $('#pmNsfwToggle').classList.toggle('checked', !!p.nsfw);
  setView('persona');
  renderPmOutput();
  setStatus('pm', 'done', `「${p.name}」 불러옴`);
}

/* ============================================================
   12. 소개 페이지
   ============================================================ */
function refreshIntroSelects() {
  fillSelect($('#introCharSelect'), state.chars, '— 저장된 캐릭터에서 불러오기 —');
  fillSelect($('#introWorldSelect'), state.worlds, '— 사용 안 함 —');
}

function cleanIntroCode(s) {
  return String(s).trim().replace(/^```(?:html)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
}
function renderIntroCode() {
  $('#introCode').textContent = state.intro.output;
  const len = state.intro.output.length;
  $('#introCodeStat').textContent = len ? `${fmt(len)}자` : '';
  const el = $('#introCode'); el.scrollTop = el.scrollHeight;
}
function renderIntroPreview() {
  const code = cleanIntroCode(state.intro.output);
  const iframe = $('#introPreview');
  const empty = $('#introPreviewEmpty');
  if (!code) { iframe.classList.add('hidden'); empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden'); iframe.classList.remove('hidden');
  iframe.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><style>${ANIMATION_RUNTIME_CSS}</style></head><body>${code}</body></html>`;
}

async function introGenerate() {
  if (state.intro.busy) { state.intro.abort?.abort(); return; }
  const charBody = $('#introCharBody').value.trim();
  if (!charBody) { toast('캐릭터 설정을 입력해주세요'); return; }
  const { provider, model, maxTokens, think } = readOpts('intro');
  persistOpts('intro');
  const key = validateGen('intro', provider, maxTokens, think);
  if (!key) return;

  const worldBody = $('#introWorldBody').value.trim();
  const extra = $('#introExtraIdea').value.trim();
  const systemPrompt = state.systemPrompts.intro;
  const userPrompt = `## 캐릭터 설정\n\`\`\`\n${charBody}\n\`\`\`\n${worldBody ? `\n## 세계관 설정\n\`\`\`\n${worldBody}\n\`\`\`\n` : ''}${extra ? `\n## 추가 디자인/내용 요청\n${extra}\n` : ''}\n위 정보를 바탕으로 캐릭터 소개 페이지를 HTML로 만들어 주세요. {{user}}가 채팅 시작 전 알아두면 좋은 정보만 담고, 직접 알아가는 게 좋은 정보(NSFW·깊은 트라우마 디테일·비밀·모든 호불호 등)는 제외하세요. 첫 글자는 \`<\`로 시작해야 하며 마크다운 코드블록·설명·메타 코멘트는 일절 출력하지 마세요.`;

  state.intro.busy = true;
  state.intro.output = '';
  state.intro.abort = new AbortController();
  $('#introGenerateBtn').innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="6" width="12" height="12"/></svg>중지';
  setStatus('intro', 'streaming', '생성 중...');
  renderIntroCode(); renderIntroPreview();

  let lastPreview = 0;
  try {
    await streamLLM({
      provider, key, model, maxTokens, think, systemPrompt, userPrompt,
      signal: state.intro.abort.signal,
      onText: (t) => {
        state.intro.output += t;
        renderIntroCode();
        if ($('#introLivePreview').checked) {
          const now = Date.now();
          if (now - lastPreview > 300) { lastPreview = now; renderIntroPreview(); }
        }
      },
    });
    renderIntroPreview();
    setStatus('intro', 'done', '완료');
    if ($('#introAutoSave').checked && state.intro.output.trim()) saveIntro();
  } catch (err) {
    if (err.name === 'AbortError') { setStatus('intro', 'done', '중지됨'); renderIntroPreview(); }
    else { console.error(err); setStatus('intro', 'error', '오류: ' + err.message); toast('오류: ' + err.message, 4000); }
  } finally {
    state.intro.busy = false; state.intro.abort = null;
    $('#introGenerateBtn').innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>소개 페이지 생성';
  }
}

function saveIntro(nameOverride) {
  const code = cleanIntroCode(state.intro.output);
  if (!code) { toast('저장할 내용이 없습니다'); return; }
  let name = nameOverride;
  if (!name) {
    const cId = $('#introCharSelect').value;
    const c = cId ? state.chars.find(x => x.id === cId) : null;
    name = c ? c.name + ' — 소개페이지' : `소개페이지 ${new Date().toLocaleString('ko-KR')}`;
  }
  state.intros.unshift({ id: uid(), name, body: code, ts: Date.now() });
  LS.set('intros', state.intros);
  toast(`「${name}」 저장됨`);
}

function loadIntro(item) {
  state.intro.output = item.body;
  setView('intro');
  renderIntroCode(); renderIntroPreview();
  setStatus('intro', 'done', `「${item.name}」 불러옴`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function introFullDoc(code) {
  return `<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n<title>캐릭터 소개</title>\n<style>${ANIMATION_RUNTIME_CSS}</style>\n</head>\n<body>\n${code}\n</body>\n</html>`;
}

/* ============================================================
   13. 에셋 태그
   ============================================================ */
function refreshAssetSelects() {
  fillSelect($('#assetCharSelect'), state.chars, '— 저장된 캐릭터에서 불러오기 —');
  fillSelect($('#assetWorldSelect'), state.worlds, '— 사용 안 함 —');
}
function setAssetMode(mode) {
  state.asset.mode = mode;
  $$('.asset-tab').forEach(t => t.classList.toggle('active', t.dataset.assetTab === mode));
  const label = mode === 'nsfw' ? 'NSFW 에셋 태그 생성' : '에셋 태그 생성';
  $('#assetGenerateBtn').innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg> ${label}`;
}
function renderAssetOutput() { $('#assetOutput').textContent = state.asset.output; }

async function generateAsset() {
  if (state.asset.busy) { state.asset.abort?.abort(); return; }
  const { provider, model, maxTokens, think } = readOpts('asset');
  persistOpts('asset');
  const key = validateGen('asset', provider, maxTokens, think);
  if (!key) return;

  const charBody = $('#assetCharBody').value.trim();
  if (!charBody) { toast('캐릭터 설정을 입력하세요'); return; }
  const worldBody = $('#assetWorldBody').value.trim();
  const charName = $('#assetCharName').value.trim() || '이름 없음';
  const sceneCount = parseInt($('#assetSceneCount').value);
  const extraIdea = $('#assetExtraIdea').value.trim();
  const isNsfw = state.asset.mode === 'nsfw';
  const systemPrompt = isNsfw ? state.systemPrompts.assetNsfw : state.systemPrompts.asset;

  let userPrompt = '';
  if (worldBody) userPrompt += `[세계관 설정]\n${worldBody}\n\n`;
  userPrompt += `[캐릭터 설정]\n${charBody}\n\n[요청]\n위 캐릭터에게 어울리는 ${isNsfw ? 'NSFW ' : ''}NAI 에셋용 장면 태그를 정확히 ${sceneCount}개 생성하세요.\n캐릭터의 성격·분위기·말투를 깊이 해석하여, 같은 ${isNsfw ? '상황' : '감정'}이라도 이 캐릭터만의 표현이 드러나도록 하세요.`;
  if (worldBody) userPrompt += `\n세계관의 시대·문화·분위기에 맞는 의상과 배경을 사용하세요.`;
  userPrompt += `\n상반신·얼굴 위주로 구성하고, 전신은 정말 필요할 때만 사용하세요.`;
  if (isNsfw) userPrompt += `\n반드시 모든 등장 인물이 성인(18세 이상)임을 확인하세요. 미성년이거나 연령 불명이면 error 필드만 담은 JSON을 반환하세요.`;
  if (extraIdea) userPrompt += `\n\n[추가 요청]\n${extraIdea}`;
  userPrompt += `\n\n반드시 지정된 JSON 형식만 출력하세요. {로 시작해서 }로 끝나야 합니다.`;

  state.asset.busy = true;
  state.asset.output = ''; state.asset.parsed = null; state.asset.charName = charName;
  state.asset.abort = new AbortController();
  renderAssetOutput();
  setStatus('asset', 'loading', '생성 중...');

  try {
    await streamLLM({
      provider, key, model, maxTokens, think, systemPrompt, userPrompt,
      signal: state.asset.abort.signal,
      onText: (t) => { state.asset.output += t; renderAssetOutput(); },
    });
    let raw = state.asset.output.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
    const first = raw.indexOf('{'), last = raw.lastIndexOf('}');
    if (first === -1 || last === -1) throw new Error('JSON 형식을 찾을 수 없습니다');
    const parsed = JSON.parse(raw.slice(first, last + 1));
    if (parsed.error) throw new Error(parsed.error);
    if (!parsed.scenes || !Array.isArray(parsed.scenes)) throw new Error('scenes 배열이 없습니다');
    if (isNsfw) {
      parsed.scenes = parsed.scenes.map(s => ({ ...s, name: (s.name && s.name.startsWith('[NSFW]')) ? s.name : `[NSFW] ${s.name || '장면'}` }));
    }
    state.asset.parsed = parsed.scenes;
    setStatus('asset', 'success', `완료 (${parsed.scenes.length}개 ${isNsfw ? 'NSFW ' : ''}장면)`);
  } catch (e) {
    if (e.name === 'AbortError') setStatus('asset', '', '중단됨');
    else { setStatus('asset', 'error', '오류: ' + e.message); toast('생성 실패: ' + e.message, 3500); }
  } finally {
    state.asset.busy = false; state.asset.abort = null;
  }
}

function buildAssetJSON() {
  if (!state.asset.parsed) return null;
  const now = Date.now();
  const name = state.asset.charName || $('#assetCharName').value.trim() || '이름 없음';
  return {
    id: 'scene-default', name,
    scenes: state.asset.parsed.map((s, i) => {
      const ts = now + i;
      return { id: String(ts), name: s.name || `장면 ${i + 1}`, scenePrompt: s.scenePrompt || '', queueCount: 0, images: [], createdAt: ts };
    }),
    createdAt: now,
  };
}

/* ============================================================
   13-2. 소재 추천 (세계관 / 캐릭터)
   ============================================================ */
function setRecTab(tab) {
  state.rec.tab = tab;
  $$('[data-rec-tab]').forEach(t => t.classList.toggle('active', t.dataset.recTab === tab));
  $('#recInputLabel').textContent = tab === 'world' ? '원하는 세계관 설정 / 장르' : '원하는 캐릭터 설정 / 장르';
  $('#recInput').placeholder = tab === 'world'
    ? '예: 비 내리는 사이버펑크 도시, 느와르 분위기, 기업이 지배하는 디스토피아...'
    : '예: 츤데레 여기사, 다정한 연상남, 미스터리한 점술사... 장르나 관계성 위주로';
  $('#recGenerateBtn').innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg> ${tab === 'world' ? '세계관' : '캐릭터'} 소재 추천`;
}

function renderRecOutput() {
  const wrap = $('#recOutput');
  if (!state.rec.parsed || !state.rec.parsed.length) {
    wrap.className = 'output-body';
    wrap.textContent = state.rec.output || '';
    return;
  }
  wrap.className = '';
  wrap.innerHTML = '';
  const list = document.createElement('div');
  list.className = 'item-list';
  const isWorld = state.rec.tab === 'world';
  state.rec.parsed.forEach((it, i) => {
    const seed = it.seed || it.idea || '';
    const el = document.createElement('div');
    el.className = 'item-row';
    el.innerHTML = `
      <div class="item-main">
        <div class="item-name">${i + 1}. ${escapeHtml(it.title || '소재')}</div>
        <div class="item-preview" style="white-space: normal;">${escapeHtml(seed)}</div>
      </div>
      <div class="item-actions">
        <button class="btn btn-sm btn-ghost" data-act="copy">복사</button>
        <button class="btn btn-sm btn-primary" data-act="use">이 소재로 생성</button>
      </div>`;
    el.querySelector('[data-act="copy"]').onclick = () => { navigator.clipboard.writeText(seed); toast('복사됨'); };
    el.querySelector('[data-act="use"]').onclick = () => useSeed(isWorld, it.title, seed);
    list.appendChild(el);
  });
  wrap.appendChild(list);
}

function useSeed(isWorld, title, seed) {
  setView('generate');
  setGTab(isWorld ? 'world' : 'char');
  if (isWorld) {
    $('#worldIdea').value = seed;
    if (title && !$('#worldName').value.trim()) $('#worldName').value = title;
  } else {
    $('#charIdea').value = seed;
    if (title && !$('#charName').value.trim()) $('#charName').value = title;
  }
  toast('생성기에 입력됨 — 옵션 확인 후 생성하세요');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function generateRecommend() {
  if (state.rec.busy) { state.rec.abort?.abort(); return; }
  const { provider, model, maxTokens, think } = readOpts('recommend');
  persistOpts('recommend');
  const key = validateGen('recommend', provider, maxTokens, think);
  if (!key) return;

  const desire = $('#recInput').value.trim();
  if (!desire) { toast('원하는 설정/장르를 입력해주세요'); return; }
  const count = parseInt($('#recCount').value);
  const isWorld = state.rec.tab === 'world';
  const systemPrompt = isWorld ? state.systemPrompts.recommendWorld : state.systemPrompts.recommendChar;
  const userPrompt = `## 원하는 방향\n${desire}\n\n위 방향에 맞는 서로 다른 ${isWorld ? '세계관' : '캐릭터'} 소재를 정확히 ${count}개 제안하세요. 각 소재는 생성기에 그대로 넣을 수 있는 지침형 아이디어(seed)여야 합니다. 반드시 지정된 JSON만 출력하세요.`;

  state.rec.busy = true;
  state.rec.output = ''; state.rec.parsed = null;
  state.rec.abort = new AbortController();
  $('#recGenerateBtn').disabled = true;
  setStatus('rec', 'loading', '추천 생성 중...');
  renderRecOutput();

  try {
    await streamLLM({
      provider, key, model, maxTokens, think, systemPrompt, userPrompt,
      signal: state.rec.abort.signal,
      onText: (t) => { state.rec.output += t; if (!state.rec.parsed) renderRecOutput(); },
    });
    let raw = state.rec.output.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
    const first = raw.indexOf('{'), last = raw.lastIndexOf('}');
    if (first === -1 || last === -1) throw new Error('JSON 형식을 찾을 수 없습니다');
    const parsed = JSON.parse(raw.slice(first, last + 1));
    if (!parsed.items || !Array.isArray(parsed.items)) throw new Error('items 배열이 없습니다');
    state.rec.parsed = parsed.items;
    setStatus('rec', 'success', `완료 (${parsed.items.length}개 소재)`);
    renderRecOutput();
  } catch (e) {
    if (e.name === 'AbortError') setStatus('rec', '', '중단됨');
    else { setStatus('rec', 'error', '오류: ' + e.message); toast('생성 실패: ' + e.message, 3500); }
  } finally {
    state.rec.busy = false; state.rec.abort = null;
    $('#recGenerateBtn').disabled = false;
  }
}

/* ============================================================
   14. 보관함 (Library)
   ============================================================ */
const LIB_META = {
  worlds:    { title: '세계관', kind: 'worlds', editable: true },
  chars:     { title: '캐릭터', kind: 'chars', editable: true },
  personas:  { title: '페르소나', kind: 'personas', editable: false },
  intros:    { title: '소개 페이지', kind: 'intros', editable: false },
  templates: { title: '양식', kind: 'templates', editable: true },
};
function setLibTab(tab) {
  state.libTab = tab;
  $$('.lib-tab').forEach(t => t.classList.toggle('active', t.dataset.libTab === tab));
  const meta = LIB_META[tab];
  $('#libTitle').textContent = meta.title;
  $('#libNewLabel').textContent = '새 ' + meta.title;
  $('#libNewBtn').style.display = (tab === 'personas') ? 'none' : '';
  renderLibrary();
}

function renderLibrary() {
  const tab = state.libTab;
  const list = $('#libList');
  if (tab === 'templates') return renderTemplateLib(list);

  const items = state[tab].slice().sort((a, b) => b.ts - a.ts);
  if (!items.length) { list.className = ''; list.innerHTML = `<div class="empty-state">아직 저장된 ${LIB_META[tab].title}이(가) 없습니다.</div>`; return; }
  list.className = 'item-list';
  list.innerHTML = '';
  for (const it of items) {
    const el = document.createElement('div');
    el.className = 'item-row clickable';
    const nsfwTag = (tab === 'personas' && it.nsfw) ? ' <span class="tag nsfw">NSFW</span>' : '';
    el.innerHTML = `
      <div class="item-main">
        <div class="item-name">${escapeHtml(it.name)}${nsfwTag}</div>
        <div class="item-meta">${timeAgo(it.ts)} · ${it.body.length.toLocaleString()}자 · 클릭하면 상세보기 · 우클릭 복사</div>
      </div>
      <div class="item-actions"><span class="muted">›</span></div>`;
    el.onclick = () => openDetailModal(tab, it.id);
    el.oncontextmenu = (e) => { e.preventDefault(); navigator.clipboard.writeText(it.body); toast('복사됨'); };
    list.appendChild(el);
  }
}

function renderTemplateLib(list) {
  list.className = 'item-list';
  list.innerHTML = '';
  for (const t of state.templates) {
    const el = document.createElement('div');
    el.className = 'item-row';
    el.innerHTML = `
      <div class="item-main">
        <div class="item-name">${escapeHtml(t.name)}${t.builtin ? ' <span class="tag">기본</span>' : ''}</div>
        <div class="item-preview">${escapeHtml(t.body.slice(0, 90))}…</div>
      </div>
      <div class="item-actions">
        <button class="btn btn-sm btn-ghost" data-act="edit">편집</button>
        <button class="btn btn-sm btn-ghost" data-act="dup">복제</button>
        ${!t.builtin ? '<button class="btn btn-sm btn-ghost btn-danger-text" data-act="del">삭제</button>' : ''}
      </div>`;
    el.querySelector('[data-act="edit"]').onclick = () => openTemplateModal(t);
    el.querySelector('[data-act="dup"]').onclick = () => {
      state.templates.push({ id: uid(), name: t.name + ' (복제)', body: t.body, builtin: false });
      LS.set('templates', state.templates); renderLibrary(); renderTemplateChips(); toast('복제됨');
    };
    const del = el.querySelector('[data-act="del"]');
    if (del) del.onclick = () => deleteTemplate(t.id);
    list.appendChild(el);
  }
}

function deleteTemplate(id) {
  if (!confirm('이 양식을 삭제하시겠습니까?')) return;
  state.templates = state.templates.filter(t => t.id !== id);
  LS.set('templates', state.templates);
  if (state.selectedTemplateId === id) {
    state.selectedTemplateId = state.templates[0]?.id || '__blank__';
    LS.set('selectedTemplate', state.selectedTemplateId);
  }
  renderLibrary(); renderTemplateChips(); toast('양식 삭제됨');
}

/* ============================================================
   15. 모달 (세계관/캐릭터 편집 + 양식 편집)
   ============================================================ */
let modalCtx = { mode: null, kind: null, id: null, template: null };

function openItemModal(kind, id) {
  modalCtx = { mode: 'item', kind, id, template: null };
  const item = id ? state[kind].find(x => x.id === id) : null;
  const label = LIB_META[kind].title;
  $('#modalTitle').textContent = `${label} ${id ? '편집' : '추가'}`;
  $('#modalName').value = item?.name || '';
  $('#modalBody').value = item?.body || '';
  $('#modalBackdrop').classList.remove('hidden');
  setTimeout(() => $('#modalName').focus(), 50);
}
function openTemplateModal(t) {
  modalCtx = { mode: 'template', kind: 'templates', id: t?.id || null, template: t };
  $('#modalTitle').textContent = t ? '양식 편집' : '새 양식';
  $('#modalName').value = t ? t.name : '';
  $('#modalBody').value = t ? t.body : '';
  $('#modalBackdrop').classList.remove('hidden');
  setTimeout(() => $('#modalName').focus(), 50);
}
function closeModal() { $('#modalBackdrop').classList.add('hidden'); modalCtx = { mode: null, kind: null, id: null, template: null }; }

function saveModal() {
  const name = $('#modalName').value.trim();
  const body = $('#modalBody').value;
  if (!name) { toast('이름을 입력해주세요'); return; }
  if (!body.trim()) { toast('내용을 입력해주세요'); return; }

  if (modalCtx.mode === 'template') {
    const t = modalCtx.template;
    if (t) {
      // 기본 양식을 수정하면 새 양식으로 복제
      if (t.builtin && (name !== t.name || body !== t.body)) {
        state.templates.push({ id: uid(), name, body, builtin: false });
      } else { t.name = name; t.body = body; }
    } else {
      state.templates.push({ id: uid(), name, body, builtin: false });
    }
    LS.set('templates', state.templates);
    renderLibrary(); renderTemplateChips();
  } else {
    const { kind, id } = modalCtx;
    if (id) {
      const item = state[kind].find(x => x.id === id);
      if (item) { item.name = name; item.body = body; item.ts = Date.now(); }
    } else {
      state[kind].unshift({ id: uid(), name, body, ts: Date.now() });
    }
    LS.set(kind, state[kind]);
    renderLibrary(); afterDataChange();
  }
  closeModal();
  toast('저장됨');
}

/* ============================================================
   15-2. 상세 보기 모달 (세계관/캐릭터/페르소나/소개)
   ============================================================ */
let detailCtx = { kind: null, id: null };

function openDetailModal(kind, id) {
  const item = state[kind].find(x => x.id === id);
  if (!item) return;
  detailCtx = { kind, id };
  $('#detailTitle').textContent = item.name;
  $('#detailBody').textContent = item.body;

  // 푸터 액션 구성
  const footer = $('#detailFooter');
  footer.innerHTML = '';
  const addBtn = (label, cls, fn) => {
    const b = document.createElement('button');
    b.className = 'btn btn-sm ' + cls;
    b.textContent = label;
    b.onclick = fn;
    footer.appendChild(b);
  };
  addBtn('복사', 'btn-ghost', () => { navigator.clipboard.writeText(item.body); toast('복사됨'); });
  if (kind === 'worlds' || kind === 'chars') {
    addBtn('편집', 'btn-ghost', () => { closeDetail(); openItemModal(kind, id); });
  } else if (kind === 'personas') {
    addBtn('메이커로 불러오기', 'btn-ghost', () => { closeDetail(); loadPersona(id); });
  } else if (kind === 'intros') {
    addBtn('새 창에서 열기', 'btn-ghost', () => { const w = window.open('', '_blank'); if (w) { w.document.write(introFullDoc(item.body)); w.document.close(); } });
    addBtn('소개 뷰로 불러오기', 'btn-ghost', () => { closeDetail(); loadIntro(item); });
  }
  addBtn('삭제', 'btn-danger-text', () => removeItem(kind, id));
  $('#detailBackdrop').classList.remove('hidden');
}
function closeDetail() { $('#detailBackdrop').classList.add('hidden'); detailCtx = { kind: null, id: null }; }

/* ============================================================
   16. 설정
   ============================================================ */
const SP_KEYS = ['world', 'worldNsfw', 'char', 'charNsfw', 'persona', 'personaNsfw', 'enhance', 'enhanceNsfw', 'intro', 'asset', 'assetNsfw', 'recommendWorld', 'recommendChar'];

function loadSettingsInputs() {
  $('#anthropicKey').value = state.keys.anthropic || '';
  $('#googleKey').value = state.keys.google || '';
  $('#personaTemplate').value = state.personaTemplate;
  $('#personaNsfwTemplate').value = state.personaNsfwTemplate;
  for (const k of SP_KEYS) $('#sp-' + k).value = state.systemPrompts[k] || DEFAULT_SYSTEM_PROMPTS[k];
}

function exportData() {
  const data = {
    version: 2, exportedAt: new Date().toISOString(),
    worlds: state.worlds, chars: state.chars, personas: state.personas, intros: state.intros,
    templates: state.templates, systemPrompts: state.systemPrompts,
    personaTemplate: state.personaTemplate, personaNsfwTemplate: state.personaNsfwTemplate,
    opts: state.opts,
    // keys는 보안상 제외
  };
  download(`character-forge-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2), 'application/json');
  toast('백업 파일 다운로드됨');
}

function importData(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const data = JSON.parse(r.result);
      if (!confirm('가져온 데이터로 기존 데이터를 덮어씁니다. 계속하시겠습니까? (API 키는 유지됩니다)')) return;
      if (Array.isArray(data.worlds)) { state.worlds = data.worlds; LS.set('worlds', data.worlds); }
      if (Array.isArray(data.chars)) { state.chars = data.chars; LS.set('chars', data.chars); }
      if (Array.isArray(data.personas)) { state.personas = data.personas; LS.set('personas', data.personas); }
      if (Array.isArray(data.intros)) { state.intros = data.intros; LS.set('intros', data.intros); }
      if (Array.isArray(data.templates)) { state.templates = data.templates; ensureBuiltins(); LS.set('templates', state.templates); }
      if (data.systemPrompts) { state.systemPrompts = Object.assign({}, DEFAULT_SYSTEM_PROMPTS, data.systemPrompts); LS.set('systemPrompts', state.systemPrompts); }
      if (data.personaTemplate) { state.personaTemplate = data.personaTemplate; LS.set('personaTemplate', data.personaTemplate); }
      if (data.personaNsfwTemplate) { state.personaNsfwTemplate = data.personaNsfwTemplate; LS.set('personaNsfwTemplate', data.personaNsfwTemplate); }
      if (data.opts) { state.opts = data.opts; LS.set('opts', data.opts); }
      afterDataChange(); refreshAllSelects(); renderTemplateChips(); loadSettingsInputs();
      toast('가져오기 완료');
    } catch (e) { toast('가져오기 실패: ' + e.message, 3000); }
  };
  r.readAsText(file);
}

function clearAllData() {
  if (!confirm('정말 모든 데이터(세계관·캐릭터·페르소나·소개·양식·설정·키)를 삭제하시겠습니까?\n되돌릴 수 없습니다.')) return;
  if (!confirm('한 번 더 확인합니다. 모두 삭제할까요?')) return;
  for (const k of Object.keys(localStorage)) { if (k.startsWith('cf:')) localStorage.removeItem(k); }
  location.reload();
}

/* ============================================================
   17. 이벤트 바인딩
   ============================================================ */
function bind() {
  // 네비
  $$('.nav-item').forEach(n => n.onclick = () => setView(n.dataset.view));
  $('#mobileMenuBtn').onclick = () => $('#sidebar').classList.toggle('mobile-open');
  $('#themeToggle').onclick = () => { state.theme = state.theme === 'dark' ? 'light' : 'dark'; LS.set('theme', state.theme); applyTheme(); };

  // 옵션 카드 바인딩
  ['generate', 'persona', 'intro', 'asset', 'recommend'].forEach(bindOptsCard);
  $('#genAutoSave').onchange = () => persistOpts('generate');
  $('#introAutoSave').onchange = () => persistOpts('intro');

  // ===== 생성 뷰 =====
  $$('[data-gtab]').forEach(t => t.onclick = () => setGTab(t.dataset.gtab));
  $('#useWorldContext').onchange = (e) => $('#worldRefPanel').classList.toggle('hidden', !e.target.checked);
  $('#worldRefSelect').onchange = (e) => { const w = state.worlds.find(x => x.id === e.target.value); if (w) $('#worldRefBody').value = w.body; };
  $('#nsfwOnlyMode').onchange = (e) => { $('#nsfwOnlyPanel').classList.toggle('hidden', !e.target.checked); if (e.target.checked) refreshNsfwBaseCharSelect(); };
  $('#nsfwBaseCharSelect').onchange = (e) => {
    const c = state.chars.find(x => x.id === e.target.value);
    if (c) { $('#nsfwBaseChar').value = c.body; if (!$('#charName').value.trim()) $('#charName').value = c.name + ' (NSFW 보강)'; }
  };
  $('#charTemplateOverride').addEventListener('input', () => { state._templateBoxTouched = true; });
  const wTog = $('#worldNsfwToggle'), wIn = $('#worldNsfwMode');
  wIn.onchange = () => wTog.classList.toggle('checked', wIn.checked);
  const cTog = $('#charNsfwToggle'), cIn = $('#charNsfwMode');
  cIn.onchange = () => cTog.classList.toggle('checked', cIn.checked);
  $('#generateBtn').onclick = generate;
  $('#genOutput').oninput = () => { state.gen.output = $('#genOutput').value; $('#genCharCount').textContent = state.gen.output.length.toLocaleString() + ' 글자'; };
  $('#genCopyBtn').onclick = () => { const t = $('#genOutput').value; if (!t) return toast('복사할 내용이 없습니다'); navigator.clipboard.writeText(t); toast('복사됨'); };
  $('#genDownloadBtn').onclick = () => {
    const t = $('#genOutput').value; if (!t) return toast('내용이 없습니다');
    const name = (state.gtab === 'world' ? $('#worldName').value : $('#charName').value).trim() || (state.gtab === 'world' ? 'world' : 'character');
    download(safeFileName(name) + '.txt', t);
  };
  $('#genSaveBtn').onclick = () => saveGenOutput();

  // ===== 페르소나 =====
  $('#pmWorldSelect').onchange = (e) => { const w = state.worlds.find(x => x.id === e.target.value); if (w) $('#pmWorldBody').value = w.body; };
  $('#pmCharSelect').onchange = (e) => { const c = state.chars.find(x => x.id === e.target.value); if (c) $('#pmCharBody').value = c.body; };
  const pmToggle = $('#pmNsfwToggle'), pmInput = $('#pmNsfw');
  pmInput.onchange = () => pmToggle.classList.toggle('checked', pmInput.checked);
  $('#pmGenerateBtn').onclick = () => generatePersona();
  $('#pmStopBtn').onclick = () => state.pm.abort?.abort();
  $('#pmEnhanceBtn').onclick = () => generatePersona({ enhance: true });
  $('#pmEnhanceNsfwBtn').onclick = () => generatePersona({ enhanceNsfw: true });
  $('#pmOutput').oninput = () => { state.pm.output = $('#pmOutput').value; $('#pmCharCount').textContent = state.pm.output.length.toLocaleString() + ' 글자'; };
  $('#pmCopyBtn').onclick = () => { const t = $('#pmOutput').value; if (!t) return toast('복사할 내용이 없습니다'); navigator.clipboard.writeText(t); toast('복사됨'); };
  $('#pmDownloadBtn').onclick = () => { const t = $('#pmOutput').value; if (!t) return toast('내용이 없습니다'); download(safeFileName(extractPersonaName(t)) + '.txt', t); };
  $('#pmSaveBtn').onclick = savePersona;

  // ===== 소개 페이지 =====
  $('#introCharSelect').onchange = (e) => { const c = state.chars.find(x => x.id === e.target.value); if (c) $('#introCharBody').value = c.body; };
  $('#introWorldSelect').onchange = (e) => { const id = e.target.value; if (!id) { $('#introWorldBody').value = ''; return; } const w = state.worlds.find(x => x.id === id); if (w) $('#introWorldBody').value = w.body; };
  $('#introGenerateBtn').onclick = introGenerate;
  $('#introLivePreview').onchange = (e) => { if (e.target.checked) renderIntroPreview(); };
  $('#introCopyBtn').onclick = () => { const c = cleanIntroCode(state.intro.output); if (!c) return toast('복사할 코드가 없습니다'); navigator.clipboard.writeText(c); toast('코드 복사됨'); };
  $('#introDownloadBtn').onclick = () => { const c = cleanIntroCode(state.intro.output); if (!c) return toast('다운로드할 내용이 없습니다'); download(`intro-${new Date().toISOString().slice(0, 10)}.html`, introFullDoc(c), 'text/html;charset=utf-8'); };
  $('#introSaveBtn').onclick = () => saveIntro();
  $('#introOpenBtn').onclick = () => { const c = cleanIntroCode(state.intro.output); if (!c) return toast('표시할 내용이 없습니다'); const w = window.open('', '_blank'); if (w) { w.document.write(introFullDoc(c)); w.document.close(); } };

  // ===== 에셋 =====
  $$('.asset-tab').forEach(t => t.onclick = () => setAssetMode(t.dataset.assetTab));
  $('#assetSceneCount').oninput = () => $('#assetSceneCountVal').textContent = $('#assetSceneCount').value;
  $('#assetSceneCount').onchange = () => persistOpts('asset');
  $('#assetCharSelect').onchange = (e) => { const c = state.chars.find(x => x.id === e.target.value); if (c) { $('#assetCharBody').value = c.body; $('#assetCharName').value = c.name; } };
  $('#assetWorldSelect').onchange = (e) => { const id = e.target.value; if (!id) { $('#assetWorldBody').value = ''; return; } const w = state.worlds.find(x => x.id === id); if (w) $('#assetWorldBody').value = w.body; };
  $('#assetGenerateBtn').onclick = generateAsset;
  $('#assetCopyBtn').onclick = () => { const j = buildAssetJSON(); if (!j) return toast('먼저 생성을 완료하세요'); navigator.clipboard.writeText(JSON.stringify(j, null, 2)); toast('JSON 복사됨'); };
  $('#assetDownloadBtn').onclick = () => { const j = buildAssetJSON(); if (!j) return toast('먼저 생성을 완료하세요'); download(safeFileName(j.name) + '_scenes.json', JSON.stringify(j, null, 2), 'application/json'); toast('JSON 다운로드 완료'); };

  // ===== 소재 추천 =====
  $$('[data-rec-tab]').forEach(t => t.onclick = () => setRecTab(t.dataset.recTab));
  $('#recCount').oninput = () => $('#recCountVal').textContent = $('#recCount').value;
  $('#recCount').onchange = () => persistOpts('recommend');
  $('#recGenerateBtn').onclick = generateRecommend;

  // ===== 보관함 =====
  $$('.lib-tab').forEach(t => t.onclick = () => setLibTab(t.dataset.libTab));
  $('#libNewBtn').onclick = () => { state.libTab === 'templates' ? openTemplateModal(null) : openItemModal(state.libTab, null); };

  // ===== 모달 =====
  $('#modalCloseBtn').onclick = closeModal;
  $('#modalCancelBtn').onclick = closeModal;
  $('#modalSaveBtn').onclick = saveModal;
  $('#modalBackdrop').onclick = (e) => { if (e.target.id === 'modalBackdrop') closeModal(); };
  $('#detailCloseBtn').onclick = closeDetail;
  $('#detailBackdrop').onclick = (e) => { if (e.target.id === 'detailBackdrop') closeDetail(); };
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!$('#modalBackdrop').classList.contains('hidden')) closeModal();
    else if (!$('#detailBackdrop').classList.contains('hidden')) closeDetail();
  });

  // ===== 설정 =====
  $('#saveKeysBtn').onclick = () => {
    state.keys.anthropic = $('#anthropicKey').value.trim();
    state.keys.google = $('#googleKey').value.trim();
    LS.set('keys', state.keys); toast('API 키 저장됨');
  };
  $('#savePersonaTplBtn').onclick = () => {
    state.personaTemplate = $('#personaTemplate').value;
    state.personaNsfwTemplate = $('#personaNsfwTemplate').value;
    LS.set('personaTemplate', state.personaTemplate);
    LS.set('personaNsfwTemplate', state.personaNsfwTemplate);
    toast('페르소나 양식 저장됨');
  };
  $('#savePromptsBtn').onclick = () => {
    for (const k of SP_KEYS) state.systemPrompts[k] = $('#sp-' + k).value;
    LS.set('systemPrompts', state.systemPrompts); toast('시스템 프롬프트 저장됨');
  };
  $$('[data-reset-sp]').forEach(b => b.onclick = () => {
    const k = b.dataset.resetSp;
    if (!confirm('해당 시스템 프롬프트를 기본값으로 복원하시겠습니까?')) return;
    $('#sp-' + k).value = DEFAULT_SYSTEM_PROMPTS[k];
    toast('기본값 복원됨 (저장 버튼을 눌러야 적용됩니다)');
  });
  $$('[data-reset]').forEach(b => b.onclick = () => {
    const k = b.dataset.reset;
    const def = k === 'personaTemplate' ? DEFAULT_PERSONA_TEMPLATE : DEFAULT_PERSONA_NSFW_TEMPLATE;
    $('#' + k).value = def;
    toast('기본값 복원됨 (저장 버튼을 눌러야 적용됩니다)');
  });
  $('#exportDataBtn').onclick = exportData;
  $('#importDataBtn').onclick = () => $('#importFile').click();
  $('#importFile').onchange = (e) => { if (e.target.files[0]) importData(e.target.files[0]); e.target.value = ''; };
  $('#clearDataBtn').onclick = clearAllData;
}

/* ============================================================
   18. 초기화
   ============================================================ */
function init() {
  applyTheme();
  // 선택된 양식이 없으면 보정
  if (state.selectedTemplateId !== '__blank__' && !state.templates.find(t => t.id === state.selectedTemplateId)) {
    state.selectedTemplateId = state.templates[0]?.id || '__blank__';
    LS.set('selectedTemplate', state.selectedTemplateId);
  }
  // 옵션 카드 초기화
  ['generate', 'persona', 'intro', 'asset', 'recommend'].forEach(applyOptsToCard);
  bind();
  renderTemplateChips();
  refreshAllSelects();
  setGTab('world');
  setRecTab('world');
  setLibTab('worlds');
  setStatus('gen', '', '대기 중');
  setStatus('pm', '', '대기 중');
  setStatus('intro', '', '대기 중');
  setStatus('asset', '', '대기 중');
  setStatus('rec', '', '대기 중');
  // NSFW 토글 초기 상태
  $('#pmNsfwToggle').classList.toggle('checked', $('#pmNsfw').checked);
}

document.addEventListener('DOMContentLoaded', init);
