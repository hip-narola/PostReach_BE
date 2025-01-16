export interface GlobalConfigType {
    secrets?: { [key: string]: string };
}

export const GlobalConfig: GlobalConfigType = {};