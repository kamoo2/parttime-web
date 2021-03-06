import { useMutation } from "@apollo/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { CREATE_STORE_MUTATION } from "../../apollo/mutation/store";
import { MY_STORES_QUERY, QUERY_SEE_STORES } from "../../apollo/queries/store";
import FormError from "../../components/auth/FormError";
import Photos from "../../components/createStore/Photos";
import Wrapper from "../../components/createStore/Wrapper";
import { Loader } from "../../components/Loader";
import Content from "../../components/profile/Content";
import { PhoneRegex } from "../../regaxs";
import { store as storeC } from "react-notifications-component";

const InputItems = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(1, 1fr);
  grid-gap: 1.5rem;
  margin-bottom: 15px;
  div:nth-child(1) {
    grid-column: 1/4;
  }
  div:nth-child(2) {
    grid-column: 4/7;
  }
`;

const InputItem = styled.div`
  width: 100%;
  padding: 5px 10px;
  display: flex;
  flex-direction: column;
  label {
    font-size: 18px;
    margin-bottom: 10px;
    color: ${(props) => props.theme.fontColor};
  }
  input {
    border: 1px solid lightgray;
    border-radius: 3px;
    padding: 8px 12px;
    color: ${(props) => props.theme.fontColor};
  }
`;

const FormWrapper = styled.div`
  padding: 24px;
`;

const Group = styled.div`
  display: flex;
  align-items: center;
  span {
    margin-left: 10px;
    margin-bottom: 10px;
  }
`;

const ButtonBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 5px 10px;
  button {
    font-size: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px 24px;
    border-radius: 4px;
    background-color: ${(props) => props.theme.login.btnBgColor};
    color: ${(props) => props.theme.login.btnFontColor};
    margin-bottom: 10px;
  }
`;

const CreateStore = () => {
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });
  const [previewImages, setPreviewImages] = useState([]);
  const history = useHistory();
  const onCompleted = (data) => {
    const {
      createStore: { ok, error, store },
    } = data;
    if (ok) {
      storeC.addNotification({
        title: "???",
        message: `${store.store}??? ?????????????????????.`,
        type: "success",
        container: "top-center",
        dismiss: {
          duration: 3000,
          onScreen: true,
        },
      });
      history.push(`/store/${store.id}`);
    } else {
      setError("result", { message: error });
    }
  };
  const [createStoreMutation, { loading }] = useMutation(
    CREATE_STORE_MUTATION,
    {
      onCompleted,
      refetchQueries: [
        { query: QUERY_SEE_STORES, variables: { page: 1 } },
        { query: MY_STORES_QUERY, variables: { page: 1 } },
      ],
    }
  );
  const onSubmitValid = (data) => {
    const { store, storeNumber, rule, category, holiday, files } = data;
    if (loading) {
      return;
    }
    createStoreMutation({
      variables: {
        store,
        storeNumber,
        category,
        rule,
        holiday,
        files,
      },
    });
  };
  const handleImagePreview = (e) => {
    const fileArr = e.target.files;
    let fileURLs = [];
    let file;
    let filesLength = fileArr.length > 6 ? 6 : fileArr.length;
    for (let i = 0; i < filesLength; i++) {
      file = fileArr[i];
      let reader = new FileReader();
      reader.onload = () => {
        fileURLs[i] = reader.result;
        setPreviewImages([...fileURLs]);
      };
      reader.readAsDataURL(file);
    }
  };
  const storeNumberRef = register("storeNumber", {
    required: "??????????????? ??????????????????.",
    pattern: {
      value: PhoneRegex,
      message: "xxx-xxxx-xxxx ????????? ???????????????.",
    },
  });

  return (
    <Wrapper>
      <Content title="Create Store">
        <form onSubmit={handleSubmit(onSubmitValid)}>
          <FormWrapper>
            <InputItems>
              <InputItem>
                <label htmlFor="name">?????????</label>
                <input
                  {...register("store", {
                    required: "?????? ????????? ??????????????????.",
                  })}
                  id="name"
                  type="text"
                />
                <FormError message={errors?.store?.message} />
              </InputItem>
              <InputItem>
                <label htmlFor="number">????????????</label>
                <input
                  {...storeNumberRef}
                  id="number"
                  type="text"
                  onChange={(e) => {
                    clearErrors("result");
                    storeNumberRef.onChange(e);
                  }}
                />
                <FormError message={errors?.storeNumber?.message} />
              </InputItem>
            </InputItems>
            <InputItems>
              <InputItem>
                <label htmlFor="category">??????</label>
                <input
                  {...register("category", {
                    required: "??????????????? ??????????????????.",
                  })}
                  id="category"
                  type="text"
                />
                <FormError message={errors?.category?.message} />
              </InputItem>
              <InputItem>
                <Group>
                  <label htmlFor="rule">??????</label>
                  <span>(2??? ?????? ????????? ,??? ??????????????????)</span>
                </Group>
                <input
                  {...register("rule", { required: "????????? ??????????????????." })}
                  id="rule"
                  type="text"
                />
                <FormError message={errors?.rule?.message} />
              </InputItem>
            </InputItems>
            <InputItems>
              <InputItem>
                <Group>
                  <label htmlFor="holiday">??????</label>
                  <span>(2??? ?????? ????????? ,??? ??????????????????)</span>
                </Group>
                <input
                  {...register("holiday", { required: "????????? ??????????????????." })}
                  id="holiday"
                  type="text"
                />
                <FormError message={errors?.holiday?.message} />
              </InputItem>
              <InputItem>
                <label>Photos</label>
                <input
                  {...register("files", { required: "????????? ??????????????????" })}
                  type="file"
                  multiple
                  onChange={(e) => {
                    handleImagePreview(e);
                    setValue("files", e.target.files);
                  }}
                />
                <FormError message={errors?.files?.message} />
              </InputItem>
            </InputItems>
            <ButtonBox>
              <button type="submit">{loading ? <Loader /> : "??????"}</button>
              <FormError message={errors?.result?.message} />
            </ButtonBox>
          </FormWrapper>
        </form>
      </Content>
      {previewImages.length > 0 && (
        <Content title="Preview Photos">
          <Photos previewImages={previewImages} />
        </Content>
      )}
    </Wrapper>
  );
};

export default CreateStore;
