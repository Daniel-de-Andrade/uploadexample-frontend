import React, { Component } from "react";
import { uniqueId } from "lodash";
import filesize from "filesize";

import api from "./services/api";

import GlobalStyle from "./styles/global";
import { Container, Content } from "./styles";

import Upload from "./components/Upload";
import FileList from "./components/FileList";

class App extends Component {
  // armazenar as informações dos arquivos que o usuário fez o upload no momento de uso da aplicação e anteriormente
  state = {
    uploadedFiles: [],
  };

  async componentDidMount() {
    const response = await api.get("posts");
    console.log(response);

    this.setState({
      uploadedFiles: response.data.map((file) => ({
        id: file._id,
        name: file.name,
        readableSize: filesize(file.size),
        preview: file.url,
        progress: 0,
        uploaded: true,
        error: false,
        url: file.url,
      })),
    });
  }

  handleUpload = (files) => {
    console.log(files);
    // preenche as iformações do arquivo dando erro ou não no upload
    const uploadedFiles = files.map((file) => ({
      file,
      id: uniqueId(),
      name: file.name,
      readableSize: filesize(file.size),
      preview: URL.createObjectURL(file),
      progress: 0,
      uploaded: false,
      error: false,
      url: null,
    }));

    this.setState({
      // Não se passa uploadedFiles direto, pois irá sobrepor o estado dos arquivos toda vez que o usuário fizer um upload.
      // Adicionar novos arquivos mantendo os arquivos anteriores
      uploadedFiles: this.state.uploadedFiles.concat(uploadedFiles),
    });

    uploadedFiles.forEach(this.processUpload);
  };

  updateFile = (id, data) => {
    this.setState({
      uploadedFiles: this.state.uploadedFiles.map((uploadedFile) => {
        console.log(id, uploadedFile.id);
        // Se o id do arquivo recebido de uploadedFiles for igual ao id de uploadedFile, o arquivo será atualizado. Será retornado todas as informações de uploadedFile e será sobreposto todas as informações recebidas em data. Se não, retona uploadedFile sem alterações.
        return id === uploadedFile.id
          ? { ...uploadedFile, ...data }
          : uploadedFile;
      }),
    });
  };

  processUpload = (uploadedFile) => {
    const data = new FormData();

    // append(file = nome do campo que recebe o arquivo, objeto file, nome do arquivo)
    data.append("file", uploadedFile.file, uploadedFile.name);

    api
      .post("/posts", data, {
        onUploadProgress: (e) => {
          const progress = parseInt(Math.round((e.loaded * 100) / e.total));

          this.updateFile(uploadedFile.id, {
            progress,
          });
        },
      })
      .then((response) => {
        this.updateFile(uploadedFile.id, {
          uploaded: true,
          id: response.data._id,
          url: response.data.url,
        });
      })
      .catch(() => {
        this.updateFile(uploadedFile.id, {
          error: true,
        });
      });
  };

  handleDelete = async (id) => {
    await api.delete(`posts/${id}`);

    this.setState({
      uploadedFiles: this.state.uploadedFiles.filter((file) => file.id !== id),
    });
  };

  componentWillUnmount() {
    this.state.uploadedFiles.forEach((file) =>
      URL.revokeObjectURL(file.preview)
    );
  }

  render() {
    const { uploadedFiles } = this.state;

    return (
      <Container>
        <Content>
          <Upload onUpload={this.handleUpload} />
          {/* ! retorna number, !! retorna boolean */}
          {!!uploadedFiles.length && (
            <FileList files={uploadedFiles} onDelete={this.handleDelete} />
          )}
        </Content>
        <GlobalStyle />
      </Container>
    );
  }
}

export default App;
