declare module 'des.js' {

    interface Des {
        update(message: string | Buffer): number[];
    }

    export const DES: {
        create(options: { type: 'encrypt', key: Buffer }): Des;
    }
}