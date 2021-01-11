/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   verifyToken.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: jaeskim <jaeskim@student.42seoul.kr>       +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2021/01/09 23:14:05 by jaeskim           #+#    #+#             */
/*   Updated: 2021/01/11 17:00:05 by jaeskim          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { NextApiRequest, NextApiResponse } from "next";
import firebaseAdmin from "firebase-admin";
import { get42Profile, get42Token } from "../../src/api42";

if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      projectId: process.env.FIREBASE_PROJECT_ID,
    }),
    databaseURL: process.env.FIREBASE_DATABASE_ID,
  });
}

const updateOrCreateUser = async (
  userId: string,
  email: string,
  displayName: string,
  photoURL: string
) => {
  console.log("updating or creating a firebase user");
  var updateParams = {
    uid: userId,
    provider: "42",
    displayName,
    email,
    photoURL,
  };
  console.log(updateParams);
  try {
    return await firebaseAdmin.auth().updateUser(userId, updateParams);
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      return await firebaseAdmin.auth().createUser(updateParams);
    }
    throw error;
  }
};

const createFirebaseToken = async (code: string) => {
  const { access_token } = await get42Token(code);
  const { id, login, email, image_url } = await get42Profile(access_token);

  const userRecord = await updateOrCreateUser(
    id.toString(),
    email,
    login,
    image_url
  );
  const userId = userRecord.uid;
  console.log(`creating a custom firebase token based on uid ${userId}`);
  return await firebaseAdmin
    .auth()
    .createCustomToken(userId, { provider: "42" });
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  if (method === "POST") {
    const { code } = req.body;
    if (!code)
      return res.status(400).json({
        error: "There is no Code.",
        message: "Access code is a required parameter.",
      });

    console.log(`Verifying 42 code: ${code}`);
    try {
      const firebaseToken = await createFirebaseToken(code);
      console.log(`Returning firebase token to user: ${firebaseToken}`);
      res.json({ firebase_token: firebaseToken });
    } catch (error) {
      res.status(500).json({
        error: "server error 500",
        message: "Something was wrong..",
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
};
