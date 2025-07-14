
export default function DividerWave(props: any) {
  return (
    <>
      <div class={`divider ${props.class || ''}`}>
        <svg width="50%" height="10" viewBox="0 0 1200 10" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 5 Q 10 0, 20 5 T 40 5 T 60 5 T 80 5 T 100 5 T 120 5 T 140 5 T 160 5 T 180 5 T 200 5 T 220 5 T 240 5 T 260 5 T 280 5 T 300 5 T 320 5 T 340 5 T 360 5 T 380 5 T 400 5 T 420 5 T 440 5 T 460 5 T 480 5 T 500 5 T 520 5 T 540 5 T 560 5 T 580 5 T 600 5 T 620 5 T 640 5 T 660 5 T 680 5 T 700 5 T 720 5 T 740 5 T 760 5 T 780 5 T 800 5 T 820 5 T 840 5 T 860 5 T 880 5 T 900 5 T 920 5 T 940 5 T 960 5 T 980 5 T 1000 5 T 1020 5 T 1040 5 T 1060 5 T 1080 5 T 1100 5 T 1120 5 T 1140 5 T 1160 5 T 1180 5 T 1200 5"
            fill="none" stroke="black" stroke-width="1" />
        </svg>
      </div>
    </>
  );
}
