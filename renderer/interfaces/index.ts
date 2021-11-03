// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare global {
  interface Window {
    viewerApi: ViewerAPI;
  }
}

export type ViewerAPI = {
  putFile: (zipFilePath: string) => string[];
  getImageSource: (filePath: string) => ImageSource;
};

export type ImageSource = {
  src: string;
  width: number;
  height: number;
};
