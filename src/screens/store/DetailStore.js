import { useLazyQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { QUERY_SEE_STORE } from "../../apollo/queries/store";
import PageTitle from "../../components/PageTitle";
import { Loader, PageLoader } from "../../components/Loader";
import StoreItem from "../../components/StoreItem";
import Wrapper from "../../components/createStore/Wrapper";
import React, { useEffect } from "react";
import Comments from "../../components/Comments";

const DetailStore = () => {
  const { id } = useParams();
  const storeId = parseInt(id);
  const [getStore, { data, seeStoreLoading }] = useLazyQuery(QUERY_SEE_STORE, {
    variables: { id: storeId },
  });
  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      getStore();
    }
    return () => {
      isMounted = false;
    };
  }, [getStore]);

  if (seeStoreLoading) {
    return (
      <Wrapper>
        <Loader />
      </Wrapper>
    );
  }
  return (
    <Wrapper>
      <PageTitle title="STORE" />
      {seeStoreLoading && <PageLoader />}
      {!seeStoreLoading && data && data.seeStore?.store && (
        <>
          <StoreItem store={data.seeStore.store} id={storeId} />
          <Comments
            storeId={storeId}
            commentCount={data.seeStore.store.commentCount}
          />
        </>
      )}
    </Wrapper>
  );
};

export default DetailStore;
