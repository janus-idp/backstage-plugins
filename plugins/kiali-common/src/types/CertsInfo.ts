export interface CertsInfo {
  secretName: string;
  secretNamespace: string;
  dnsNames: string[];
  issuer: string;
  subject: string;
  notBefore: string;
  notAfter: string;
  error: string;
  accessible: boolean;
}
