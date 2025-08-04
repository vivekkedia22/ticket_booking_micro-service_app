import axios from "axios";
import { useState } from "react";

export default ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);
  const doRequest = async (props = {}) => {
    setErrors(null);
    try {
      console.log("this is url",url)
      console.log("this is body",body)
      const response = await axios[method](url, { ...body, ...props });
      if (onSuccess) {
        onSuccess(response.data);
      }
      return response;
    } catch (error) {
      console.log("this is error",error.message);

      // setErrors(
      //   <div className="alert alert-danger">
      //     <ul className="my-0">
      //        {error.response.data.errors.map((error, key) => {
      //         return <li key={key}>{error.message}</li>;
      //       })} 
      //     </ul>
      //   </div>
      // );
    }
  };
  return { doRequest, errors };
};
