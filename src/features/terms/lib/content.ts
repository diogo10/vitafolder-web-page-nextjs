import { env } from "@/lib/env";

export type TermsSection = {
  id: string;
  heading: string;
  body: string[];
  bullets?: string[];
};

export const TERMS_EFFECTIVE_DATE = "October 7, 2026";

export const TERMS_CONTACT_EMAIL = env.NEXT_PUBLIC_PRIVACY_EMAIL;

export const TERMS_SECTIONS: TermsSection[] = [
  {
    id: "agreement",
    heading: "1. Agreement to these terms",
    body: [
      'These Terms and Conditions ("Terms") form a binding agreement between you and HouseMira for your use of the HouseMira app and website, including calendars, reminders, shared lists, and Shared Notes. By creating an account, joining a family circle, or using HouseMira, you agree to these Terms and to our Privacy Policy.',
      "If you do not agree to these Terms, do not use HouseMira. If you accept these Terms on behalf of a household or family circle, you confirm you have authority to do so.",
    ],
  },
  {
    id: "description-of-service",
    heading: "2. Description of the service",
    body: [
      "HouseMira brings your calendar, reminders, shared lists, and shared notes into one calm, private space. Shared Notes lets you create personal notes and share specific notes with the circle-family you choose:",
    ],
    bullets: [
      "Create notes with a title (up to 100 characters), content (up to 2000 characters), and an optional author name (up to 50 characters).",
      "Assign each note to exactly one circle-family, identified by the circle-family id you enter when you create it.",
      "Sync calendars, reminders, shared lists, and shared notes across your household devices.",
    ],
  },
  {
    id: "accounts-circles-invitations",
    heading: "3. Accounts, circles, and invitations",
    body: [
      "You need an account to create or join a family circle. Family circles are private by default and require an invitation to join. You agree to:",
    ],
    bullets: [
      "Provide accurate account information such as your name, email address, and sign-in method.",
      "Keep your password, invitation links, and circle-family ids private and secure.",
      "Use a strong, unique password and promptly notify us of any unauthorized access.",
      "Ensure children only use HouseMira — including Shared Notes — through a family circle managed by a parent or guardian.",
    ],
  },
  {
    id: "acceptable-use",
    heading: "4. Acceptable use",
    body: [
      "You agree to use HouseMira lawfully and respectfully, and not to misuse household content or the service. You must not:",
    ],
    bullets: [
      "Share unlawful, harmful, abusive, or infringing calendars, reminders, lists, or notes.",
      "Attempt to access another circle-family's notes, bypass circle-scoped access controls, or use a wrong circle-family id to read, list, or delete notes that are not yours to access.",
      "Disrupt the service, probe security, transmit malware, or interfere with other users.",
      "Sell, resell, or scrape household content, or use HouseMira for advertising or unsolicited communications.",
    ],
  },
  {
    id: "notes-and-sharing",
    heading: "5. Shared Notes and circle-family rules",
    body: [
      "Each Shared Note belongs to exactly one circle-family. Every note is visible to all current members of its circle-family, and the author name you provide is shown alongside the note.",
      "Storage: notes are stored scoped to their circle-family id. They are encrypted in transit and at rest, and circles remain isolated — members of one circle-family cannot read, list, or delete notes that belong to a different circle.",
      "Deletion: deleting a note removes it for everyone in that circle. Requests scoped to the wrong circle-family are rejected. Leaving a circle-family or removing members stops future sharing with them.",
      "You are responsible for the titles, contents, and author names you share. Do not include more personal data than your household needs in a note.",
    ],
  },
  {
    id: "privacy",
    heading: "6. Privacy",
    body: [
      "Your privacy matters. How we collect, use, store, and share household data — including note titles, contents, author names, circle-family ids, and timestamps — is described in our Privacy Policy. This includes encryption in transit and at rest, circle-scoped validation of note reads, creates, and deletes, and deletion or anonymization when you delete content or close your account.",
      "By using HouseMira, you acknowledge the practices in the Privacy Policy, including that shared notes are shared only with members of the family circle you invite and that we do not sell your personal information or share household content with advertisers.",
    ],
  },
  {
    id: "termination",
    heading: "7. Suspension and termination",
    body: [
      "You may stop using HouseMira at any time. When you delete a note, it is removed for all members of that circle-family. When you delete other household content or close your account, we delete or anonymize associated data within a reasonable period, except where we must retain limited records for legal, security, or accounting purposes.",
      "We may suspend or terminate accounts or circles that violate these Terms, threaten security, or are required by law. We aim to give notice where appropriate before terminating active households.",
    ],
  },
  {
    id: "disclaimers-liability",
    heading: "8. Disclaimers and limitation of liability",
    body: [
      'HouseMira is provided on an "as is" and "as available" basis. We apply access controls, routine monitoring, and secure development practices, but no method of transmission or storage is completely secure and we do not guarantee uninterrupted or error-free operation.',
      "To the maximum extent permitted by law, HouseMira is not liable for indirect, incidental, or consequential damages arising from your use of the service or shared household content. Our total liability for any claim is limited to the amount you paid for the service in the 12 months before the claim, or $50 if you use the free service.",
    ],
  },
  {
    id: "changes",
    heading: "9. Changes to these terms",
    body: [
      "We may update these Terms as HouseMira evolves, including as Shared Notes evolves. When we make material changes, we will update the effective date above and notify you through the app or by email where appropriate. Continued use of HouseMira after changes take effect means you accept the updated Terms.",
    ],
  },
  {
    id: "contact",
    heading: "10. Contact us",
    body: [
      `If you have questions about these Terms, your household data, or Shared Notes sharing, contact us at ${TERMS_CONTACT_EMAIL}. We aim to respond to all requests within 30 days.`,
    ],
  },
];
