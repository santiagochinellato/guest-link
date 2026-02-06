import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface PreArrivalEmailProps {
  guestName: string;
  propertyName: string;
  checkIn: string;
  guideUrl: string;
}

export function PreArrivalEmail({ guestName, propertyName, checkIn, guideUrl }: PreArrivalEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Tu guía digital para {propertyName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>¡Hola {guestName}!</Heading>
          <Text style={text}>
            Tu check-in en <strong>{propertyName}</strong> está programado para el{" "}
            <strong>{checkIn}</strong>.
          </Text>
          <Text style={text}>
            Aquí tienes tu guía digital con toda la información que necesitas: WiFi, reglas,
            recomendaciones y más.
          </Text>
          <Section style={buttonContainer}>
            <Link href={guideUrl} style={button}>
              Abrir guía digital
            </Link>
          </Section>
          <Text style={footer}>¡Te esperamos!</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
  borderRadius: "8px",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  margin: "0 0 20px",
};

const text = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const button = {
  backgroundColor: "#1a1a1a",
  color: "#fff",
  padding: "12px 24px",
  borderRadius: "6px",
  textDecoration: "none",
  fontSize: "16px",
  fontWeight: "600",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  marginTop: "24px",
};
