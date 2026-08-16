import proxy from "express-http-proxy";

/* 
  app.use(
    "/api/chat",
      protect,
      proxyWithUser(process.env.CHAT_SERVICE)
  );
*/

//protect tab chalta hai jab frontend koi protected API request Gateway ko bhejta hai. auth.controller.js ka login wala code nahi chalta har baar.
// protect will check in redis agar mil gaya session toh req.user mei daal dega
// login ke baad har protected request par protect us session ko verify karta hai.
// req.user JavaScript object Gateway ke server ki memory mein hai. Woh automatically network ke through transfer nahi hota.
// chat service mei req.user undefined hoga
// toh iss user info ko header mei daal do


export const proxyWithUser = (serviceUrl) => {
  return proxy(serviceUrl, { // proxy bas request forward kar rha
    // proxyWithUser sirf authenticated user ki information ko next service tak pahunchata hai.
    // agar chat service pe req jaani hai toh req.header mei user ki info kar rhe store
    
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {// forward hone se pehle request ko modify karne waala fn
    // srcReq : req jo gateway ko mili ( srcReq.user mei protect ke baad jo user mila )
    // proxyReqOpts : req jo gateway se aage jaani waali hai
    
      if (srcReq.user) {

        proxyReqOpts.headers["x-user-id"] =
          srcReq.user.userId;

        proxyReqOpts.headers["x-user-email"] =
          srcReq.user.email;

        proxyReqOpts.headers["x-user-avatar"] =
          srcReq.user.avatar;
      }

      return proxyReqOpts;
    }
  });
};
