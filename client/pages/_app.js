// import "bootstrap/dist/css/bootstrap.css";
// import buildClient from "../api/build-client";
// import { useState } from "react";
// import Header from "../component/Header";
// const AppComponent = ({ Component, pageProps, currentUser }) => {
//   return (
//     <div>
//       <Header currentUser={currentUser} />
//       <Component currentUser={currentUser} {...pageProps} />
//     </div>
//   );
// };
// AppComponent.getInitialProps = async (appContext) => {
//   //   console.log(appContext.ctx);
//   const client = buildClient(appContext.ctx);
//   const { data } = await client.get("/api/users/currentuser");
//   let pageProps = {};
//   if (appContext.Component.getInitialProps) {
//     pageProps = await appContext.Component.getInitialProps(appContext.ctx,client,data.currentUser);
//   }
//   console.log("this is pageprops:,", pageProps);
//   return { pageProps, currentUser: data.currentUser };
// };
// export default AppComponent;


import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../component/Header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  );
};

AppComponent.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/users/currentuser');

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      client,
      data.currentUser
    );
  }

  return {
    pageProps,
    ...data,
  };
};

export default AppComponent;
