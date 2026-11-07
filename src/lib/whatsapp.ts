/**
 * Helper to build the single official administrator WhatsApp link.
 * Handles both usernames (e.g. @brmiki21 -> https://wa.me/brmiki21)
 * and phone numbers (e.g. +251... or 251XXXXXXXXX -> https://wa.me/251XXXXXXXXX)
 */
export function buildAdminWhatsAppLink(contactInput?: string, message?: string): string {
  const contact = contactInput?.trim() || '@brmiki21';
  if (!contact) return '';

  let baseUrl = '';

  // Check if it's a username handle (e.g. @brmiki21 or brmiki21)
  if (contact.startsWith('@') || /^[a-zA-Z]/.test(contact)) {
    const cleanUsername = contact.replace(/^@/, '').trim();
    baseUrl = `https://wa.me/${cleanUsername}`;
  } else {
    // Phone number format
    const cleanDigits = contact.replace(/[^0-9]/g, '');
    baseUrl = `https://wa.me/${cleanDigits}`;
  }

  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  return baseUrl;
}

export const DEFAULT_ADMIN_WHATSAPP = '@brmiki21';
