import type { NoteLocale } from "../schemas";
import { SUPPORTED_NOTE_LOCALES } from "../schemas";

export type { NoteLocale };
export { SUPPORTED_NOTE_LOCALES };

export type NotesDictionary = {
  title: string;
  subtitle: string;
  circleLabel: string;
  sharedBadge: string;
  notesCount: string;
  noteTitleLabel: string;
  noteTitlePlaceholder: string;
  noteContentLabel: string;
  noteContentPlaceholder: string;
  authorLabel: string;
  authorPlaceholder: string;
  addButton: string;
  addingButton: string;
  emptyTitle: string;
  emptyBody: string;
  deleteButtonLabel: string;
  successMessage: string;
  deletedMessage: string;
  errors: {
    circleRequired: string;
    titleRequired: string;
    titleTooLong: string;
    contentRequired: string;
    contentTooLong: string;
    authorTooLong: string;
    noteNotFound: string;
    wrongCircle: string;
  };
};

const en: NotesDictionary = {
  title: "Shared Notes",
  subtitle: "Create and share notes with everyone in your circle-family.",
  circleLabel: "Circle",
  sharedBadge: "Shared with circle",
  notesCount: "{count} notes",
  noteTitleLabel: "Title",
  noteTitlePlaceholder: "e.g. Grocery list for the week",
  noteContentLabel: "Note",
  noteContentPlaceholder: "Write something your family should know…",
  authorLabel: "Your name (optional)",
  authorPlaceholder: "e.g. Alex",
  addButton: "Share note",
  addingButton: "Sharing…",
  emptyTitle: "No notes yet",
  emptyBody: "Be the first to share a note with your circle-family.",
  deleteButtonLabel: "Delete note",
  successMessage: "Note shared with your circle-family.",
  deletedMessage: "Note deleted.",
  errors: {
    circleRequired: "Circle-family is required.",
    titleRequired: "Enter a note title.",
    titleTooLong: "Note title is too long (max 100 characters).",
    contentRequired: "Enter note content.",
    contentTooLong: "Note content is too long (max 2000 characters).",
    authorTooLong: "Author name is too long (max 50 characters).",
    noteNotFound: "Note not found.",
    wrongCircle: "This note does not belong to your circle-family.",
  },
};

const es: NotesDictionary = {
  title: "Notas compartidas",
  subtitle: "Crea y comparte notas con todos los miembros de tu círculo familiar.",
  circleLabel: "Círculo",
  sharedBadge: "Compartido con el círculo",
  notesCount: "{count} notas",
  noteTitleLabel: "Título",
  noteTitlePlaceholder: "p. ej. Lista de compras de la semana",
  noteContentLabel: "Nota",
  noteContentPlaceholder: "Escribe algo que tu familia deba saber…",
  authorLabel: "Tu nombre (opcional)",
  authorPlaceholder: "p. ej. Alex",
  addButton: "Compartir nota",
  addingButton: "Compartiendo…",
  emptyTitle: "Aún no hay notas",
  emptyBody: "Sé la primera persona en compartir una nota con tu círculo familiar.",
  deleteButtonLabel: "Eliminar nota",
  successMessage: "Nota compartida con tu círculo familiar.",
  deletedMessage: "Nota eliminada.",
  errors: {
    circleRequired: "El círculo familiar es obligatorio.",
    titleRequired: "Escribe un título para la nota.",
    titleTooLong: "El título es demasiado largo (máx. 100 caracteres).",
    contentRequired: "Escribe el contenido de la nota.",
    contentTooLong: "El contenido es demasiado largo (máx. 2000 caracteres).",
    authorTooLong: "El nombre es demasiado largo (máx. 50 caracteres).",
    noteNotFound: "Nota no encontrada.",
    wrongCircle: "Esta nota no pertenece a tu círculo familiar.",
  },
};

const fr: NotesDictionary = {
  title: "Notes partagées",
  subtitle: "Créez et partagez des notes avec tout votre cercle familial.",
  circleLabel: "Cercle",
  sharedBadge: "Partagé avec le cercle",
  notesCount: "{count} notes",
  noteTitleLabel: "Titre",
  noteTitlePlaceholder: "p. ex. Liste de courses de la semaine",
  noteContentLabel: "Note",
  noteContentPlaceholder: "Écrivez quelque chose que votre famille doit savoir…",
  authorLabel: "Votre nom (facultatif)",
  authorPlaceholder: "p. ex. Alex",
  addButton: "Partager la note",
  addingButton: "Partage en cours…",
  emptyTitle: "Aucune note pour le moment",
  emptyBody: "Soyez la première personne à partager une note avec votre cercle familial.",
  deleteButtonLabel: "Supprimer la note",
  successMessage: "Note partagée avec votre cercle familial.",
  deletedMessage: "Note supprimée.",
  errors: {
    circleRequired: "Le cercle familial est requis.",
    titleRequired: "Saisissez un titre pour la note.",
    titleTooLong: "Le titre est trop long (100 caractères max).",
    contentRequired: "Saisissez le contenu de la note.",
    contentTooLong: "Le contenu est trop long (2000 caractères max).",
    authorTooLong: "Le nom est trop long (50 caractères max).",
    noteNotFound: "Note introuvable.",
    wrongCircle: "Cette note n'appartient pas à votre cercle familial.",
  },
};

const de: NotesDictionary = {
  title: "Geteilte Notizen",
  subtitle: "Erstelle und teile Notizen mit allen in deiner Circle-Family.",
  circleLabel: "Kreis",
  sharedBadge: "Mit dem Kreis geteilt",
  notesCount: "{count} Notizen",
  noteTitleLabel: "Titel",
  noteTitlePlaceholder: "z. B. Einkaufsliste für die Woche",
  noteContentLabel: "Notiz",
  noteContentPlaceholder: "Schreibe etwas, das deine Familie wissen sollte…",
  authorLabel: "Dein Name (optional)",
  authorPlaceholder: "z. B. Alex",
  addButton: "Notiz teilen",
  addingButton: "Wird geteilt…",
  emptyTitle: "Noch keine Notizen",
  emptyBody: "Teile als Erste:r eine Notiz mit deiner Circle-Family.",
  deleteButtonLabel: "Notiz löschen",
  successMessage: "Notiz mit deiner Circle-Family geteilt.",
  deletedMessage: "Notiz gelöscht.",
  errors: {
    circleRequired: "Circle-Family ist erforderlich.",
    titleRequired: "Gib einen Notiztitel ein.",
    titleTooLong: "Der Titel ist zu lang (max. 100 Zeichen).",
    contentRequired: "Gib einen Notizinhalt ein.",
    contentTooLong: "Der Inhalt ist zu lang (max. 2000 Zeichen).",
    authorTooLong: "Der Name ist zu lang (max. 50 Zeichen).",
    noteNotFound: "Notiz nicht gefunden.",
    wrongCircle: "Diese Notiz gehört nicht zu deiner Circle-Family.",
  },
};

const pt: NotesDictionary = {
  title: "Notas partilhadas",
  subtitle: "Cria e partilha notas com todos os membros da tua circle-family.",
  circleLabel: "Círculo",
  sharedBadge: "Partilhado com o círculo",
  notesCount: "{count} notas",
  noteTitleLabel: "Título",
  noteTitlePlaceholder: "p. ex. Lista de compras da semana",
  noteContentLabel: "Nota",
  noteContentPlaceholder: "Escreve algo que a tua família deva saber…",
  authorLabel: "O teu nome (opcional)",
  authorPlaceholder: "p. ex. Alex",
  addButton: "Partilhar nota",
  addingButton: "A partilhar…",
  emptyTitle: "Ainda não há notas",
  emptyBody: "Sê a primeira pessoa a partilhar uma nota com a tua circle-family.",
  deleteButtonLabel: "Eliminar nota",
  successMessage: "Nota partilhada com a tua circle-family.",
  deletedMessage: "Nota eliminada.",
  errors: {
    circleRequired: "A circle-family é obrigatória.",
    titleRequired: "Escreve um título para a nota.",
    titleTooLong: "O título é demasiado longo (máx. 100 caracteres).",
    contentRequired: "Escreve o conteúdo da nota.",
    contentTooLong: "O conteúdo é demasiado longo (máx. 2000 caracteres).",
    authorTooLong: "O nome é demasiado longo (máx. 50 caracteres).",
    noteNotFound: "Nota não encontrada.",
    wrongCircle: "Esta nota não pertence à tua circle-family.",
  },
};

export const notesDictionaries: Record<NoteLocale, NotesDictionary> = {
  en,
  es,
  fr,
  de,
  pt,
};

export function isSupportedNoteLocale(value: unknown): value is NoteLocale {
  return typeof value === "string" && (SUPPORTED_NOTE_LOCALES as readonly string[]).includes(value);
}

export function getNotesDictionary(locale?: unknown): NotesDictionary {
  if (isSupportedNoteLocale(locale)) return notesDictionaries[locale];
  return notesDictionaries.en;
}

export function getNoteLocale(locale?: unknown): NoteLocale {
  if (isSupportedNoteLocale(locale)) return locale;
  return "en";
}

export function formatNotesCount(dictionary: NotesDictionary, count: number): string {
  return dictionary.notesCount.replace("{count}", String(count));
}
