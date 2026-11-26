// 핀터레스트용 세로 카드 이미지 (빌드 때 만들어짐)
import { pinList, pinPng } from '../../pins/pins.js';

export function getStaticPaths() {
  return pinList().map((p) => ({ params: { id: p.id }, props: { p } }));
}

export function GET({ props }) {
  return new Response(pinPng(props.p), { headers: { 'Content-Type': 'image/png' } });
}
