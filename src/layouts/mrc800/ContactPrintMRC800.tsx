import { SectionHeading } from '@/components/catalog/SectionHeading';
import { PrintImage } from '@/components/catalog/PrintImage';

/**
 * Print-only Contact section. Shared between all catalogs in the PDF
 * output — content does not depend on the per-catalog data, so it lives
 * inline here as the single source of truth. Placeholder values to be
 * replaced with the final METRO contact details.
 */
const CONTACT = {
  company: 'METRO Meble',
  tagline: 'Made in Poland',
  address: {
    line1: 'ul. Składowa 20',
    line2: '16-300 Augustów, Poland',
  },
  phone: '(+48) 87 644 6444',
  email: 'office@metromeble.pl',
  website: 'metromeble.pl',
};

interface ContactBlockProps {
  label: string;
  children: React.ReactNode;
}

function ContactBlock({ label, children }: ContactBlockProps) {
  return (
    <div className="contact-print-block">
      <p className="contact-print-block-label">{label}</p>
      <div className="contact-print-block-value">{children}</div>
    </div>
  );
}

export default function ContactPrintMRC800() {
  return (
    <div className="print-page print-page-contact">
      <section
        id="contact"
        className="print-section"
        aria-labelledby="contact-title"
      >
        <div className="print-section-frame">
          <SectionHeading
            id="contact"
            sectionLabel="Contact"
            title="Get in touch"
            className="print-section-heading"
          />

          <div className="print-section-content contact-print-content">
            <div className="contact-print-left">
              <div className="contact-print-company">
                <p className="contact-print-company-name">{CONTACT.company}</p>
                <p className="contact-print-company-tagline">
                  {CONTACT.tagline}
                </p>
              </div>

              <div className="contact-print-grid">
                <ContactBlock label="Address">
                  <p>{CONTACT.address.line1}</p>
                  <p>{CONTACT.address.line2}</p>
                </ContactBlock>

                <ContactBlock label="Phone">
                  <p>{CONTACT.phone}</p>
                </ContactBlock>

                <ContactBlock label="Email">
                  <p>{CONTACT.email}</p>
                </ContactBlock>

                <ContactBlock label="Web">
                  <p>{CONTACT.website}</p>
                </ContactBlock>
              </div>

              <p className="contact-print-note">
                For pricing, lead times, and tailored configurations please
                contact us using the channels above or visit our showroom by
                appointment.
              </p>
            </div>

            <div className="contact-print-map">
              <PrintImage
                src="/shared/contact-map.webp"
                alt={`Map showing ${CONTACT.company} at ${CONTACT.address.line1}, ${CONTACT.address.line2}`}
                className="contact-print-map-image"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
