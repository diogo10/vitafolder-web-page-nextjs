export const inviteFamilyLocales = ["en", "pt", "es"] as const;

export type InviteFamilyLocale = (typeof inviteFamilyLocales)[number];

type InviteFamilyStrings = {
  heading: string;
  subheading: string;
  recipientEmailLabel: string;
  recipientEmailPlaceholder: string;
  yourNameLabel: string;
  yourNamePlaceholder: string;
  familyNameLabel: string;
  familyNamePlaceholder: string;
  inviteCodeLabel: string;
  inviteCodePlaceholder: string;
  languageLabel: string;
  localeOptionLabels: Record<InviteFamilyLocale, string>;
  submitLabel: string;
  submittingLabel: string;
  successMessage: (to: string) => string;
  secureNote: string;
  genericError: string;
  invalidInputError: string;
  rateLimitError: string;
  pageEyebrow: string;
  pageTitle: string;
  pageDescription: string;
};

export const inviteFamilyStrings: Record<InviteFamilyLocale, InviteFamilyStrings> = {
  en: {
    heading: "Invite your family",
    subheading: "Send an email invitation to your family circle",
    recipientEmailLabel: "RECIPIENT EMAIL",
    recipientEmailPlaceholder: "email@example.com",
    yourNameLabel: "YOUR NAME",
    yourNamePlaceholder: "John Doe",
    familyNameLabel: "FAMILY NAME",
    familyNamePlaceholder: "Smith Family",
    inviteCodeLabel: "INVITE CODE",
    inviteCodePlaceholder: "ABC-123",
    languageLabel: "LANGUAGE",
    localeOptionLabels: {
      en: "English (en)",
      pt: "Português (pt)",
      es: "Español (es)",
    },
    submitLabel: "Send Invite",
    submittingLabel: "Sending…",
    successMessage: (to: string) =>
      `Invite sent to ${to} — they’ll get an email with your invite code.`,
    secureNote: "Your invite email is sent securely through our invitation service.",
    genericError: "Could not send invite. Try again.",
    invalidInputError: "Invalid input.",
    rateLimitError: "Too many requests. Try again later.",
    pageEyebrow: "FAMILY INVITES",
    pageTitle: "Your family is one invite away",
    pageDescription:
      "Enter who you want to invite and we’ll email them your family circle code. They can join in seconds from any device.",
  },
  pt: {
    heading: "Convide sua família",
    subheading: "Envie um convite por e-mail para o seu círculo familiar",
    recipientEmailLabel: "E-MAIL DO DESTINATÁRIO",
    recipientEmailPlaceholder: "email@exemplo.com",
    yourNameLabel: "SEU NOME",
    yourNamePlaceholder: "João Silva",
    familyNameLabel: "NOME DA FAMÍLIA",
    familyNamePlaceholder: "Família Silva",
    inviteCodeLabel: "CÓDIGO DO CONVITE",
    inviteCodePlaceholder: "ABC-123",
    languageLabel: "IDIOMA",
    localeOptionLabels: {
      en: "English (en)",
      pt: "Português (pt)",
      es: "Español (es)",
    },
    submitLabel: "Enviar convite",
    submittingLabel: "Enviando…",
    successMessage: (to: string) =>
      `Convite enviado para ${to} — essa pessoa receberá um e-mail com seu código de convite.`,
    secureNote: "Seu e-mail de convite é enviado com segurança pelo nosso serviço de convites.",
    genericError: "Não foi possível enviar o convite. Tente novamente.",
    invalidInputError: "Entrada inválida.",
    rateLimitError: "Muitas solicitações. Tente novamente mais tarde.",
    pageEyebrow: "CONVITES DA FAMÍLIA",
    pageTitle: "Sua família está a um convite de distância",
    pageDescription:
      "Digite quem você quer convidar e enviaremos por e-mail o código do seu círculo familiar. A pessoa pode participar em segundos, de qualquer dispositivo.",
  },
  es: {
    heading: "Invita a tu familia",
    subheading: "Envía una invitación por correo a tu círculo familiar",
    recipientEmailLabel: "CORREO DEL DESTINATARIO",
    recipientEmailPlaceholder: "correo@ejemplo.com",
    yourNameLabel: "TU NOMBRE",
    yourNamePlaceholder: "Juan Pérez",
    familyNameLabel: "APELLIDO DE LA FAMILIA",
    familyNamePlaceholder: "Familia Pérez",
    inviteCodeLabel: "CÓDIGO DE INVITACIÓN",
    inviteCodePlaceholder: "ABC-123",
    languageLabel: "IDIOMA",
    localeOptionLabels: {
      en: "English (en)",
      pt: "Português (pt)",
      es: "Español (es)",
    },
    submitLabel: "Enviar invitación",
    submittingLabel: "Enviando…",
    successMessage: (to: string) =>
      `Invitación enviada a ${to}: recibirá un correo con tu código de invitación.`,
    secureNote: "Tu correo de invitación se envía de forma segura a través de nuestro servicio.",
    genericError: "No se pudo enviar la invitación. Inténtalo de nuevo.",
    invalidInputError: "Entrada no válida.",
    rateLimitError: "Demasiadas solicitudes. Inténtalo más tarde.",
    pageEyebrow: "INVITACIONES FAMILIARES",
    pageTitle: "Tu familia está a una invitación de distancia",
    pageDescription:
      "Escribe a quién quieres invitar y le enviaremos por correo el código de tu círculo familiar. Podrá unirse en segundos desde cualquier dispositivo.",
  },
};

export function getInviteFamilyStrings(locale: string | undefined): InviteFamilyStrings {
  const normalized = typeof locale === "string" ? locale.trim().toLowerCase() : "en";
  if (normalized === "pt" || normalized === "es") return inviteFamilyStrings[normalized];
  return inviteFamilyStrings.en;
}
