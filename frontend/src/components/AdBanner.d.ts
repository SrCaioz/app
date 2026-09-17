// Tipagem compartilhada para AdBanner.native.tsx / AdBanner.web.tsx (Metro escolhe por plataforma).
interface AdBannerProps {
  spaced?: boolean;
  testID?: string;
}

declare const AdBanner: (props: AdBannerProps) => React.JSX.Element | null;
export default AdBanner;
