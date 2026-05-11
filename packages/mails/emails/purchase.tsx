import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  pixelBasedPreset,
  Row,
  render,
  Section,
  Tailwind,
  Text,
} from "react-email";

export interface PurchaseEmailProps {
  invoiceNumber?: string | null;
  name?: string | null;
  total: string;
}

export const purchaseEmailSubject = "Your Barakah lifetime is confirmed";

const brandIconUrl = "https://heybarakah.app/icon.svg";

export async function renderPurchaseEmail(props: PurchaseEmailProps) {
  const html = await render(<PurchaseEmail {...props} />);
  const text = await render(<PurchaseEmail {...props} />, { plainText: true });

  return {
    html,
    subject: purchaseEmailSubject,
    text,
  };
}

export default function PurchaseEmail({
  name,
  total = "$29.00",
  invoiceNumber,
}: PurchaseEmailProps) {
  const greeting = name
    ? `As-salaamu alaykum, ${name}.`
    : "As-salaamu alaykum.";

  return (
    <Html dir="ltr" lang="en">
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                background: "#F7F7F3",
                border: "#E5E7EB",
                divider: "#EFEFEF",
                ink: "#0F1311",
                muted: "#6B7280",
                mutedSoft: "#9CA3AF",
                primary: "#29603E",
                primaryDark: "#1F4A30",
                primarySoft: "#E8F0EA",
                surface: "#FFFFFC",
              },
              fontFamily: {
                sans: ["Inter", "Arial", "sans-serif"],
                serif: ["Libre Baskerville", "Georgia", "serif"],
              },
            },
          },
        }}
      >
        <Head />
        <Preview>Your Barakah lifetime is confirmed</Preview>

        <Body className="m-0 bg-background px-6 py-10 font-sans text-ink max-[480px]:px-2 max-[480px]:py-4">
          <Container className="mx-auto w-full max-w-[560px]">
            <Section className="mb-6 text-center">
              <Img
                alt=""
                className="inline-block align-middle"
                height="36"
                src={brandIconUrl}
                width="22"
              />
              <Text className="ml-2 inline-block align-middle font-bold font-serif text-[20px] text-primary leading-[28px]">
                Barakah App
              </Text>
            </Section>

            <Section className="overflow-hidden rounded-[24px] border border-border bg-surface">
              <Section className="bg-primary px-8 py-7 max-[480px]:px-5 max-[480px]:py-6">
                <Text className="m-0 font-medium text-[14px] text-surface leading-[21px]">
                  Barakah — Lifetime
                </Text>
                <Heading className="mt-3 mb-0 max-w-[420px] font-bold font-sans text-[30px] text-surface leading-[38px] max-[480px]:text-[26px] max-[480px]:leading-[33px]">
                  Your lifetime is confirmed.
                </Heading>
              </Section>

              <Section className="px-8 py-8 max-[480px]:px-5 max-[480px]:py-6">
                <Text className="mt-0 mb-4 text-[14px] text-ink leading-[22px]">
                  {greeting}
                </Text>
                <Text className="mt-0 mb-4 text-[14px] text-muted leading-[22px]">
                  Bismillah ir-Rahman ir-Raheem.
                </Text>
                <Text className="mt-0 mb-0 text-[14px] text-ink leading-[22px]">
                  Your lifetime access to Barakah is confirmed. Jazak Allahu
                  khayran for supporting the work.
                </Text>

                <Section className="mt-6 rounded-[16px] border border-divider bg-primarySoft px-5 py-4">
                  <Row>
                    <td
                      align="left"
                      className="font-medium text-[11px] text-primaryDark leading-[16px] tracking-[0.18em]"
                    >
                      TOTAL
                    </td>
                    <td
                      align="right"
                      className="font-bold font-sans text-[15px] text-ink leading-[20px]"
                    >
                      {total}
                    </td>
                  </Row>
                  {invoiceNumber ? (
                    <Row className="mt-2">
                      <td
                        align="left"
                        className="font-medium text-[11px] text-primaryDark leading-[16px] tracking-[0.18em]"
                      >
                        INVOICE
                      </td>
                      <td
                        align="right"
                        className="font-mono text-[13px] text-muted leading-[18px]"
                      >
                        {invoiceNumber}
                      </td>
                    </Row>
                  ) : null}
                </Section>

                <Text className="mt-6 mb-0 text-[14px] text-ink leading-[22px]">
                  We'll email you the moment early access opens. One quiet email
                  — nothing else.
                </Text>

                <Hr className="my-7 border-0 border-divider border-t border-solid" />

                <Text className="m-0 text-[12px] text-muted leading-[20px]">
                  Wa salaam,
                  <br />
                  The Barakah team
                </Text>
              </Section>
            </Section>

            <Text className="mx-auto mt-6 mb-0 max-w-[380px] text-center text-[12px] text-muted leading-[18px] max-[480px]:max-w-[260px] max-[480px]:text-[9px] max-[480px]:leading-[13px]">
              heybarakah.app
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
