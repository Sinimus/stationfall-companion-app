import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Stationfall Companion",
    short_name: "Stationfall",
    description: "Pravidlový průvodce deskovkou Stationfall (Zkáza na orbitě).",
    start_url: "/postavy",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
