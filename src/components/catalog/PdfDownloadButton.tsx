import { Download } from 'lucide-react';

interface Props {
  catalogId: string;
}

function PdfFileIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <text
        x="12"
        y="18"
        textAnchor="middle"
        fontSize="6.5"
        fontWeight="700"
        fill="currentColor"
        stroke="none"
      >
        PDF
      </text>
    </svg>
  );
}

export default function PdfDownloadButton({ catalogId }: Props) {
  const href = `/catalogs/${catalogId}/Download/metro-${catalogId.toLowerCase()}.pdf`;
  const filename = `metro-${catalogId.toLowerCase()}.pdf`;

  return (
    <a
      href={href}
      download={filename}
      rel="noopener noreferrer"
      title="Download PDF"
      aria-label="Download PDF"
      className="print-hide group fixed bottom-6 right-6 z-50 inline-flex h-11 min-w-[44px] items-center justify-center gap-2 bg-primary px-4 text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <Download size={16} strokeWidth={2} aria-hidden="true" />
      <PdfFileIcon size={18} />
    </a>
  );
}
