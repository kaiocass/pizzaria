import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "react-toastify";

import Head from "next/head";
import styles from "./styles.module.scss";
import { Header } from "../../components/Header";

import { setupAPIClient } from "../../services/api";
import { canSSRAuth } from "../../utils/canSSRAuth";

import { FiUpload } from 'react-icons/fi';

type ItemProps = {
  id: string;
  name: string;
}

interface CategoryProps {
  categoryList: ItemProps[];
}

export default function Product({ categoryList }: CategoryProps) {

  const [avatarUrl, setAvatarUrl] = useState('');
  const [imageAvatar, setImageAvatar] = useState(null);

  const [categories, setCategories] = useState(categoryList || []);
  const [categorySelected, setCategorySelected] = useState(0);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    if(!e.target.files) {
      return;
    }

    const image = e.target.files[0];

    if(!image) {
      return;
    }

    if(image.type === 'image/jpeg' || image.type === 'image/png') {
      setImageAvatar(image);
      setAvatarUrl(URL.createObjectURL(e.target.files[0]));
    }
  }

  async function handleChangeCategory(e) {
    setCategorySelected(e.target.value);
  }
  
  async function handleRegister(e: FormEvent) {
    e.preventDefault();

    try {
      const data = new FormData();
      
      if (name === "" || 
          description === "" || 
          price === "" || 
          imageAvatar === null) {
        toast.error("Preencha todos os campos");    
        return;
      }

      data.append('name', name);
      data.append('description', description);
      data.append('price', price);
      data.append('category_id', categories[categorySelected].id);
      data.append('file', imageAvatar);

      const apiClient = setupAPIClient();
      await apiClient.post("/product", data);

      toast.success("Produto cadastrado com sucesso");

    } catch (err) {
      toast.error("Ops! Erro ao cadastrar");
    }
    
    setName("");
    setPrice("");
    setDescription("");
    setAvatarUrl("");
    setImageAvatar(null);
  }

  return (
    <>
      <Head>
        <title>Novo Produto - Sujeito Pizzaria</title>
      </Head>
      <div>
        <Header />

        <main className={styles.container}>
          <h1>Novo Produto</h1>

          <form className={styles.form} onSubmit={handleRegister}>

            <label className={styles.labelAvatar}>
              <span>
                <FiUpload size={30} color="#FFF"/>
              </span>

              <input type="file" accept="image/png, image/jpeg" onChange={handleFile} />

              {avatarUrl && (
                <img 
                  className={styles.preview}
                  src={avatarUrl} 
                  alt="Foto do produto" 
                  width={250} 
                  height={250} 
                />
              )}
            </label>

            <select value={categorySelected} onChange={handleChangeCategory}>
              { categories.map( (item, index) => {
                return (
                  <option key={item.id} value={index}>
                    { item.name }
                  </option>
                )
              }) }
            </select>

            <input
              type="text"
              placeholder="Digite o nome do produto"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Digite o preco do produto"
              className={styles.input}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <textarea 
            className={styles.input}
            placeholder="Descreva seu produto"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            />

            <button className={styles.buttonAdd} type="submit">
              Cadastrar
            </button>
          </form>
        </main>
      </div>
    </>
  );
}

export const getServerSideProps = canSSRAuth(async (ctx) => {
  
  const apiClient = setupAPIClient(ctx);
  
  const response = await apiClient.get('/category');

  return {
    props: {
      categoryList: response.data
    }
  }
})