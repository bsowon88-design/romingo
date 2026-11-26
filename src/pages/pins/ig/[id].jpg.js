// 인스타그램용 세로 카드 (1080×1350 JPG) — scripts/instagram.mjs 가 이 주소를 씀
import { pinList, pinJpg } from '../../../pins/pins.js';

export function getStaticPaths() {
  return pinList().map((p) => ({ params: { id: p.id }, props: { p } }));
}

export async function GET({ props }) {
  return new Response(await pinJpg(props.p), { headers: { 'Content-Type': 'image/jpeg' } });
}
