import { env } from "@/lib/env";

export type PrivacySection = {
  id: string;
  heading: string;
  body: string[];
  bullets?: string[];
};

export const PRIVACY_EFFECTIVE_DATE = "October 7, 2026";

export const PRIVACY_CONTACT_EMAIL = env.NEXT_PUBLIC_PRIVACY_EMAIL;

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
      "Notes you create with Shared Notes: title (up to 100 characters), content (up to 2000 characters), optional author name (up to 50 characters), circle-family id you share with, and creation/update timestamps.",
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
      "To store and sync shared notes within your circle-family, attribute them to the author name you provide, and enforce circle-scoped access and deletion.",
      "To provide security, prevent abuse, and troubleshoot technical issues.",
      "To communicate important updates about your account, security, or changes to this policy.",
    ],
  },
  {
    id: "notes-and-sharing",
    heading: "3. Notes and circle-family sharing",
    body: [
      "Shared Notes lets you create personal notes and share specific notes with the circle-family you choose. Each note belongs to exactly one circle-family, identified by the circle-family id you enter when you create it.",
      "Collection: when you share a note we collect its title, content, optional author name, circle-family id, preferred locale for validation messages, and timestamps. We do not require more personal data than what you type into the note.",
      "Storage: notes are stored scoped to their circle-family id. They are encrypted in transit and at rest, and circles remain isolated — members of one circle-family cannot read, list, or delete notes that belong to a different circle.",
      "Sharing: every note is visible to all current members of its circle-family. The author name you provide is shown alongside the note. Deleting a note removes it for everyone in that circle. Requests scoped to the wrong circle-family are rejected.",
      "Controls: you can create notes and delete notes you have access to from the Shared Notes page. Leaving a circle-family or removing members stops future sharing with them. Deleting a note or closing your account triggers deletion or anonymization as described in Data retention.",
    ],
  },
  {
    id: "sharing-and-disclosure",
    heading: "4. Sharing and disclosure",
    body: [
      "Your household content — including shared notes — is shared only with members of the family circle that you invite. Each note is shared only with the circle-family it was created in. We do not sell your personal information or share household content with advertisers.",
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
    heading: "5. Data security",
    body: [
      "Household data, including notes, is encrypted in transit and at rest. Family circles are private by default, and invitations are required to join. Note reads, creates, and deletes are validated against the circle-family id and localized input limits, so one circle cannot access another circle's notes. We apply access controls, routine monitoring, and secure development practices to protect your information. No method of transmission or storage is completely secure, so we encourage you to use a strong, unique password and keep invitation links and circle-family ids private.",
    ],
  },
  {
    id: "data-retention",
    heading: "6. Data retention",
    body: [
      "We keep your information only for as long as your account is active or as needed to provide the service. When you delete a note, it is removed for all members of that circle-family. When you delete other household content or close your account, we delete or anonymize associated data within a reasonable period, except where we must retain limited records for legal, security, or accounting purposes.",
    ],
  },
  {
    id: "your-rights",
    heading: "7. Your rights and choices",
    body: ["You control your household data, including your notes. You may:"],
    bullets: [
      "Access, correct, or delete your account information and household content — including note titles, contents, and author names — at any time in the app.",
      "Leave a family circle or remove members you invited to stop sharing future notes with them.",
      "Request a copy or deletion of your personal data by contacting us at the address below.",
      "Opt out of non-essential communications; we will still send service and security notices.",
    ],
  },
  {
    id: "childrens-privacy",
    heading: "8. Children's privacy",
    body: [
      "HouseMira is designed for household use, including a kid-friendly view. Children may only use HouseMira — including Shared Notes — through a family circle managed by a parent or guardian. We do not knowingly collect personal information directly from children without parental involvement. If you believe a child has provided information without consent, contact us and we will remove it promptly.",
    ],
  },
  {
    id: "changes",
    heading: "9. Changes to this policy",
    body: [
      "We may update this policy as HouseMira evolves, including as Shared Notes evolves. When we make material changes, we will update the effective date above and notify you through the app or by email where appropriate. Continued use of HouseMira after changes take effect means you accept the updated policy.",
    ],
  },
  {
    id: "contact",
    heading: "10. Contact us",
    body: [
      `If you have questions about this Privacy Policy, your data, or Shared Notes sharing, contact us at ${PRIVACY_CONTACT_EMAIL}. We aim to respond to all requests within 30 days.`,
    ],
  },
];
