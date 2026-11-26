// Creates a customer; when the server finds a customer with the same name it
// shows SameNameCustomerModal so staff compare the profiles and choose.
// See src/components/SameNameCustomerModal.jsx for the flow and the result.
import React, { useCallback, useRef, useState } from "react";
import { customerAPI } from "../utils/api";
import { SameNameCustomerModal } from "../components/SameNameCustomerModal";

export const useCustomerCreate = () => {
  const [state, setState] = useState(null); // { payload, matches }
  const [creating, setCreating] = useState(false);
  const resolverRef = useRef(null);

  const finish = (result, error) => {
    const r = resolverRef.current;
    resolverRef.current = null;
    setState(null);
    setCreating(false);
    if (!r) return;
    if (error) r.reject(error);
    else r.resolve(result);
  };

  const createCustomer = useCallback(async (payload) => {
    try {
      const res = await customerAPI.create(payload);
      return { customer: res.data || res, existing: false };
    } catch (err) {
      const data = err?.response?.data;
      if (err?.response?.status === 409 && data?.code === "SAME_NAME_CUSTOMER" && data.sameNameCustomers?.length) {
        return new Promise((resolve, reject) => {
          resolverRef.current = { resolve, reject };
          setState({ payload, matches: data.sameNameCustomers });
        });
      }
      throw err;
    }
  }, []);

  const sameNameModal = (
    <SameNameCustomerModal
      open={Boolean(state)}
      newCustomer={state?.payload}
      matches={state?.matches || []}
      creating={creating}
      onCancel={() => finish({ cancelled: true })}
      onUseExisting={(customer) => finish({ customer, existing: true })}
      onCreateNew={async () => {
        if (creating || !state) return;
        setCreating(true);
        try {
          const res = await customerAPI.create({ ...state.payload, confirmNewCustomer: true });
          finish({ customer: res.data || res, existing: false });
        } catch (err) {
          finish(null, err);
        }
      }}
    />
  );

  return { createCustomer, sameNameModal };
};

export default useCustomerCreate;
