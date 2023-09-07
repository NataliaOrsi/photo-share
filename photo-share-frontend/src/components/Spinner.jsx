import React from 'react'
import { Hearts } from "react-loader-spinner";

function Spinner({ message }) {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      <Hearts
        height={50}
        width={200}
        color="#00BFFF"
        ariaLabel="hearts-loading"
        wrapperClass="justify-center"
        visible={true}
      />
      <p className="text-lg text-center px-2">{message}</p>
    </div>
  );

}

export default Spinner
