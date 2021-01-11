/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.tsx                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: jaeskim <jaeskim@student.42seoul.kr>       +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2021/01/11 16:59:58 by jaeskim           #+#    #+#             */
/*   Updated: 2021/01/11 17:09:19 by jaeskim          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

const IndexPage = () => {
  return <SwaggerUI url={"/docs.json"} />;
};

export default IndexPage;
