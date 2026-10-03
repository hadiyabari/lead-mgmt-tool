export type SendEmailInput = {
  toEmail: string;
  toName?: string | null;
  subject: string;
  bodyHtml: string;
  bodyText?: string | null;
  fromEmail?: string;
  fromName?: string;
  /** When true, never call a live provider */
  simulation?: boolean;
};

export type SendEmailResult = {
  ok: boolean;
  simulated: boolean;
  provider: 'simulation' | 'postmark';
  messageId?: string;
  error?: string;
};
