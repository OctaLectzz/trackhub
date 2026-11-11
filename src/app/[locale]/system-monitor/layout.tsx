import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TrackHub — System Diagnostics",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
  },
};

export default function SystemMonitorLayout({
  children,
}: {
  readonly children: React.ReactNode;
}): React.ReactNode {
  return children;
}
