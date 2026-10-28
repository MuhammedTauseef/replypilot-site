import { ImageResponse } from "next/og";

/**
 * iOS home-screen icon — same artwork as app/icon.svg / BrandMark:
 * gold paper plane on navy, drawn from the site tokens
 * (--navy #0a172a, --gold #bd9e6d, --gold-deep #9a7c4e).
 * Full-bleed navy with no rounded corners or transparency:
 * iOS applies its own mask to apple-touch-icons.
 */
export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a172a",
        }}
      >
        <svg width="146" height="146" viewBox="0 0 24 24" fill="none">
          <path
            d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
            fill="#bd9e6d"
          />
          <path d="M2 14l15-2-15 9z" fill="#9a7c4e" />
        </svg>
      </div>
    ),
    {
      ...size,
    },
  );
}
