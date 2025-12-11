/**
 * Mask email address for privacy
 * Example: nguyencongphuc@gmail.com → nguye******huc@g***.com
 */
export function maskEmail(email: string): string {
    if (!email || typeof email !== 'string') return email;

    const [localPart, domain] = email.split('@');

    if (!localPart || !domain) return email;

    // Mask local part (before @)
    // Show first 5 chars, mask middle, show last 3 chars
    let maskedLocal = localPart;
    if (localPart.length > 8) {
        const firstPart = localPart.substring(0, 5);
        const lastPart = localPart.substring(localPart.length - 3);
        maskedLocal = `${firstPart}******${lastPart}`;
    } else if (localPart.length > 4) {
        const firstPart = localPart.substring(0, 2);
        const lastPart = localPart.substring(localPart.length - 1);
        maskedLocal = `${firstPart}***${lastPart}`;
    }

    // Mask domain part (after @)
    // Show first char, mask middle, show TLD
    const [domainName, tld] = domain.split('.');
    let maskedDomain = domain;
    if (domainName && tld) {
        const firstChar = domainName.charAt(0);
        maskedDomain = `${firstChar}***.${tld}`;
    }

    return `${maskedLocal}@${maskedDomain}`;
}
