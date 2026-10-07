export type PrivacySection = {
  id: string;
  heading: string;
  body: string[];
  bullets?: string[];
};

export const PRIVACY_EFFECTIVE_DATE = "October 7, 2026";

export const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    id: "information-we-collect",
    heading: "1. Information we collect",
    body: [
      "We collect only the information needed to run your household smoothly. This includes information you provide directly and information generated when you use HouseMira:",
    ],
    bullets: [
      "Account information: name, email address, and password or sign-in method when you create an account or join a family circle.",
      "Household content: calendars, reminders, lists, and notes you create or share with your circle.",
      "Usage information: basic diagnostics such as pages viewed, features used, and error logs that help us improve reliability.",
      "Device information: device type, operating system, and app version used to access HouseMira.",
    ],
  },
  {
    id: "how-we-use-information",
    heading: "2. How we use your information",
    body: ["We use your information to provide, maintain, and improve HouseMira:"],
    bullets: [
      "To create your account and manage your family circles and invitations.",
      "To sync calendars, reminders, and shared lists across your household devices.",
      "To provide security, prevent abuse, and troubleshoot technical issues.",
      "To communicate important updates about your account, security, or changes to this policy.",
    ],
  },
  {
    id: "sharing-and-disclosure",
    heading: "3. Sharing and disclosure",
    body: [
      "Your household content is shared only with members of your family circle that you invite. We do not sell your personal information or share household content with advertisers.",
      "We disclose information only when necessary to:",
    ],
    bullets: [
      "Provide the service through trusted processors (such as hosting providers) bound by confidentiality obligations.",
      "Comply with applicable law, legal process, or an enforceable government request.",
      "Protect the safety, rights, or property of our users and the public.",
    ],
  },
  {
    id: "data-security",
    heading: "4. Data security",
    body: [
      "Household data is encrypted in transit and at rest. Family circles are private by default, and invitations are required to join. We apply access controls, routine monitoring, and secure development practices to protect your information. No method of transmission or storage is completely secure, so we encourage you to use a strong, unique password and keep invitation links private.",
    ],
  },
  {
    id: "data-retention",
    heading: "5. Data retention",
    body: [
      "We keep your information only for as long as your account is active or as needed to provide the service. When you delete household content or close your account, we delete or anonymize associated data within a reasonable period, except where we must retain limited records for legal, security, or accounting purposes.",
    ],
  },
  {
    id: "your-rights",
    heading: "6. Your rights and choices",
    body: ["You control your household data. You may:"],
    bullets: [
      "Access, correct, or delete your account information and household content at any time in the app.",
      "Leave a family circle or remove members you invited.",
      "Request a copy or deletion of your personal data by contacting us at the address below.",
      "Opt out of non-essential communications; we will still send service and security notices.",
    ],
  },
  {
    id: "childrens-privacy",
    heading: "7. Children's privacy",
    body: [
      "HouseMira is designed for household use, including a kid-friendly view. Children may only use HouseMira through a family circle managed by a parent or guardian. We do not knowingly collect personal information directly from children without parental involvement. If you believe a child has provided information without consent, contact us and we will remove it promptly.",
    ],
  },
  {
    id: "changes",
    heading: "8. Changes to this policy",
    body: [
      "We may update this policy as HouseMira evolves. When we make material changes, we will update the effective date above and notify you through the app or by email where appropriate. Continued use of HouseMira after changes take effect means you accept the updated policy.",
    ],
  },
  {
    id: "contact",
    heading: "9. Contact us",
    body: [
      "If you have questions about this Privacy Policy or your data, contact us at privacy@housemira.example. We aim to respond to all requests within 30 days.",
    ],
  },
];
