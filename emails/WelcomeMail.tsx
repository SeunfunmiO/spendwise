import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components"
import { BarChart, CheckCircle, TrendingUp } from "lucide-react"

interface WelcomeEmailProps {
    name: string
}

export default function WelcomeEmail({ name }: WelcomeEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Welcome to SpendWise — let&apos;s take control of your money 💸 </Preview>
            <Body style={main}>
                <Container style={container}>

                    {/* Header */}
                    <Section style={header}>
                        <table width="100%" cellPadding="0" cellSpacing="0">
                            <tr>
                                <td style={logoIconCell}>
                                    <div style={logoIcon}>
                                        <span style={logoIconBar1} />
                                        <span style={logoIconBar2} />
                                        <span style={logoIconBar3} />
                                    </div>
                                </td>
                                <td style={logoTextCell}>
                                    <span style={logoTextGreen}>Spend</span>
                                    <span style={logoTextWhite}>Wise</span>
                                </td>
                            </tr>
                        </table>
                    </Section>

                    {/* Main Content */}
                    <Section style={content}>
                        <Heading style={heading}>Welcome, {name}! 🎉</Heading>
                        <Text style={paragraph}>
                            You&apos;ve just taken the first step toward smarter money management.
                            SpendWise helps you track your income and expenses, set budget
                            goals, and visualize your spending habits — all in one place.
                        </Text>

                        <Text style={paragraph}>Here&apos;s what you can do right away:</Text>

                        <Text style={listItem}>✅ Add your first transaction</Text>
                        <Text style={listItem}>📊 Set a monthly budget goal</Text>
                        <Text style={listItem}>📈 View your spending breakdown</Text>

                        <Section style={buttonContainer}>
                            <Button
                                style={button}
                                href={process.env.NEXTAUTH_URL}
                            >
                                Get Started →
                            </Button>
                        </Section>

                        <Hr style={hr} />

                        <Text style={footer}>
                            If you didn&apos;t create this account, you can safely ignore this
                            email. If you have any questions, reply to this email anytime.
                        </Text>
                        <Text style={footer}>
                            — The SpendWise Team
                            {new Date().getFullYear()}
                        </Text>
                    </Section>

                </Container>
            </Body>
        </Html>
    )
}

// ---- Styles ----
const main = {
    backgroundColor: "#f6f9fc",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
}

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "0",
    maxWidth: "600px",
    borderRadius: "8px",
    overflow: "hidden" as const,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
}

const header = {
    backgroundColor: "#16a34a",
    padding: "24px 40px",
}

const logo = {
    color: "#ffffff",
    fontSize: "24px",
    fontWeight: "700",
    margin: "0",
}

const content = {
    padding: "40px",
}

const heading = {
    fontSize: "22px",
    fontWeight: "700",
    color: "#111827",
    margin: "0 0 16px",
}

const paragraph = {
    fontSize: "15px",
    lineHeight: "1.6",
    color: "#374151",
    margin: "0 0 16px",
}

const listItem = {
    fontSize: "15px",
    lineHeight: "1.8",
    color: "#374151",
    margin: "0 0 4px",
}

const buttonContainer = {
    textAlign: "center" as const,
    margin: "32px 0",
}

const button = {
    backgroundColor: "#16a34a",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    padding: "12px 32px",
    textDecoration: "none",
    display: "inline-block",
}

const hr = {
    borderColor: "#e5e7eb",
    margin: "32px 0 24px",
}

const logoIconCell = {
    width: "40px",
    verticalAlign: "middle" as const,
    paddingRight: "10px",
}

const logoIcon = {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: "8px",
    padding: "6px 8px",
    display: "inline-flex",
    gap: "3px",
    alignItems: "flex-end",
}

const logoIconBar1 = {
    display: "inline-block",
    width: "5px",
    height: "10px",
    backgroundColor: "#ffffff",
    borderRadius: "2px",
}

const logoIconBar2 = {
    display: "inline-block",
    width: "5px",
    height: "15px",
    backgroundColor: "#ffffff",
    opacity: "0.85",
    borderRadius: "2px",
}

const logoIconBar3 = {
    display: "inline-block",
    width: "5px",
    height: "20px",
    backgroundColor: "#ffffff",
    opacity: "0.7",
    borderRadius: "2px",
}

const logoTextCell = {
    verticalAlign: "middle" as const,
}

const logoTextGreen = {
    fontSize: "22px",
    fontWeight: "700" as const,
    color: "#ffffff",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
}

const logoTextWhite = {
    fontSize: "22px",
    fontWeight: "400" as const,
    color: "rgba(255,255,255,0.85)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
}

const footer = {
    fontSize: "13px",
    color: "#9ca3af",
    lineHeight: "1.6",
    margin: "0 0 8px",
}
