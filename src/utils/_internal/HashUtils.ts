export class HashUtils {
    public static hash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            // eslint-disable-next-line
            hash = ((hash << 5) - hash) + char;
            // eslint-disable-next-line
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }
}
