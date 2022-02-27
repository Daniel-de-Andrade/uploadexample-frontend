import React, { Component } from "react";

import Dropzone from "react-dropzone";

import { DropContainer, UploadMessage } from "./styles";

export default class Upload extends Component {
  renderDragMessage = (isDragActive, isDragReject) => {
    if (!isDragActive) {
      return <UploadMessage>Arraste arquivos aqui...</UploadMessage>;
    }

    if (isDragReject) {
      return <UploadMessage type="error">Arquivo não suportado</UploadMessage>;
    }
    // se estiver com isDragActive e não estiver com isDragReject
    return <UploadMessage type="success">Solte os arquivos aqui</UploadMessage>;
  };

  render() {
    // propriedade onUpload, que recebe a função handleUpload do component App
    const { onUpload } = this.props;

    return (
      // onDropAccepted={onUpload}, função executada toda vez que o usuário fizer um upload
      <Dropzone accept="image/*" onDropAccepted={onUpload}>
        {({ getRootProps, getInputProps, isDragActive, isDragReject }) => (
          <DropContainer
            // getRootProps, usar no elemento que terá a funcionalidade de uploado para receber um arrquivo arrastado
            {...getRootProps()}
            // simboliza quando o usuário está passando o arquivo em cima da zona de upload
            isDragActive={isDragActive}
            // simboliza quando o usuário está passando um arquivo que não é do tipo definido em acept em cima da zona de upload
            isDragReject={isDragReject}
          >
            <input {...getInputProps()} />
            {/* exibe uma mensagem de acordo com os if declarados na função renderDragMessage */}
            {this.renderDragMessage(isDragActive, isDragReject)}
          </DropContainer>
        )}
      </Dropzone>
    );
  }
}
