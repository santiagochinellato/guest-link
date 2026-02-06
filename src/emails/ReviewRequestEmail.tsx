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

interface ReviewRequestEmailProps {
  guestName: string;
  propertyName: string;
  reviewUrl?: string;
}

export function ReviewRequestEmail({
  guestName,
  propertyName,
  reviewUrl = "#",
}: ReviewRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>¿Cómo fue tu estancia en {propertyName}?</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>¡Hola {guestName}!</Heading>
          <Text style={text}>
            Esperamos que hayas disfrutado tu estancia en <strong>{propertyName}</strong>.
          </Text>
          <Text style={text}>
            Tu opinión nos ayuda a mejorar. ¿Podrías contarnos cómo fue tu experiencia?
          </Text>
          {reviewUrl && reviewUrl !== "#" && (
            <Section style={buttonContainer}>
              <Link href={reviewUrl} style={button}>
                Dejar reseña
              </Link>
            </Section>
          )}
          <Text style={footer}>¡Gracias por tu tiempo!</Text>
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
