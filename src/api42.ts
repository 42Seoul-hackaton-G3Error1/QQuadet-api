/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   api42.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: jaeskim <jaeskim@student.42seoul.kr>       +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2020/10/15 21:20:41 by jaeskim           #+#    #+#             */
/*   Updated: 2021/01/09 23:16:07 by jaeskim          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Axios from "axios";

const END_POINT_42API = "https://api.intra.42.fr";

export interface get42TokenData {
  access_token: string;
  expires_in: number;
  created_at: number;
}

export const get42Token = async (code: string) => {
  const {
    data: { access_token, expires_in, created_at },
  } = await Axios.post<get42TokenData>(`${END_POINT_42API}/oauth/token`, {
    grant_type: "authorization_code",
    client_id: process.env.CLIENT_ID_42,
    client_secret: process.env.CLIENT_SECRET_42,
    redirect_uri: process.env.REDIRECT_URI,
    code,
  });

  return {
    access_token,
    expires_in,
    created_at,
  };
};

export interface get42UserCursusData {
  level: number;
  grade: string | null;
  blackholed_at: string | null;
  begin_at: string;
  end_at: string | null;
  cursus: {
    name: string;
    slug: string;
  };
}

export interface projects_users {
  id: number;
  occurrence: number;
  final_mark: number;
  status: string;
  "validated?": boolean | null;
  current_team_id: number;
  project: {
    id: number;
    name: string;
    slug: string;
    parent_id: any;
  };
  cursus_ids: number[];
  marked_at: string;
  marked: boolean;
  retriable_at: string | null;
}

export interface get42MeData {
  id: number;
  email: string;
  login: string;
  first_name: string;
  last_name: string;
  url: string;
  phone: string;
  displayname: string;
  image_url: string;
  "staff?": boolean;
  correction_point: number;
  pool_month: string;
  pool_year: string;
  location: string | null;
  wallet: number;
  anonymize_date: string | null;
  campus: { id: number; name: string }[];
  projects_users: projects_users[];
  cursus_users: get42UserCursusData[];
}

export const get42Me = async (access_token: string) => {
  const { data } = await Axios.get<get42MeData>(`${END_POINT_42API}/v2/me`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  return data;
};
