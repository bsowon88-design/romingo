// 많이 고민하는 여행지 짝 — 짝마다 /compare/a-vs-b/ 페이지가 생김 (검색용)
import { TRIP_DATA } from './tripdata.js';
export const PAIRS = [
  ['danang', 'nhatrang'], ['tokyo', 'osaka'], ['osaka', 'fukuoka'], ['cebu', 'boracay'],
  ['bangkok', 'phuket'], ['taipei', 'hongkong'], ['danang', 'phuquoc'], ['qingdao', 'weihai'],
  ['tokyo', 'fukuoka'], ['osaka', 'kyoto'], ['sapporo', 'okinawa'], ['nhatrang', 'phuquoc'], ['hanoi', 'hochiminh'],
  ['danang', 'hanoi'], ['danang', 'cebu'], ['bangkok', 'chiangmai'], ['bali', 'phuket'], ['cebu', 'bohol'],
  ['guam', 'saipan'], ['guam', 'okinawa'], ['singapore', 'kualalumpur'], ['taipei', 'kaohsiung'], ['shanghai', 'beijing'],
  ['tokyo', 'taipei'], ['sydney', 'melbourne'],
].filter(([a, b]) => TRIP_DATA[a] && TRIP_DATA[b]);
