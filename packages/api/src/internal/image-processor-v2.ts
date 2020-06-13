import { appLogger } from 'logger';

export type wishlistCap = {
  id: string;
  legend?: string;
  isPriority?: boolean;
};

export type wishlistSetting = {
  capsPerLine: number;
  title: {
    color: string;
    text: string;
    font: string;
  };
  legends: {
    color: string;
    font: string;
  };
  background: {
    color: string;
  };
  extraText: {
    text: string;
    color: string;
    font: string;
  };
};

export type wishlistV2 = {
  caps: wishlistCap[];
  settings: wishlistSetting;
};


export async function generateWishlist(opt: wishlistV2): Promise<Buffer | null> {
  return new Buffer('f');
}
