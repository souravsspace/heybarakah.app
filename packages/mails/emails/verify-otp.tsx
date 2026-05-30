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
  render,
  Section,
  Tailwind,
  Text,
} from "react-email";

export interface VerifyOtpEmailProps {
  code: string;
  expiresInMinutes?: number;
}

export const verifyOtpEmailSubject = "Your Barakah verification code";

const previewCode = "482916";
const defaultExpiresInMinutes = 10;
const brandIconUrl = "https://heybarakah.app/icon.svg";

export async function renderVerifyOtpEmail({
  code,
  expiresInMinutes = defaultExpiresInMinutes,
}: VerifyOtpEmailProps) {
  const html = await render(
    <VerifyOtpEmail code={code} expiresInMinutes={expiresInMinutes} />
  );
  const text = await render(
    <VerifyOtpEmail code={code} expiresInMinutes={expiresInMinutes} />,
    { plainText: true }
  );

  return {
    html,
    subject: verifyOtpEmailSubject,
    text,
  };
}

function formatCode(code: string) {
  return code.replace(/\s+/g, "").trim().split("").join(" ");
}

export default function VerifyOtpEmail({
  code = previewCode,
  expiresInMinutes = defaultExpiresInMinutes,
}: VerifyOtpEmailProps) {
  const formattedCode = formatCode(code);

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
        <Preview>
          A sign-in code was requested for your Barakah account.
        </Preview>

        <Body className="m-0 bg-background px-6 py-10 font-sans text-ink max-[480px]:px-2 max-[480px]:py-4">
          <Container className="mx-auto w-full max-w-[560px]">
            <Section className="mb-6 text-center">
              <Img
                alt="Barakah App logo"
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
                  Sign in code
                </Text>
                <Heading className="mt-3 mb-0 max-w-[420px] font-bold font-sans text-[30px] text-surface leading-[38px] max-[480px]:text-[26px] max-[480px]:leading-[33px]">
                  Verify your Barakah account
                </Heading>
              </Section>

              <Section className="px-8 py-8 max-[480px]:px-5 max-[480px]:py-6">
                <Text className="mt-0 mb-6 text-[14px] text-muted leading-[21px]">
                  Use this code to continue signing in. It is valid for{" "}
                  {expiresInMinutes} minutes.
                </Text>

                <Section className="rounded-[18px] border border-border bg-primarySoft px-5 py-6 text-center max-[480px]:px-3">
                  <Text className="mt-0 mb-3 font-medium text-[12px] text-primaryDark leading-[16px] tracking-[0.18em] max-[480px]:text-[10px] max-[480px]:leading-[14px] max-[480px]:tracking-[0.1em]">
                    VERIFICATION CODE
                  </Text>

                  <Text className="m-0 font-bold font-sans text-[40px] text-ink leading-[48px] tracking-[7px] max-[480px]:text-[28px] max-[480px]:leading-[36px] max-[480px]:tracking-[4px]">
                    {formattedCode}
                  </Text>
                </Section>

                <Section className="mt-6 rounded-[16px] border border-divider bg-surface px-5 py-4">
                  <Text className="m-0 text-[12px] text-muted leading-[20px]">
                    For your security, do not share this code with anyone.
                  </Text>
                </Section>

                <Hr className="my-7 border-0 border-divider border-t border-solid" />

                <Text className="m-0 text-center text-[12px] text-muted leading-[20px] max-[480px]:text-[9px]">
                  If this was not you, you can safely ignore this email.
                </Text>
              </Section>
            </Section>

            <Text className="mx-auto mt-6 mb-0 max-w-[380px] text-center text-[12px] text-muted leading-[18px] max-[480px]:max-w-[260px] max-[480px]:text-[9px] max-[480px]:leading-[13px]">
              Barakah helps you build a calmer, more consistent path in faith.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
