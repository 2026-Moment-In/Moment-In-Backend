export class SaveInvitationDto {
  // ── 스타일 ──
  bgColor?: string;
  fontColor?: string;
  fontFamily?: string;
  bgTexture?: string;

  // ── 커버 ──
  coverImage?: string;
  coverImage2?: string;
  coverLayout?: string;
  motionType?: string;
  showGradient?: boolean;
  gradientDir?: string;
  gradientTone?: string;
  coverTextColor?: string;
  showCountdown?: boolean;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  grayscale?: number;

  // ── 인사말 ──
  greetingTitle?: string;
  greetingBody?: string;
  greetingPhoto?: string;
  greetingAnim?: string;
  greetingBgPos?: string;

  // ── 기본 정보 ──
  groomName?: string;
  groomRelation?: string;
  groomIntro?: string;
  groomDadName?: string;
  groomMomName?: string;
  groomDadDeceased?: boolean;
  groomMomDeceased?: boolean;
  groomPhoto?: string;
  groomContact?: string;
  brideName?: string;
  brideRelation?: string;
  brideIntro?: string;
  brideDadName?: string;
  brideMomName?: string;
  brideDadDeceased?: boolean;
  brideMomDeceased?: boolean;
  bridePhoto?: string;
  brideContact?: string;
  basicInfoPreset?: string;
  basicInfoTitle?: string;
  groomFirst?: boolean;
  hideParents?: boolean;
  showContact?: boolean;

  // ── 예식 ──
  dateBlockTitle?: string;
  showDDay?: boolean;
  weddingDate?: string;
  weddingTime?: string;

  // ── 장소 ──
  venueName?: string;
  venueDetail?: string;
  venueAddress?: string;
  lat?: number;
  lng?: number;

  // ── 오시는 길 ──
  locationTitle?: string;
  transportInfo?: Record<string, string>;
  subwayInfo?: string;
  busInfo?: string;
  carInfo?: string;
  walkInfo?: string;
  markerTitle?: string;
  markerIconIdx?: number;
  useCustomMarker?: boolean;

  // ── 계좌 ──
  accountTitle?: string;
  accountMsg?: string;
  accountMsgEnabled?: boolean;
  accountGroomFirst?: boolean;
  groomAccounts?: { bank: string; holder: string; number: string; relation: string }[];
  brideAccounts?: { bank: string; holder: string; number: string; relation: string }[];

  // ── 안내사항 ──
  noticeTitle?: string;
  noticeItems?: { id: string; title: string; content: string }[];

  // ── 주변 ──
  nearbyTitle?: string;
  nearbySubtitle?: string;
  nearbyItems?: { title: string; desc?: string; imageUrl?: string }[];

  // ── 갤러리 ──
  gallery?: string[];
  galleryLayout?: string;

  // ── 메시지 ──
  msgTitle?: string;
  messageMaxLen?: number;

  // ── 엔딩 ──
  endingMsg?: string;
  showPetals?: boolean;

  // ── 레거시 호환 ──
  mood?: string;
  transport?: string;
  transportGuide?: string;
  nearbyPlaces?: string[];
}
