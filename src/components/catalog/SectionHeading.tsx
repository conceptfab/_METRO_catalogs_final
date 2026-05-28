import { QxText } from './QxText';

interface SectionHeadingProps {
  id: string;
  sectionLabel: string;
  title: string;
  titleLine2?: string;
  className?: string;
}

export function SectionHeading({
  id,
  sectionLabel,
  title,
  titleLine2,
  className = '',
}: SectionHeadingProps) {
  return (
    <div className={className}>
      <p className="section_ID font-display uppercase"><QxText text={sectionLabel} /></p>
      <h2 id={`${id}-title`} className="section_Title mt-8 font-display font-normal lg:mt-7">
        <QxText text={title} />
        {titleLine2 && (
          <>
            <br />
            <QxText text={titleLine2} />
          </>
        )}
      </h2>
    </div>
  );
}
