/**
 * ReplyPilot brand mark — gold paper plane ("reply + pilot") on a navy
 * rounded square, built from the site tokens (--navy #0a172a, --gold
 * #bd9e6d, --gold-deep #9a7c4e). Same artwork as app/icon.svg (favicon).
 */
export default function BrandMark() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      style={{ flex: "none", display: "block" }}
    >
      <rect width="64" height="64" rx="14" fill="#0a172a" />
      <g transform="translate(6 6) scale(2.1667)">
        <path
          d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
          fill="#bd9e6d"
        />
        <path d="M2 14l15-2-15 9z" fill="#9a7c4e" />
      </g>
    </svg>
  );
}
