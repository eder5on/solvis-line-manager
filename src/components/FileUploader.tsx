"use client";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function FileUploader({
  onFiles,
}: {
  onFiles: (files: File[]) => void;
}) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFiles(acceptedFiles);
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed p-6 rounded text-center cursor-pointer"
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Solte os arquivos aqui...</p>
      ) : (
        <p>Arraste e solte arquivos ou clique para selecionar</p>
      )}
    </div>
  );
}
