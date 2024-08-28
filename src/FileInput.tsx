import React from "react";

interface FileInputProps {
  onFileChange: (file: File) => void;
}

export const FileInput: React.FC<FileInputProps> = ({ onFileChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileChange(file);
    }
  };

  return (
    <div className="container">
      <label htmlFor="file-input">Загрузіть файл у форматі .zip</label>
      <input
        id="file-input"
        type="file"
        accept=".zip"
        onChange={handleChange}
      />
    </div>
  );
};
