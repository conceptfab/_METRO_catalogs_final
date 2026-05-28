'use client';

import { useEffect, useRef } from 'react';

type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | JsonLdValue[]
  | { [key: string]: JsonLdValue };

interface JsonLdProps {
  data: JsonLdValue;
}

export function JsonLd({ data }: JsonLdProps) {
  const scriptRef = useRef<HTMLScriptElement>(null);

  useEffect(() => {
    if (scriptRef.current) {
      const json = JSON.stringify(data)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026')
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');
      scriptRef.current.textContent = json;
    }
  }, [data]);

  return <script ref={scriptRef} type="application/ld+json" />;
}
