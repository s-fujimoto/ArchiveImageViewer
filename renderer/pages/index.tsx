import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

const IndexPage = () => {
  const [files, setFiles] = useState<string[]>([]);
  const [index, setIndex] = useState<number>(0);

  const onDrop = useCallback((acceptedFiles) => {
    const imageFiles = acceptedFiles.flatMap((file) =>
      window.viewerApi.putFile(file.path)
    );

    setFiles(imageFiles);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ['image/*', 'application/zip'],
  });

  const pageScroll = useCallback(
    (event) => {
      if (event.keyCode === 40 && index < files.length - 1) {
        setIndex(index + 1);
      } else if (event.keyCode === 38 && index > 0) {
        setIndex(index - 1);
      }
    },
    [index, files]
  );

  useEffect(() => {
    window.addEventListener('keydown', pageScroll);
    return () => {
      window.removeEventListener('keydown', pageScroll);
    };
  }, [pageScroll]);

  const getWidthAndHeight = (width: number, height: number) => {
    const windowWidth = window.innerWidth - 20;
    const windowHeight = window.innerHeight - 80;
    if (windowWidth < width && windowHeight < height) {
      if (windowWidth / width < windowHeight / height) {
        return [windowWidth, height * (windowWidth / width)];
      } else {
        return [width * (windowHeight / height), windowHeight];
      }
    } else if (windowWidth < width) {
      return [windowWidth, height * (windowWidth / width)];
    } else if (windowHeight < height) {
      return [width * (windowHeight / height), windowHeight];
    }
    return [width, height];
  };

  const slideImage = (newIndex: number) => {
    const imageSource = window.viewerApi.getImageSource(files[newIndex]);
    const [width, height] = getWidthAndHeight(
      imageSource.width,
      imageSource.height
    );
    console.log(width, height, imageSource.width, imageSource.height);
    imageSource.width = width;
    imageSource.height = height;
    return imageSource;
  };

  return (
    <section>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <p>Drag and drop some files here, or click to select files</p>
      </div>
      <aside>
        {files.length !== 0 && <img {...slideImage(index)} alt="aaa" />}
      </aside>
    </section>
  );
};

export default IndexPage;
