import type { ReactNode } from 'react';

const QX_TOKEN_REGEX = /^(?:Q[SX]|VR|TS|FM|FOTA|MRC(?:800|1000))$/i;
const TEXT_TOKEN_REGEX = /\\n|\/n|\n|\b(?:Q[SX]|VR|TS|FM|FOTA|MRC(?:800|1000))\b/gi;

function renderText(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(TEXT_TOKEN_REGEX)) {
    const token = match[0];
    const tokenStart = match.index;

    if (tokenStart > cursor) {
      nodes.push(text.slice(cursor, tokenStart));
    }

    if (QX_TOKEN_REGEX.test(token)) {
      nodes.push(
        <span key={`qx-${tokenStart}`} className="qx-word">
          {token.toUpperCase()}
        </span>,
      );
    } else {
      nodes.push(<br key={`br-${tokenStart}`} />);
    }

    cursor = tokenStart + token.length;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
}

interface QxTextProps {
  text: string;
}

export function QxText({ text }: QxTextProps): ReactNode {
  return renderText(text);
}
