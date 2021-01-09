/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   verifyToken.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: jaeskim <jaeskim@student.42seoul.kr>       +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2021/01/09 23:14:05 by jaeskim           #+#    #+#             */
/*   Updated: 2021/01/09 23:16:08 by jaeskim          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import firebaseAdmin from "firebase-admin";
import { NowRequest, NowResponse } from "@vercel/node";
import { get42Me, get42Token } from "../src/api42";

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert({
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    projectId: process.env.FIREBASE_PROJECT_ID,
  }),
});

const updateOrCreateUser = async (
  userId: string,
  email: string,
  displayName: string,
  photoURL: string
) => {
  console.log("updating or creating a firebase user");
  const updateParams = {
    provider: "42",
    displayName,
    email,
    photoURL,
  };
  console.log(updateParams);
  try {
    return firebaseAdmin.auth().updateUser(userId, updateParams);
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      updateParams["uid"] = userId;
      return firebaseAdmin.auth().createUser(updateParams);
    }
    throw error;
  }
};

const createFirebaseToken = async (code: string) => {
  const { access_token } = await get42Token(code);
  const { id, login, email, image_url } = await get42Me(access_token);

  const userRecord = await updateOrCreateUser(
    id.toString(),
    email,
    login,
    image_url
  );
  const userId = userRecord.uid;
  console.log(`creating a custom firebase token based on uid ${userId}`);
  return firebaseAdmin.auth().createCustomToken(userId, { provider: "42" });
};

export default async (req: NowRequest, res: NowResponse) => {
  const { code } = req.body;
  if (!code)
    return res
      .status(400)
      .send({ error: "There is no token." })
      .send({ message: "Access code is a required parameter." });

  console.log(`Verifying 42 code: ${code}`);

  const firebaseToken = await createFirebaseToken(code);
  console.log(`Returning firebase token to user: ${firebaseToken}`);
  res.send({ firebase_token: firebaseToken });
};
